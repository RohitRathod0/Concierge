import React, { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Local keyword-based fallback — fires even when backend is down
const LOCAL_FALLBACKS = {
  ipo: {
    service: 'ET IPO Tracker',
    hook_message: "While you're reading about this IPO, thousands are already tracking it live. 🚀 Don't miss the subscription window or GMP spike — it's the difference between listing gains and listing losses.",
    reason: "Track every upcoming IPO, live subscriptions, GMP, and get ET's Subscribe/Avoid verdict in real time.",
    cta: 'Track IPOs on ET', url: '/ipo', price: 'Free to track', match_score: 97,
  },
  mutual_funds: {
    service: 'ET Masterclass',
    hook_message: "This article is exactly why financial literacy matters. 🎯 Most people read the news but don't know what to DO about it. ET Masterclass changes that — expert courses that turn market insights into real money moves.",
    reason: 'Expert-led courses on investing, SIPs, tax planning — built for Indian investors.',
    cta: 'Explore ET Masterclass', url: '/masterclass', price: 'First course FREE', match_score: 90,
  },
  markets: {
    service: 'ET Prime',
    hook_message: "Feeling the tension with all this market chaos? 📊 While everyone else is guessing, ET Prime subscribers already know what's coming next. Get institutional-grade research right at your fingertips — stay ahead of 90% of retail investors.",
    reason: "Institutional-grade market research, expert calls, and real-time analysis — before anyone else.",
    cta: 'Try ET Prime Free for 7 Days', url: '/et-prime', price: 'From ₹99/month', match_score: 95,
  },
  tax: {
    service: 'ET Masterclass',
    hook_message: "Tax season stress? 📋 Most Indians overpay by ₹30,000+ simply because they don't know the right deductions. ET Masterclass has a dedicated tax-saving module that pays for itself in one filing.",
    reason: 'Tax planning courses from CAs — maximize deductions, minimize liability.',
    cta: 'Learn Tax Saving', url: '/masterclass', price: 'First course FREE', match_score: 91,
  },
  economy: {
    service: 'ET Prime',
    hook_message: "Big macro moves are happening. 🌍 Before the next rate hike or policy change hits your portfolio, be the one who knows first. ET Prime's economic briefings give you the full picture — not just headlines.",
    reason: "Exclusive economic analysis and policy deep-dives from ET's senior economists.",
    cta: 'Try ET Prime Free', url: '/et-prime', price: 'From ₹99/month', match_score: 93,
  },
};

const DEFAULT_FALLBACK = {
  service: 'ET Prime',
  hook_message: "Loving this article? 👑 ET Prime readers get 10X more depth — exclusive interviews, institutional research, and market calls that move before the market moves. The best investors in India read ET Prime every morning.",
  reason: "India's most trusted financial analysis platform — before anyone else sees it.",
  cta: 'Try ET Prime Free for 7 Days', url: '/et-prime', price: 'From ₹99/month', match_score: 92,
};

function getLocalFallback(articleCategory, articleContent) {
  const cat = (articleCategory || '').toLowerCase();
  const text = (articleContent || '').toLowerCase();
  if (cat.includes('ipo') || text.includes('ipo') || text.includes('listing')) return LOCAL_FALLBACKS.ipo;
  if (cat.includes('mutual') || text.includes('sip') || text.includes('mutual fund')) return LOCAL_FALLBACKS.mutual_funds;
  if (cat.includes('tax') || text.includes('deduction') || text.includes('80c')) return LOCAL_FALLBACKS.tax;
  if (cat.includes('economy') || cat.includes('global') || text.includes('rbi') || text.includes('gdp')) return LOCAL_FALLBACKS.economy;
  if (cat.includes('markets') || text.includes('nifty') || text.includes('sensex')) return LOCAL_FALLBACKS.markets;
  return DEFAULT_FALLBACK;
}

export default function ContextualSuggestionWidget({ articleContent = '', articleCategory = '', articleId = '' }) {
  const { token } = useAuthStore();
  const timeRef = useRef(null);
  const firedRef = useRef(false); // per-render guard (key resets this)

  useEffect(() => {
    if (!articleContent) return;
    firedRef.current = false; // reset on new article

    timeRef.current = setTimeout(async () => {
      if (firedRef.current) return;
      firedRef.current = true;

      let suggestion = null;

      // Try backend first — fail immediately if it doesn't respond
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000); // 4s hard timeout
        const resp = await fetch(`${API_URL}/api/v1/contextual/suggest`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            article_id: articleId || 'unknown',
            article_content: articleContent.slice(0, 500),
            article_category: articleCategory,
            time_spent: 31,
            scroll_depth: 0,
          }),
        });
        clearTimeout(timeout);
        if (resp.ok) {
          const data = await resp.json();
          if (data.suggestion) suggestion = data.suggestion;
        }
      } catch (e) {
        // Backend unreachable — use local fallback silently
      }

      // Always fire with local fallback if backend failed
      if (!suggestion) {
        suggestion = getLocalFallback(articleCategory, articleContent);
      }

      window.dispatchEvent(new CustomEvent('et:contextual-suggest', { detail: suggestion }));
    }, 31000);

    return () => clearTimeout(timeRef.current);
  }, [articleContent, articleCategory, articleId]);

  return null;
}

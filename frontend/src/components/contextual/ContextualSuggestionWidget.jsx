import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const EMOJI_MAP = {
  et_prime: '👑',
  masterclass: '🎓',
};

export default function ContextualSuggestionWidget({ articleContent = '', articleCategory = '', articleId = '' }) {
  const { token } = useAuthStore();
  const [suggestion, setSuggestion] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const timeRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const scrollDepthRef = useRef(0);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      scrollDepthRef.current = docHeight > 0 ? Math.round((scrolled / docHeight) * 100) : 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger suggestion after 30 seconds
  useEffect(() => {
    if (!articleContent || dismissed) return;

    timeRef.current = setTimeout(async () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      const scrollDepth = scrollDepthRef.current;

      try {
        const resp = await fetch(`${API_URL}/api/v1/contextual/suggest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            article_id: articleId || 'unknown',
            article_content: articleContent.slice(0, 500),
            article_category: articleCategory,
            time_spent: timeSpent,
            scroll_depth: scrollDepth,
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.suggestion) {
            setSuggestion(data.suggestion);
            setTimeout(() => setVisible(true), 100);
          }
        }
      } catch (e) {
        console.log('Contextual suggestion unavailable');
      }
    }, 30000); // 30 second engagement threshold

    return () => clearTimeout(timeRef.current);
  }, [articleContent, dismissed]);

  if (!suggestion || dismissed) return null;

  return (
    <div className={`fixed bottom-20 right-4 z-50 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ maxWidth: '320px' }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{suggestion.trigger_emoji || EMOJI_MAP[suggestion.category] || '💡'}</span>
            <span className="text-white text-xs font-bold">Related to what you're reading</span>
          </div>
          <button onClick={() => { setDismissed(true); setVisible(false); }} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{suggestion.service}</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">{suggestion.reason}</p>
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-sm">
            <ExternalLink className="w-3 h-3" />
            {suggestion.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

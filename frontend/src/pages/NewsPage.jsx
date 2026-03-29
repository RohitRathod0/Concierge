import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  Globe,
  TrendingUp,
  Search,
  RefreshCw,
  ExternalLink,
  Zap,
  Brain,
  ShieldAlert,
  LineChart,
  Sparkles,
  Newspaper,
  BarChart3,
  Rocket,
  Landmark,
  Bitcoin,
  Cpu,
  WalletCards,
  FileText,
  ChevronRight,
  Target,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContextualSuggestionWidget from '../components/contextual/ContextualSuggestionWidget';
import useAuthStore from '../store/authStore';
import newsHeroBg from '../assets/news-hero.jpeg';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const CATEGORIES = [
  { key: 'markets', label: 'Markets', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  { key: 'ipo', label: 'IPO', icon: Rocket, color: 'bg-purple-100 text-purple-700' },
  { key: 'mutual_funds', label: 'Mutual Funds', icon: WalletCards, color: 'bg-green-100 text-green-700' },
  { key: 'tax', label: 'Tax', icon: FileText, color: 'bg-orange-100 text-orange-700' },
  { key: 'economy', label: 'Economy', icon: Landmark, color: 'bg-yellow-100 text-yellow-700' },
  { key: 'global', label: 'Global', icon: Globe, color: 'bg-red-100 text-red-700' },
  { key: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'bg-amber-100 text-amber-700' },
  { key: 'tech', label: 'Tech', icon: Cpu, color: 'bg-cyan-100 text-cyan-700' }
];

const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.color]));

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function buildAISummary(article) {
  const title = article?.title || '';
  const desc = article?.description || '';
  const content = article?.content || '';
  const text = `${title}. ${desc}. ${content}`;

  const bullet1 = desc || 'This update may influence sentiment and short-term market reactions.';
  const bullet2 =
    text.toLowerCase().includes('ipo')
      ? 'This could affect IPO demand, pricing expectations and listing sentiment.'
      : text.toLowerCase().includes('crypto')
      ? 'This may impact crypto volatility, regulation sentiment and overall risk appetite.'
      : text.toLowerCase().includes('market') || text.toLowerCase().includes('stock')
      ? 'This may influence affected stocks, sectors and broader trading momentum.'
      : 'This update may influence allocation decisions, investor sentiment and portfolio positioning.';
  const bullet3 =
    'Key takeaway: focus on what directly affects your portfolio, sector exposure and risk profile.';

  return [bullet1, bullet2, bullet3];
}

function getWhyItMatters(article, user) {
  const risk = user?.risk_profile || user?.investment_style || 'balanced';
  const cat = article?.category?.toLowerCase() || '';

  if (cat.includes('ipo')) {
    return `This matters to you because IPO news can shape subscription demand, pricing comfort and listing gains expectations — especially for a ${risk} investor.`;
  }
  if (cat.includes('crypto')) {
    return `This matters to you because crypto updates can quickly affect volatility, sentiment and risk positioning.`;
  }
  if (cat.includes('markets')) {
    return `This matters to you because market-moving headlines can influence your watchlist, sectors and short-term opportunity zones.`;
  }
  return `This matters to you because it can affect investment decisions, timing and confidence across your financial journey.`;
}

function getRiskOpportunity(article) {
  const text = `${article?.title || ''} ${article?.description || ''} ${article?.content || ''}`.toLowerCase();

  if (text.includes('surge') || text.includes('growth') || text.includes('strong') || text.includes('upgrade')) {
    return { label: 'Opportunity Insight', tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
  }
  if (text.includes('fall') || text.includes('risk') || text.includes('warning') || text.includes('drop')) {
    return { label: 'Risk Insight', tone: 'text-rose-700 bg-rose-50 border-rose-100' };
  }
  return { label: 'Balanced Insight', tone: 'text-amber-700 bg-amber-50 border-amber-100' };
}

function getAffectedStocks(article) {
  const text = `${article?.title || ''} ${article?.description || ''}`.toLowerCase();
  const stocks = [];

  if (text.includes('hdfc')) stocks.push('HDFC Bank');
  if (text.includes('reliance')) stocks.push('Reliance');
  if (text.includes('zomato')) stocks.push('Zomato');
  if (text.includes('tcs')) stocks.push('TCS');
  if (text.includes('infosys')) stocks.push('Infosys');
  if (text.includes('sbi')) stocks.push('SBI');

  return stocks.length ? stocks : ['Sector Watch', 'Broad Market'];
}

function ArticleCard({ article, onClick }) {
  const cat = article.category?.split(' ')[0] || 'markets';
  const catColors = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600';
  const readTime = Math.max(1, Math.round((article.content?.length || 300) / 1200));
  const summary = buildAISummary(article);
  const insight = getRiskOpportunity(article);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={() => onClick(article)}
      className="bg-white/92 backdrop-blur-md border border-blue-100 rounded-3xl overflow-hidden hover:shadow-[0_18px_40px_rgba(59,130,246,0.14)] transition-all cursor-pointer group"
    >
      {article.image ? (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => (e.target.style.display = 'none')}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-sky-50 to-indigo-100 flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-blue-300" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${catColors}`}>{cat}</span>
          <span className="text-[10px] text-slate-400">{article.source?.name}</span>
          <span className="ml-auto text-[10px] text-slate-400">{timeAgo(article.publishedAt)}</span>
        </div>

        <h3 className="font-black text-slate-900 text-base leading-snug mb-2 group-hover:text-sky-700 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {article.description}
        </p>

        <div className="rounded-2xl border border-blue-100 bg-sky-50/70 p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-extrabold text-slate-900">AI Summary</span>
          </div>
          <ul className="space-y-1">
            {summary.slice(0, 2).map((point, idx) => (
              <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                • {point}
              </li>
            ))}
          </ul>
        </div>

        <div className={`rounded-xl border px-3 py-2 mb-4 text-xs font-bold ${insight.tone}`}>
          {insight.label}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1 ml-auto text-sky-600 font-semibold">
            <Zap className="w-3 h-3" />
            AI Insight Ready
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ArticleReader({ article, onBack, user }) {
  const startRef = useRef(Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [suggestionKey] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const readTime = Math.max(1, Math.round((article.content?.length || 300) / 1200));
  const cat = article.category?.split(' ')[0] || 'markets';
  const catColors = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600';
  const summary = buildAISummary(article);
  const whyItMatters = getWhyItMatters(article, user);
  const affectedStocks = getAffectedStocks(article);
  const insight = getRiskOpportunity(article);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-6">
        ← Back to News Feed
      </button>

      {/* Agent status bar */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-4">
        <Zap className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-bold text-orange-700">🤖 Contextual Cross-Sell Agent — LIVE</div>
          <div className="text-[10px] text-orange-600 mt-0.5">Monitoring reading behavior. Suggestion triggers at: 31s read time.</div>
        </div>
        <div className="flex gap-3 text-[10px] font-mono">
          <div className="bg-white rounded-lg px-2 py-1 border border-orange-200">
            <span className="text-gray-500">Time:</span>
            <span className={`ml-1 font-bold ${elapsed >= 31 ? 'text-green-600' : 'text-orange-700'}`}>{elapsed}s</span>
            {elapsed >= 31 && <span className="text-green-500 ml-1">✓</span>}
          </div>
        </div>
      </div>

      {/* Article image */}
      {article.image && (
        <img src={article.image} alt={article.title} className="w-full h-72 object-cover rounded-2xl mb-6" onError={e => e.target.style.display='none'} />
      )}
      {!article.image && (
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl mb-6 flex items-center justify-center">
          <TrendingUp className="w-16 h-16 text-blue-300" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${catColors}`}>{cat}</span>
        <span className="text-xs text-gray-500">{article.source?.name}</span>
        <span className="text-xs text-gray-400">{timeAgo(article.publishedAt)}</span>
        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto"><Clock className="w-3 h-3" />{readTime} min read</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight">{article.title}</h1>
      <p className="text-base text-gray-600 leading-relaxed mb-6 font-medium border-l-4 border-blue-400 pl-4 italic">{article.description}</p>

      {/* Content — padded out for scrolling demo */}
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
        <p>{article.content}</p>
        {/* Padding to enable scroll depth triggering */}
        <div className="h-6" />
        <p className="text-sm text-gray-600 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <strong>📊 Editor's Note:</strong> This article is powered by the ET AI Concierge's real-time news feed. The Contextual Cross-Sell Agent is actively analyzing your reading engagement. Once you've spent 31 seconds here, a personalized ET service recommendation will appear in the chatbot.
        </p>
      </div>

      {/* Source link */}
      {article.url && article.url !== '#' && (
        <a href={article.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline mt-6">
          <ExternalLink className="w-3 h-3" /> Read full article at {article.source?.name}
        </a>
      )}

      {/* Contextual Widget — real cross-sell agent */}
      <ContextualSuggestionWidget
        key={suggestionKey}
        articleContent={`${article.title} ${article.description} ${article.content}`}
        articleCategory={cat}
        articleId={article.id}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,23,45,0.84)_0%,rgba(9,28,52,0.76)_20%,rgba(230,241,255,0.90)_52%,rgba(245,249,255,0.97)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white hover:text-blue-100 font-semibold mb-6"
        >
          ← Back to News Feed
        </button>

        <div className="bg-white/85 backdrop-blur-md border border-blue-100 rounded-2xl px-4 py-3 mb-6 flex items-center gap-4 shadow-sm">
          <Zap className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-bold text-sky-700">AI News Assistant — LIVE</div>
            <div className="text-[10px] text-sky-600 mt-0.5">
              Monitoring reading behavior. Suggestions trigger after 30s read time and 25% scroll depth.
            </div>
          </div>
          <div className="flex gap-3 text-[10px] font-mono">
            <div className="bg-white rounded-lg px-2 py-1 border border-blue-100">
              <span className="text-slate-500">Time:</span>
              <span className={`ml-1 font-bold ${elapsed >= 30 ? 'text-emerald-600' : 'text-sky-700'}`}>{elapsed}s</span>
            </div>
            <div className="bg-white rounded-lg px-2 py-1 border border-blue-100">
              <span className="text-slate-500">Scroll:</span>
              <span className={`ml-1 font-bold ${scrollDepth >= 25 ? 'text-emerald-600' : 'text-sky-700'}`}>{scrollDepth}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-72 object-cover rounded-3xl mb-6 border border-blue-100"
                onError={(e) => (e.target.style.display = 'none')}
              />
            ) : (
              <div className="w-full h-56 bg-white/85 backdrop-blur-md rounded-3xl mb-6 flex items-center justify-center border border-blue-100">
                <TrendingUp className="w-16 h-16 text-blue-300" />
              </div>
            )}

            <div className="bg-white/88 backdrop-blur-md rounded-3xl border border-blue-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${catColors}`}>{cat}</span>
                <span className="text-xs text-slate-500">{article.source?.name}</span>
                <span className="text-xs text-slate-400">{timeAgo(article.publishedAt)}</span>
                <span className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                  <Clock className="w-3 h-3" />
                  {readTime} min read
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-3 leading-tight">{article.title}</h1>
              <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium border-l-4 border-sky-400 pl-4 italic">
                {article.description}
              </p>

              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4">
                <p>{article.content}</p>
                <div className="h-6" />
                <p className="text-sm text-slate-600 bg-sky-50 rounded-xl p-4 border border-blue-100">
                  <strong>AI Reader Note:</strong> This article is being analyzed to surface what matters most for your interests and portfolio context.
                </p>
                <div className="h-40 bg-gradient-to-b from-transparent to-slate-50 rounded-xl flex items-end justify-center pb-6">
                  <p className="text-xs text-slate-400 animate-pulse">
                    Keep scrolling to trigger contextual suggestion...
                  </p>
                </div>
              </div>

              {article.url && article.url !== '#' && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-sky-600 hover:underline mt-6"
                >
                  <ExternalLink className="w-3 h-3" />
                  Read full article at {article.source?.name}
                </a>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-5">
            <div className="rounded-3xl bg-white/88 backdrop-blur-md border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-slate-900">AI Summary</h3>
              </div>
              <ul className="space-y-2">
                {summary.map((point, idx) => (
                  <li key={idx} className="text-sm text-slate-600 leading-relaxed">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white/88 backdrop-blur-md border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900">Why this matters to you</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{whyItMatters}</p>
            </div>

            <div className="rounded-3xl bg-white/88 backdrop-blur-md border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900">Stocks affected</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {affectedStocks.map((stock, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-blue-100"
                  >
                    {stock}
                  </span>
                ))}
              </div>
            </div>

            <div className={`rounded-3xl border p-5 shadow-sm ${insight.tone}`}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-extrabold">Risk / Opportunity Insight</h3>
              </div>
              <p className="text-sm">
                {insight.label === 'Opportunity Insight'
                  ? 'This update may create positive sentiment or near-term opportunity in affected names or sectors.'
                  : insight.label === 'Risk Insight'
                  ? 'This update may require caution, especially if you have exposure to affected sectors or riskier assets.'
                  : 'This update looks mixed. Watch for confirmation before making high-conviction decisions.'}
              </p>
            </div>
          </div>
        </div>

        <ContextualSuggestionWidget
          key={suggestionKey}
          articleContent={`${article.title} ${article.description} ${article.content}`}
          articleCategory={cat}
          articleId={article.id}
        />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('markets');
  const [selected, setSelected] = useState(null);
  const [apiSource, setApiSource] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { user } = useAuthStore();

  const fetchNews = async (cat, q = '', forceRefresh = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: cat });
      if (q) params.set('q', q);
      if (forceRefresh) params.set('force_refresh', 'true');
      const resp = await fetch(`${API_URL}/api/v1/news/feed?${params}`);
      if (resp.ok) {
        const data = await resp.json();
        setArticles(data.articles || []);
        setApiSource(data.source);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews(category, searchQ);
  }, [category, searchQ]);

  const heroInsights = useMemo(
    () => [
      {
        icon: <Brain className="w-5 h-5 text-sky-600" />,
        title: 'AI Summaries',
        desc: 'Long stories reduced into quick, readable key points.'
      },
      {
        icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
        title: 'What matters to me',
        desc: 'Personalized relevance based on your interests like stocks, IPOs and crypto.'
      },
      {
        icon: <LineChart className="w-5 h-5 text-emerald-600" />,
        title: 'Trend Clarity',
        desc: 'Understand portfolio impact, stocks affected and opportunity vs risk.'
      }
    ],
    []
  );

  if (selected) {
    return <ArticleReader article={selected} onBack={() => setSelected(null)} user={user} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">📰 ET Financial News</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dynamic news feed • Contextual Cross-Sell Agent demo</p>
        </div>
        <div className="flex items-center gap-2">
          {apiSource && (
            <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${apiSource === 'gnews' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {apiSource === 'gnews' ? '🟢 LIVE via GNews' : '📋 Curated Fallback'}
            </div>
          )}
          <button onClick={() => fetchNews(category, searchQ, true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg text-xs transition-colors border border-blue-200">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh News
          </button>
        </div>
      </div>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {heroInsights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-blue-100 bg-white/88 backdrop-blur-md p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white">ET Financial News</h2>
            <p className="text-sm text-blue-100 mt-1">
              Personalized financial news with AI-powered summaries and portfolio context
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-orange-100">
            <div className="text-lg mb-1">2️⃣</div>
            <strong>Read for 31 seconds.</strong> The live status bar shows your progress in real-time.
          </div>
          <div className="bg-white rounded-xl p-3 border border-orange-100">
            <div className="text-lg mb-1">3️⃣</div>
            <strong>Agent fires!</strong> A personalized ET service suggestion slides into the chatbot, matched to the article's financial topic.
          </div>
        </div>
      </div>
    </div>
  );
}
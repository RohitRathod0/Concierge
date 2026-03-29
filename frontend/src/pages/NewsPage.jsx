import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Globe, TrendingUp, Search, Bookmark, RefreshCw, ExternalLink, Zap } from 'lucide-react';
import ContextualSuggestionWidget from '../components/contextual/ContextualSuggestionWidget';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const CATEGORIES = [
  { key: 'markets', label: '📈 Markets', color: 'bg-blue-100 text-blue-700' },
  { key: 'ipo', label: '🚀 IPO', color: 'bg-purple-100 text-purple-700' },
  { key: 'mutual_funds', label: '💰 Mutual Funds', color: 'bg-green-100 text-green-700' },
  { key: 'tax', label: '🧾 Tax', color: 'bg-orange-100 text-orange-700' },
  { key: 'economy', label: '🏦 Economy', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'global', label: '🌍 Global', color: 'bg-red-100 text-red-700' },
  { key: 'crypto', label: '₿ Crypto', color: 'bg-amber-100 text-amber-700' },
  { key: 'tech', label: '🤖 Tech', color: 'bg-cyan-100 text-cyan-700' },
];

const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map(c => [c.key, c.color]));

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

function ArticleCard({ article, onClick }) {
  const cat = article.category?.split(' ')[0] || 'markets';
  const catColors = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600';
  const readTime = Math.max(1, Math.round((article.content?.length || 300) / 1200));

  return (
    <div
      onClick={() => onClick(article)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      {/* Article Image */}
      {article.image ? (
        <img src={article.image} alt={article.title} className="w-full h-44 object-cover" onError={e => e.target.style.display='none'} />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-blue-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${catColors}`}>{cat}</span>
          <span className="text-[10px] text-gray-400">{article.source?.name}</span>
          <span className="ml-auto text-[10px] text-gray-400">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{article.description}</p>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min read</span>
          <span className="flex items-center gap-1 ml-auto text-blue-500 font-semibold">
            <Zap className="w-3 h-3" /> AI Cross-Sell Active
          </span>
        </div>
      </div>
    </div>
  );
}

function ArticleReader({ article, onBack }) {
  const startRef = useRef(Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [suggestionKey, setSuggestionKey] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.round((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const readTime = Math.max(1, Math.round((article.content?.length || 300) / 1200));
  const cat = article.category?.split(' ')[0] || 'markets';
  const catColors = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600';

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

  useEffect(() => { fetchNews(category, searchQ); }, [category, searchQ]);

  if (selected) {
    return <ArticleReader article={selected} onBack={() => setSelected(null)} />;
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



      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearchQ(searchInput)}
          placeholder="Search financial news... (e.g. Zomato IPO, HDFC Bank, SIP)"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white shadow-sm"
        />
        {searchInput && (
          <button onClick={() => { setSearchQ(searchInput); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md font-medium">
            Search
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => { setCategory(c.key); setSearchQ(''); setSearchInput(''); }}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${category === c.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">📰</div>
          <p className="text-gray-500 font-medium">No articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, i) => (
            <ArticleCard key={article.id || i} article={article} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Explainer box */}
      <div className="mt-10 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500" /> How the Contextual Agent Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="bg-white rounded-xl p-3 border border-orange-100">
            <div className="text-lg mb-1">1️⃣</div>
            <strong>Click any article</strong> to open the reader view. The agent starts tracking your time and scroll position.
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

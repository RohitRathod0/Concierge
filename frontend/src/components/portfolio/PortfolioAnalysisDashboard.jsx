import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ExternalLink, 
  PlusCircle, ChevronDown, ChevronUp, Globe, BarChart2, Briefcase, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const SEVERITY_COLORS = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ACTION_COLORS = {
  'HOLD': 'text-green-600 bg-green-50',
  'BUY MORE': 'text-blue-700 bg-blue-50',
  'HOLD / BUY MORE': 'text-blue-700 bg-blue-50',
  'BOOK PARTIAL PROFITS': 'text-orange-700 bg-orange-50',
  'CONSIDER EXIT': 'text-red-700 bg-red-50',
  'REVIEW / SELL': 'text-red-700 bg-red-50',
};

function SectorPieBar({ allocation }) {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-400', 'bg-gray-400'];
  const entries = Object.entries(allocation);
  return (
    <div className="space-y-2">
      {entries.map(([sec, pct], i) => (
        <div key={sec} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
          <span className="text-xs text-gray-700 flex-1">{sec}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-700 w-10 text-right">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioAnalysisDashboard() {
  const { token } = useAuthStore();
  const [stocks, setStocks] = useState([{ symbol: '', quantity: '', avg_price: '' }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandMacro, setExpandMacro] = useState(false);

  const addStock = () => setStocks([...stocks, { symbol: '', quantity: '', avg_price: '' }]);
  const removeStock = (i) => setStocks(stocks.filter((_, idx) => idx !== i));

  const updateStock = (i, field, value) => {
    const updated = [...stocks];
    updated[i][field] = value;
    setStocks(updated);
  };

  const handleAnalyze = async () => {
    const validStocks = stocks.filter(s => s.symbol && s.quantity && s.avg_price);
    if (!validStocks.length) { setError('Add at least one complete stock entry.'); return; }

    setLoading(true); setError(''); setResult(null);
    try {
      const resp = await fetch(`${API_URL}/api/v1/portfolio/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          stocks: validStocks.map(s => ({ symbol: s.symbol.toUpperCase().includes('.') ? s.symbol.toUpperCase() : s.symbol.toUpperCase() + '.NS', quantity: parseInt(s.quantity), average_price: parseFloat(s.avg_price) })),
          generate_macro: true
        })
      });
      if (!resp.ok) { const e = await resp.json(); throw new Error(e.detail || 'Analysis failed'); }
      setResult(await resp.json());
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const fmt = (n) => n ? '₹' + parseFloat(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Portfolio Gap Analyzer</h2>
          <p className="text-sm text-gray-500">AI-powered analysis with geopolitical macro insights</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-600" /> Enter Your Holdings</h3>
        <div className="space-y-3">
          {stocks.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={s.symbol} onChange={e => updateStock(i, 'symbol', e.target.value)} placeholder="Symbol (e.g. RELIANCE)" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 uppercase" />
              <input value={s.quantity} onChange={e => updateStock(i, 'quantity', e.target.value)} placeholder="Qty" type="number" className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <input value={s.avg_price} onChange={e => updateStock(i, 'avg_price', e.target.value)} placeholder="Avg ₹" type="number" className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              {stocks.length > 1 && <button onClick={() => removeStock(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={addStock} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"><PlusCircle className="w-4 h-4" /> Add Stock</button>
          <button onClick={handleAnalyze} disabled={loading} className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
            {loading ? 'Analyzing...' : '🔍 Analyze Portfolio'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>

      {result && (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Invested', value: fmt(result.summary.total_investment), icon: '💰' },
              { label: 'Current Value', value: fmt(result.summary.current_value), icon: '📊' },
              { label: result.summary.gain_loss >= 0 ? 'Total Gain' : 'Total Loss', value: fmt(Math.abs(result.summary.gain_loss)), color: result.summary.gain_loss >= 0 ? 'text-green-600' : 'text-red-600', icon: result.summary.gain_loss >= 0 ? '📈' : '📉' },
              { label: 'Risk Score', value: `${result.summary.risk_score}/100`, color: result.summary.risk_score > 60 ? 'text-red-600' : result.summary.risk_score > 30 ? 'text-orange-600' : 'text-green-600', icon: '⚡' },
            ].map((m, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className={`text-xl font-extrabold ${m.color || 'text-gray-900'}`}>{m.value}</div>
                <div className="text-xs text-gray-500 font-medium">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector Allocation */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Sector Allocation</h3>
              <SectorPieBar allocation={result.sector_allocation} />
              <div className="mt-3 flex items-center gap-2">
                <div className="text-sm text-gray-500">Diversification Score:</div>
                <div className="text-sm font-extrabold text-blue-600">{result.summary.diversification_score}/100</div>
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">⚠️ Portfolio Gaps</h3>
              {result.gaps.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-sm font-medium">No major gaps found!</span></div>
              ) : (
                <div className="space-y-3">
                  {result.gaps.map((g, i) => (
                    <div key={i} className={`border rounded-xl p-3 text-sm ${SEVERITY_COLORS[g.severity]}`}>
                      <div className="font-bold mb-1">{g.description}</div>
                      <div className="opacity-80 text-xs">{g.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock by Stock */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">📦 Stock-by-Stock Insights</h3>
            <div className="divide-y divide-gray-100">
              {result.stocks.map((s, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{s.name} <span className="text-gray-400 font-normal text-xs">({s.symbol})</span></div>
                    <div className="text-xs text-gray-500">{s.sector} · P/E: {s.pe_ratio ? s.pe_ratio.toFixed(1) : 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">₹{s.current_price?.toFixed(2)}</div>
                    <div className={`text-xs font-bold ${s.gain_loss_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.gain_loss_pct >= 0 ? '+' : ''}{s.gain_loss_pct?.toFixed(1)}%
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-bold ${ACTION_COLORS[s.action] || 'text-gray-700 bg-gray-100'}`}>
                    {s.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Report */}
          {result.macro_report && (
            <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl shadow-xl p-6 text-white">
              <button className="flex items-center gap-2 w-full" onClick={() => setExpandMacro(!expandMacro)}>
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-lg">🌍 Global Macro & Geopolitical Analysis</span>
                <span className="ml-auto">{expandMacro ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
              </button>
              {expandMacro && (
                <div className="mt-4 text-gray-200 text-sm leading-relaxed whitespace-pre-line border-t border-gray-700 pt-4">
                  {result.macro_report}
                </div>
              )}
              {!expandMacro && (
                <div className="mt-2 text-gray-400 text-xs">Click to expand AI-generated geopolitical analysis for your portfolio</div>
              )}
            </div>
          )}

          {/* Cross-Sell Section */}
          {result.cross_sells && result.cross_sells.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">💡 Grow Your Portfolio With ET</h3>
              {result.cross_sells.map((cs, i) => (
                <div key={i} className="space-y-2">
                  {cs.et_prime && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-xl">👑</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 font-medium">{cs.et_prime}</div>
                        <button className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg">Get ET Prime</button>
                      </div>
                    </div>
                  )}
                  {cs.masterclass && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                      <span className="text-xl">🎓</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 font-medium">{cs.masterclass}</div>
                        <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg">Browse Masterclasses</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

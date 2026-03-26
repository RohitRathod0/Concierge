import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ipoService } from '../services/api/ipoService';
import PageSkeleton from '../components/common/PageSkeleton';

const IPODetailPage = () => {
  const { ipoId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const isAuthenticated = !!token;
  const { user } = useAuthStore();
  
  const [ipo, setIpo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ipoService.getIPOById(ipoId)
      .then(data => {
        setIpo(data);
        setError(null);
      })
      .catch(err => setError('Failed to load IPO details.'))
      .finally(() => setLoading(false));
  }, [ipoId]);

  const handleAlert = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/ipo/${ipoId}`);
    try {
      if (ipo.user_has_alert) {
        await ipoService.removeAlert(ipoId);
        setIpo({...ipo, user_has_alert: false});
      } else {
        await ipoService.setAlert(ipoId);
        setIpo({...ipo, user_has_alert: true});
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <PageSkeleton />;
  if (error || !ipo) return <div className="p-8 text-center text-red-600 font-bold">{error || 'Not found'}</div>;

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    upcoming: 'bg-blue-100 text-blue-800',
    listed: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const hasDematAccount = user?.has_demat_account;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button onClick={() => navigate('/ipo')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        IPO Hub
      </button>

      {/* Hero */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{ipo.company_name}</h1>
            <span className={`text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${statusColors[ipo.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>{ipo.status}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-gray-100 px-2.5 py-1 rounded font-medium border border-gray-200">{ipo.sector}</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">ET Form Rating:</span>
              <span className="text-yellow-500 font-bold">{ipo.et_rating || 3} / 5</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
          {ipo.status !== 'listed' && (
            <button 
              onClick={handleAlert}
              className={`px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center gap-1 ${ipo.user_has_alert ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-700 border border-green-200 hover:border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
            >
              {ipo.user_has_alert ? 'Alert Set ✓' : 'Set Alert 🔔'}
            </button>
          )}
          {ipo.status === 'open' && (
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-bold shadow hover:bg-orange-600 transition-colors text-sm">
              Apply via Demat
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
          <p className="text-gray-500 text-xs font-medium mb-1">Price Band</p>
          <p className="text-lg font-bold text-gray-900">₹{ipo.price_band_low} - ₹{ipo.price_band_high}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
          <p className="text-gray-500 text-xs font-medium mb-1">Issue Size</p>
          <p className="text-lg font-bold text-gray-900">₹{ipo.issue_size_cr} Cr</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
          <p className="text-gray-500 text-xs font-medium mb-1">Lot Size</p>
          <p className="text-lg font-bold text-gray-900">{ipo.lot_size} Shares</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
          <p className="text-gray-500 text-xs font-medium mb-1">Min Investment</p>
          <p className="text-lg font-bold text-gray-900">₹{ipo.min_investment}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* GMP and Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-green-800 mb-3 uppercase tracking-wider">Estimated GMP</h3>
              {ipo.status === 'listed' ? (
                <>
                  <p className="text-3xl font-bold text-green-700">{ipo.listing_gain_percent > 0 ? '+' : ''}{ipo.listing_gain_percent}%</p>
                  <p className="text-sm text-green-600 mt-2 font-medium">Listing price: ₹{ipo.listing_price}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-700">{ipo.gmp_premium > 0 ? `+₹${ipo.gmp_premium}` : 'N/A'}</p>
                  <p className="text-sm text-green-600 font-medium mt-2">{ipo.gmp_percent ? `Est. listing gain: ${ipo.gmp_percent}%` : 'Data not available'}</p>
                </>
              )}
              <div className="mt-4 p-2 bg-white/70 rounded border border-green-100/50">
                <p className="text-[10px] text-green-600/80 uppercase tracking-wide font-semibold text-center mt-0.5">Grey market data is indicative, not guaranteed.</p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ET Verdict
              </h3>
              <p className="text-sm text-gray-800 font-medium italic leading-relaxed flex-grow pr-2">"{ipo.et_verdict}"</p>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">About the Company</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{ipo.about}</p>
          </div>

          {/* Strengths and Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 text-green-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Strengths
              </h3>
              <ul className="space-y-3">
                {(ipo.strengths || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2.5">
                    <span className="text-green-500 mt-0.5">•</span> 
                    <span className="leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 text-red-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Risks
              </h3>
              <ul className="space-y-3">
                {(ipo.risks || []).map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5">•</span> 
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider border-b border-gray-100 pb-3">IPO Timeline</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${ipo.status !== 'upcoming' ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`}></div>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Bidding Opens</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{ipo.open_date ? new Date(ipo.open_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'TBD'}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 ml-1.5 -mt-3 mb-1"></div>
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${['closed','listed'].includes(ipo.status) ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`}></div>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Bidding Closes</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{ipo.close_date ? new Date(ipo.close_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'TBD'}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 ml-1.5 -mt-3 mb-1"></div>
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${ipo.status === 'listed' ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`}></div>
                <div className="pt-0.5">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Listing Date</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'TBD'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Demat Cross-sell */}
          {ipo.status === 'open' && !hasDematAccount && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-100/50 rounded-full blur-xl"></div>
              <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-blue-100/50 rounded-full blur-xl"></div>
              
              <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm relative z-10 border border-indigo-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 relative z-10">Ready to Invest?</h3>
              <p className="text-xs text-indigo-700 mb-5 leading-relaxed relative z-10 px-2">Open a free Demat account in 5 minutes to apply for this IPO directly from ET Concierge.</p>
              <button className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg relative z-10">
                Open Demat Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPODetailPage;

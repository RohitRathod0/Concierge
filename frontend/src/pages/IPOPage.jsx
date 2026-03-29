import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ipoService } from '../services/api/ipoService';
import IPOCard from '../components/ipo/IPOCard';
import PageSkeleton from '../components/common/PageSkeleton';

const IPOPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusCounts, setStatusCounts] = useState({ open: 0, upcoming: 0, closed: 0, listed: 0 });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIPOs(activeTab);
  }, [activeTab]);

  async function fetchIPOs(status) {
    setLoading(true);
    try {
      const data = await ipoService.getIPOList({ status: status === 'all' ? undefined : status });
      setIpos(data.ipos || []);
      setStatusCounts(data.status_counts || { open: 0, upcoming: 0, closed: 0, listed: 0 });
      setError(null);
    } catch (e) {
      setError('Failed to load IPOs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'all', label: `All (${(statusCounts.open || 0) + (statusCounts.upcoming || 0) + (statusCounts.closed || 0) + (statusCounts.listed || 0)})` },
    { id: 'open', label: `Open (${statusCounts.open || 0}) 🔴` },
    { id: 'upcoming', label: `Upcoming (${statusCounts.upcoming || 0})` },
    { id: 'listed', label: `Recently Listed (${statusCounts.listed || 0})` }
  ];

  const hasDematAccount = user?.has_demat_account === true;
  const openIpos = ipos.filter(i => i.status === 'open');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <button onClick={() => navigate('/services')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Services / IPO Hub
        </button>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">IPO Hub</h1>
        <p className="mt-2 text-lg text-gray-600">Track, evaluate and invest in upcoming IPOs with AI guidance</p>
      </div>

      {/* Open IPO Banner */}
      {openIpos.length > 0 && activeTab === 'all' && (
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between">
          <div>
            <span className="inline-block bg-white text-red-600 text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-widest">LIVE NOW</span>
            <h2 className="text-xl font-bold mb-1">IPO OPEN: {openIpos[0].company_name}</h2>
            <p className="text-white/90">GMP: +₹{openIpos[0].gmp_premium} • Min Invest: ₹{openIpos[0].min_investment}</p>
          </div>
          <button 
            onClick={() => navigate(`/ipo/${openIpos[0].id}`)}
            className="mt-4 md:mt-0 bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors shadow-sm"
          >
            View Details
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 flex space-x-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {error && (
        <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-red-700 flex flex-col items-center">
          <p className="mb-3">{error}</p>
          <button onClick={() => fetchIPOs(activeTab)} className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded font-medium hover:bg-red-100">Try Again</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 h-80 animate-pulse flex flex-col">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
             </div>
          ))}
        </div>
      ) : ipos.length === 0 && !error ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No IPOs found</h3>
          <p className="text-gray-500">No IPOs in this category right now. Check back soon.</p>
          {activeTab !== 'all' && (
            <button onClick={() => setActiveTab('all')} className="mt-4 text-orange-600 font-medium hover:text-orange-700">
              View All IPOs
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ipos.map(ipo => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
      )}

      {/* Demat Cross-sell */}
      {!hasDematAccount && !loading && (
        <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Apply for IPOs directly</h3>
            <p className="text-indigo-700">Open a free Demat account in 5 minutes to start investing in IPOs.</p>
          </div>
          <button className="whitespace-nowrap bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition shadow-sm">
            Open Demat Account
          </button>
        </div>
      )}
    </div>
  );
};

export default IPOPage;

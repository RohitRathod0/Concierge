import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ipoService } from '../services/api/ipoService';
import IPOCard from '../components/ipo/IPOCard';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Brain,
  CircleDollarSign,
  CalendarClock,
  BadgeCheck,
  ChevronRight,
  LineChart,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

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
      const data = await ipoService.getIPOList({
        status: status === 'all' ? undefined : status
      });
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
    {
      id: 'all',
      label: `All (${(statusCounts.open || 0) + (statusCounts.upcoming || 0) + (statusCounts.closed || 0) + (statusCounts.listed || 0)})`
    },
    { id: 'open', label: `Open (${statusCounts.open || 0})` },
    { id: 'upcoming', label: `Upcoming (${statusCounts.upcoming || 0})` },
    { id: 'listed', label: `Recently Listed (${statusCounts.listed || 0})` }
  ];

  const hasDematAccount = user?.has_demat_account === true;
  const openIpos = ipos.filter((i) => i.status === 'open');

  const selectedSpotlightIPO = useMemo(() => {
    if (openIpos.length > 0) return openIpos[0];
    if (ipos.length > 0) return ipos[0];
    return null;
  }, [openIpos, ipos]);

  const userRiskLabel =
    user?.risk_profile || user?.risk_appetite || user?.investment_style || 'Balanced';

  const aiSuggestions = [
    {
      icon: <Brain className="w-5 h-5 text-sky-600" />,
      title: 'Should you invest in this IPO?',
      desc: 'Use AI-guided analysis to understand whether an IPO matches your risk profile and goals.'
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      title: 'Expected listing gains',
      desc: 'See quick signals based on demand, GMP trends and category sentiment.'
    },
    {
      icon: <LineChart className="w-5 h-5 text-indigo-600" />,
      title: 'Long-term vs short-term potential',
      desc: 'Understand if the opportunity looks better for listing gains or longer holding.'
    }
  ];

  const explainers = [
    {
      icon: <BadgeCheck className="w-5 h-5 text-sky-700" />,
      title: 'High Potential IPOs',
      desc: 'Strong fundamentals, healthy demand and attractive sector outlook.'
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
      title: 'Risky IPOs',
      desc: 'Premium pricing, weak fundamentals or uncertain business visibility.'
    },
    {
      icon: <CircleDollarSign className="w-5 h-5 text-emerald-700" />,
      title: 'Simple IPO Guidance',
      desc: 'We explain IPOs in plain language so you can make clearer decisions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-[#eef6ff] to-[#e9f3ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-5">
          <button
            onClick={() => navigate('/financial-services')}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Services / IPO Hub
          </button>
        </nav>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-r from-sky-100 via-white to-indigo-100 shadow-[0_20px_70px_rgba(59,130,246,0.12)] mb-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />

          <div className="relative px-6 md:px-8 py-8 md:py-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-blue-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-sky-700 shadow-sm mb-5">
              <Sparkles className="w-4 h-4" />
              AI-assisted IPO intelligence
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  IPO Hub for smarter, data-backed investing
                </h1>
                <p className="mt-4 text-slate-600 text-base md:text-lg max-w-3xl leading-relaxed">
                  Track upcoming and ongoing IPOs, understand company fundamentals,
                  compare opportunity vs risk, and get AI-guided suggestions that help
                  reduce confusion around IPO investing.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-white/90 border border-blue-100 px-4 py-3 shadow-sm">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Your Risk Profile</div>
                    <div className="text-sm font-black text-sky-700">{userRiskLabel}</div>
                  </div>
                  <div className="rounded-2xl bg-white/90 border border-blue-100 px-4 py-3 shadow-sm">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Open IPOs</div>
                    <div className="text-sm font-black text-emerald-600">{statusCounts.open || 0}</div>
                  </div>
                  <div className="rounded-2xl bg-white/90 border border-blue-100 px-4 py-3 shadow-sm">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Upcoming IPOs</div>
                    <div className="text-sm font-black text-indigo-600">{statusCounts.upcoming || 0}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-3xl border border-blue-100 bg-white/85 backdrop-blur-md p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-sky-700" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900">AI IPO Guidance</h3>
                      <p className="text-xs text-slate-500">Personalized for your profile</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    We help you understand whether an IPO may be better suited for listing gains,
                    long-term holding, or cautious avoidance.
                  </p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:gap-2 transition-all"
                  >
                    Ask Eva about IPOs <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight Banner */}
        {selectedSpotlightIPO && (
          <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 p-6 text-white shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 bg-white text-blue-700 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {selectedSpotlightIPO.status === 'open' ? 'Live now' : 'Spotlight'}
                </span>

                <h2 className="text-2xl md:text-3xl font-black leading-tight">
                  {selectedSpotlightIPO.company_name}
                </h2>

                <p className="mt-2 text-blue-100 text-sm md:text-base max-w-2xl">
                  AI highlight: This IPO can be reviewed for listing potential, demand strength,
                  pricing comfort and fit with your personal investment profile.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">
                    GMP: +₹{selectedSpotlightIPO.gmp_premium ?? 'N/A'}
                  </div>
                  <div className="bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold">
                    Min Invest: ₹{selectedSpotlightIPO.min_investment ?? 'N/A'}
                  </div>
                  <div className="bg-white/15 rounded-xl px-4 py-2 text-sm font-semibold capitalize">
                    Status: {selectedSpotlightIPO.status}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/ipo/${selectedSpotlightIPO.id}`)}
                  className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="bg-white/15 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition"
                >
                  Ask Eva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart suggestion cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {aiSuggestions.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-8 rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-md p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Explainers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {explainers.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-blue-100 bg-white/85 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {error && (
          <div className="bg-red-50 p-6 border border-red-200 rounded-2xl text-red-700 flex flex-col items-center shadow-sm">
            <AlertTriangle className="w-8 h-8 mb-3" />
            <p className="mb-3 font-medium">{error}</p>
            <button
              onClick={() => fetchIPOs(activeTab)}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white border border-blue-100 rounded-2xl p-5 h-80 animate-pulse flex flex-col shadow-sm"
              >
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-slate-200 rounded-xl w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : ipos.length === 0 && !error ? (
          <div className="text-center py-16 bg-white/80 rounded-2xl border border-blue-100 shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No IPOs found</h3>
            <p className="text-slate-500">
              No IPOs are available in this category right now. Check back soon.
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 text-sky-600 font-bold hover:text-sky-700"
              >
                View All IPOs
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-slate-900">IPO Listings</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Evaluate IPOs through company details, opportunity signals and AI guidance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ipos.map((ipo) => (
                <IPOCard key={ipo.id} ipo={ipo} />
              ))}
            </div>
          </div>
        )}

        {/* Bottom smart panel */}
        <div className="mt-12 rounded-[28px] border border-blue-100 bg-gradient-to-r from-sky-100 via-white to-indigo-100 p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-blue-100 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-sky-700 mb-4">
                <Sparkles className="w-4 h-4" />
                Smarter IPO decisions
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                Reduce confusion and invest with more confidence
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
                Get help understanding whether an IPO looks promising, overpriced, short-term driven,
                or worth considering for longer-term allocation. AI suggestions are designed to help
                you make more informed decisions—not just faster ones.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
              <button
                onClick={() => navigate('/chat')}
                className="w-full lg:w-auto bg-sky-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-sky-700 transition shadow-sm"
              >
                Ask Eva: Should I invest?
              </button>

              {!hasDematAccount && !loading && (
                <button className="w-full lg:w-auto bg-white text-indigo-700 border border-indigo-200 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition shadow-sm">
                  Open Demat Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Demat Cross-sell */}
        {!hasDematAccount && !loading && (
          <div className="mt-8 bg-white/90 border border-indigo-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-black text-indigo-900 mb-2">Apply for IPOs directly</h3>
              <p className="text-indigo-700">
                Open a free Demat account in minutes to start investing in IPOs with ease.
              </p>
            </div>
            <button className="whitespace-nowrap bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition shadow-sm">
              Open Demat Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOPage;
import React, { useState } from 'react';
import { CreditCard, Home, ShieldCheck, HeartPulse, TrendingUp, Landmark, Sparkles, CheckCircle, Star, Zap, Users, Award, ArrowRight } from 'lucide-react';

// ─── Real Product Data per Category ────────────────────────────────────────────

const PRODUCTS = {
  'Credit Cards': [
    {
      brand: 'HDFC Bank',
      brandColor: '#004C8F',
      brandShort: 'HDFC',
      name: 'Regalia Gold Credit Card',
      badge: 'ET PICK 🏆',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Best for Travel & Dining',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: '₹1,20,000/mo',
      joiningFee: '₹2,500 + GST',
      benefits: [
        '5X reward points on travel & dining',
        'Airport lounge access — 12 complimentary visits/year',
        'Milestone bonus: 5,000 pts on ₹5L annual spend',
        'Complimentary night stay at Marriott on renewal',
      ],
      appliedToday: 312,
      rating: 4.7,
    },
    {
      brand: 'SBI Card',
      brandColor: '#22409A',
      brandShort: 'SBI',
      name: 'SBI SimplyCLICK Credit Card',
      badge: 'POPULAR',
      badgeColor: 'bg-green-100 text-green-700',
      tag: 'Best for Online Shopping',
      tagColor: 'bg-purple-50 text-purple-700',
      minIncome: '₹25,000/mo',
      joiningFee: '₹499 + GST',
      benefits: [
        '10X rewards on Amazon, Cleartrip, Lenskart',
        '5X rewards on all other online spends',
        'Annual fee waived on ₹1L annual spend',
        '₹100 Amazon voucher on joining',
      ],
      appliedToday: 287,
      rating: 4.5,
    },
    {
      brand: 'Axis Bank',
      brandColor: '#97144D',
      brandShort: 'Axis',
      name: 'Flipkart Axis Bank Credit Card',
      badge: 'ZERO JOINING FEE',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      tag: 'Best Cashback Card',
      tagColor: 'bg-yellow-50 text-yellow-700',
      minIncome: '₹15,000/mo',
      joiningFee: 'FREE',
      benefits: [
        '5% flat cashback on Flipkart & Myntra',
        '4% cashback on preferred merchants',
        '1.5% unlimited cashback on all other spends',
        'No minimum transaction amount for cashback',
      ],
      appliedToday: 198,
      rating: 4.3,
    },
  ],
  'Personal Loans': [
    {
      brand: 'Bajaj Finserv',
      brandColor: '#004B8D',
      brandShort: 'Bajaj',
      name: 'Personal Loan up to ₹40 Lakh',
      badge: 'INSTANT DISBURSAL ⚡',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Instant Online Approval',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: '₹25,000/mo',
      joiningFee: 'Processing fee: 3.99%',
      benefits: [
        'Loan amount up to ₹40 lakh with no collateral',
        'Interest rate starting at 11% p.a.',
        'Approval in 3 minutes, disbursal in 24 hours',
        'Flexible tenure: 12 to 84 months',
      ],
      appliedToday: 542,
      rating: 4.6,
    },
    {
      brand: 'IDFC FIRST Bank',
      brandColor: '#8C2F8B',
      brandShort: 'IDFC',
      name: 'Personal Loan up to ₹10 Lakh',
      badge: 'LOWEST RATES',
      badgeColor: 'bg-green-100 text-green-700',
      tag: 'Best Rate in Segment',
      tagColor: 'bg-green-50 text-green-700',
      minIncome: '₹20,000/mo',
      joiningFee: 'Zero processing fee offer',
      benefits: [
        'Interest starting at 10.75% p.a. (lowest in class)',
        'Pre-approved offers for existing customers',
        'Fully digital — no branch visit needed',
        'Flexible part-prepayment with zero charges',
      ],
      appliedToday: 214,
      rating: 4.5,
    },
    {
      brand: 'Tata Capital',
      brandColor: '#003087',
      brandShort: 'Tata',
      name: 'Personal Loan up to ₹25 Lakh',
      badge: 'TRUSTED BRAND',
      badgeColor: 'bg-blue-100 text-blue-700',
      tag: 'Best for Self-Employed',
      tagColor: 'bg-indigo-50 text-indigo-700',
      minIncome: '₹30,000/mo',
      joiningFee: 'Processing fee: 2.50%',
      benefits: [
        'Available for both salaried and self-employed',
        'Loan amount: ₹75,000 to ₹25 lakh',
        'Rate of interest: 10.99% p.a. onwards',
        'Repayment tenure up to 72 months',
      ],
      appliedToday: 176,
      rating: 4.4,
    },
  ],
  'Home Loans': [
    {
      brand: 'SBI Home Loans',
      brandColor: '#22409A',
      brandShort: 'SBI',
      name: 'SBI Regular Home Loan',
      badge: 'LOWEST RATE 🏠',
      badgeColor: 'bg-blue-100 text-blue-700',
      tag: 'Best for First-Time Buyers',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: '₹50,000/mo',
      joiningFee: '0.35% of loan amount',
      benefits: [
        'Starting at 8.50% p.a. – lowest in market',
        'Loan tenure up to 30 years',
        'No prepayment penalty after 2 years',
        'Available for under-construction & ready properties',
      ],
      appliedToday: 421,
      rating: 4.7,
    },
    {
      brand: 'HDFC Ltd.',
      brandColor: '#004C8F',
      brandShort: 'HDFC',
      name: 'HDFC Reach Home Loan',
      badge: 'ET PICK 🏆',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Fastest Processing',
      tagColor: 'bg-orange-50 text-orange-700',
      minIncome: '₹40,000/mo',
      joiningFee: '0.50% of loan amount',
      benefits: [
        'Loan up to ₹10 crore for premium properties',
        '8.70% p.a. for women borrowers',
        'Dedicated relationship manager',
        'Tax benefit under Section 80C & 24(b)',
      ],
      appliedToday: 338,
      rating: 4.6,
    },
    {
      brand: 'LIC Housing Finance',
      brandColor: '#006838',
      brandShort: 'LIC HFL',
      name: 'Griha Suvidha Home Loan',
      badge: 'GOVT. BACKED',
      badgeColor: 'bg-green-100 text-green-700',
      tag: 'Best for Govt. Employees',
      tagColor: 'bg-green-50 text-green-700',
      minIncome: '₹30,000/mo',
      joiningFee: '₹10,000 flat',
      benefits: [
        'Special rate for women & salaried: 8.65% p.a.',
        'Loan for rural & semi-urban properties',
        'Zero hidden charges',
        'PMAY subsidy eligible (up to ₹2.67L)',
      ],
      appliedToday: 289,
      rating: 4.5,
    },
  ],
  'Term Insurance': [
    {
      brand: 'HDFC Life',
      brandColor: '#004C8F',
      brandShort: 'HDFC Life',
      name: 'HDFC Life Click 2 Protect Super',
      badge: 'ET PICK 🏆',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Best Claim Settlement',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: '₹5 Lakh cover',
      joiningFee: 'From ₹490/month',
      benefits: [
        '99.5% claim settlement ratio (highest in class)',
        'Return of premium option at maturity',
        'Critical illness add-on cover for 60+ diseases',
        'Increasing cover option to match inflation',
      ],
      appliedToday: 189,
      rating: 4.8,
    },
    {
      brand: 'Max Life Insurance',
      brandColor: '#CC0000',
      brandShort: 'Max Life',
      name: 'Max Life Smart Term Plan',
      badge: 'INDIA\'s #1 RATED',
      badgeColor: 'bg-red-100 text-red-700',
      tag: 'Highest Rated by Users',
      tagColor: 'bg-red-50 text-red-700',
      minIncome: '₹10 Lakh cover',
      joiningFee: 'From ₹620/month',
      benefits: [
        'Cover up to age 85 with whole life option',
        '99.34% claims paid in 2023-24',
        'Accidental death benefit: 2X payout',
        'Monthly income option for family post claim',
      ],
      appliedToday: 204,
      rating: 4.7,
    },
    {
      brand: 'ICICI Prudential',
      brandColor: '#F58220',
      brandShort: 'ICICI Pru',
      name: 'iProtect Smart Term Plan',
      badge: 'QUICK ISSUANCE',
      badgeColor: 'bg-yellow-100 text-yellow-700',
      tag: 'Paperless & Instant',
      tagColor: 'bg-yellow-50 text-yellow-700',
      minIncome: '₹5 Lakh cover',
      joiningFee: 'From ₹458/month',
      benefits: [
        'Issuance in as little as 4 minutes (digital)',
        'Terminal illness benefit: full sum assured paid immediately',
        'Waiver of premium on total permanent disability',
        'Joint life option to cover spouse in one policy',
      ],
      appliedToday: 156,
      rating: 4.6,
    },
  ],
  'Health Insurance': [
    {
      brand: 'Star Health',
      brandColor: '#E31B23',
      brandShort: 'Star',
      name: 'Star Comprehensive Insurance',
      badge: 'MOST BOUGHT ⭐',
      badgeColor: 'bg-red-100 text-red-700',
      tag: 'Best Family Floater',
      tagColor: 'bg-rose-50 text-rose-700',
      minIncome: '₹1 Lakh/year premium',
      joiningFee: 'From ₹8,500/year',
      benefits: [
        '10,000+ cashless partner hospitals across India',
        'Coverage for AYUSH treatment included',
        'Annual health check-up at no extra cost',
        'No room rent sub-limits on premium plans',
      ],
      appliedToday: 367,
      rating: 4.7,
    },
    {
      brand: 'Niva Bupa (Max Bupa)',
      brandColor: '#009FE3',
      brandShort: 'Niva Bupa',
      name: 'ReAssure 2.0 Health Plan',
      badge: 'ET PICK 🏆',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Unlimited Restoration',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: '₹5L coverage',
      joiningFee: 'From ₹9,800/year',
      benefits: [
        'Unlimited automatic restoration of sum insured',
        'Day 1 coverage — no waiting period for accidents',
        'Direct claim settlement (no TPA middlemen)',
        'OPD coverage with no capping on visits',
      ],
      appliedToday: 243,
      rating: 4.8,
    },
    {
      brand: 'Care Health Insurance',
      brandColor: '#00A651',
      brandShort: 'Care',
      name: 'Care Supreme Plan',
      badge: 'ZERO WAITING',
      badgeColor: 'bg-green-100 text-green-700',
      tag: 'Best for Senior Citizens',
      tagColor: 'bg-green-50 text-green-700',
      minIncome: '₹3L coverage',
      joiningFee: 'From ₹6,200/year',
      benefits: [
        'Super top-up plans from ₹300/month',
        'Unlimited teleconsultations with doctors',
        'Annual health rewards up to ₹20,000',
        'Worldwide emergency cover included',
      ],
      appliedToday: 198,
      rating: 4.5,
    },
  ],
  'Mutual Funds': [
    {
      brand: 'Mirae Asset',
      brandColor: '#E53935',
      brandShort: 'Mirae',
      name: 'Mirae Asset Large Cap Fund',
      badge: 'ET PICK 🏆',
      badgeColor: 'bg-orange-100 text-orange-700',
      tag: 'Best Large Cap',
      tagColor: 'bg-blue-50 text-blue-700',
      minIncome: 'Min SIP: ₹1,000/mo',
      joiningFee: '5Y Return: 19.4% p.a.',
      benefits: [
        '5-star Rated by CRISIL & Value Research',
        'AUM: ₹36,000+ crore (India\'s largest large cap)',
        'Consistent top-quartile performance since 2010',
        'Expense ratio: 0.54% (among lowest in category)',
      ],
      appliedToday: 892,
      rating: 4.9,
    },
    {
      brand: 'Parag Parikh AMC',
      brandColor: '#1A237E',
      brandShort: 'PPFAS',
      name: 'Parag Parikh Flexi Cap Fund',
      badge: 'INVESTOR FAVORITE',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      tag: 'Best Flexi Cap',
      tagColor: 'bg-indigo-50 text-indigo-700',
      minIncome: 'Min SIP: ₹1,000/mo',
      joiningFee: '5Y Return: 24.1% p.a.',
      benefits: [
        'Invests in Indian + global stocks (Google, Meta, Amazon)',
        'Zero exit load; direct plan available',
        'Run by India\'s most trusted fund manager team',
        'Beat Nifty 50 in 8 out of the last 10 years',
      ],
      appliedToday: 1204,
      rating: 4.9,
    },
    {
      brand: 'Axis AMC',
      brandColor: '#97144D',
      brandShort: 'Axis',
      name: 'Axis Small Cap Fund',
      badge: 'HIGH GROWTH 🚀',
      badgeColor: 'bg-pink-100 text-pink-700',
      tag: 'Best Small Cap',
      tagColor: 'bg-pink-50 text-pink-700',
      minIncome: 'Min SIP: ₹500/mo',
      joiningFee: '5Y Return: 28.7% p.a.',
      benefits: [
        'Top pick for long-term wealth creation (5Y+ horizon)',
        'Diversified across 60+ small-cap companies',
        'Portfolio reviewed every quarter by expert managers',
        'SIP auto-increase option to match income growth',
      ],
      appliedToday: 673,
      rating: 4.6,
    },
  ],
};

const SEGMENT_HERO = {
  'Credit Cards': {
    emoji: '💳',
    headline: 'Best Credit Cards in India',
    subtitle: 'Compare 50+ cards across cashback, travel, and rewards. Pre-qualify in 60 seconds with zero impact on your CIBIL score.',
    gradient: 'from-blue-600 to-indigo-700',
    stat: { label: 'Cards Compared', value: '50+' },
    sideLabel: 'CIBIL Safe Check',
  },
  'Personal Loans': {
    emoji: '💵',
    headline: 'Instant Personal Loans',
    subtitle: 'Disbursal in as little as 24 hours. No collateral. Compare the lowest interest rates from RBI-regulated lenders.',
    gradient: 'from-violet-600 to-purple-700',
    stat: { label: 'Avg. Approval Time', value: '24 Hrs' },
    sideLabel: '100% Online Process',
  },
  'Home Loans': {
    emoji: '🏠',
    headline: 'Dream Home, Best Rate',
    subtitle: 'India\'s lowest home loan rates in one place. Free EMI calculator, eligibility check, and zero-charge documentation support.',
    gradient: 'from-teal-500 to-green-700',
    stat: { label: 'Lowest Rate', value: '8.50%' },
    sideLabel: 'PMAY Eligible',
  },
  'Term Insurance': {
    emoji: '🛡️',
    headline: 'Protect What Matters Most',
    subtitle: 'Get ₹1 Crore cover from just ₹490/month. Compare India\'s top term plans — no agents, no commissions, fully digital.',
    gradient: 'from-slate-700 to-gray-900',
    stat: { label: 'Max Cover', value: '₹5 Cr' },
    sideLabel: 'IRDAI Licensed',
  },
  'Health Insurance': {
    emoji: '❤️',
    headline: 'Your Family\'s Health, Covered',
    subtitle: 'Cashless treatment at 10,000+ hospitals. Plans starting ₹500/month. Day-1 cover for accidents, no waiting period.',
    gradient: 'from-rose-500 to-red-700',
    stat: { label: 'Hospitals Network', value: '10,000+' },
    sideLabel: 'Cashless Always',
  },
  'Mutual Funds': {
    emoji: '📈',
    headline: 'Grow Wealth with Top Funds',
    subtitle: 'India\'s best-rated mutual funds. Start SIP from ₹500/month. Zero commission, zero paperwork, 100% digital.',
    gradient: 'from-orange-500 to-amber-600',
    stat: { label: 'Top SIP Return', value: '28.7%' },
    sideLabel: 'SEBI Regulated',
  },
};

function BrandLogo({ brand, color, short }) {
  return (
    <div
      className="w-24 h-16 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0 shadow-inner"
      style={{ backgroundColor: color }}
    >
      {short}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
      <span className="text-xs font-bold text-gray-600 ml-1">{rating}</span>
    </div>
  );
}

export default function FinancialServicesPage() {
  const [activeTab, setActiveTab] = useState('Credit Cards');
  const [isChecking, setIsChecking] = useState(false);
  const [offersReady, setOffersReady] = useState(false);

  const handleCheckOffers = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setOffersReady(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1600);
  };

  const fireProductInquiry = (product) => {
    window.dispatchEvent(
      new CustomEvent('et:product-inquiry', {
        detail: {
          productName: product.name,
          brand: product.brand,
          category: activeTab,
          benefits: product.benefits,
          fee: product.joiningFee,
          minIncome: product.minIncome,
        },
      })
    );
  };

  const tabs = [
    { name: 'Credit Cards', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Personal Loans', icon: <Landmark className="w-4 h-4" /> },
    { name: 'Home Loans', icon: <Home className="w-4 h-4" /> },
    { name: 'Term Insurance', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'Health Insurance', icon: <HeartPulse className="w-4 h-4" /> },
    { name: 'Mutual Funds', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const hero = SEGMENT_HERO[activeTab];
  const products = PRODUCTS[activeTab] || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Hero Banner — changes per segment */}
      <div className={`bg-gradient-to-br ${hero.gradient} text-white py-14 px-4`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-xs font-bold mb-4 border border-white/20">
              <Zap className="w-3 h-3" /> {hero.sideLabel}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              {hero.emoji} {hero.headline}
            </h1>
            <p className="text-white/80 text-base font-medium max-w-xl leading-relaxed">{hero.subtitle}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-5 text-center min-w-[160px] backdrop-blur">
            <p className="text-4xl font-black">{hero.stat.value}</p>
            <p className="text-white/70 text-sm font-medium mt-1">{hero.stat.label}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8">

        {/* AI Pre-Approved Strip */}
        {offersReady && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-5 justify-between text-white mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg">🎉 You're pre-approved for 3 offers!</h3>
                <p className="text-orange-100 text-sm">Based on your profile, we matched the best {activeTab} with zero impact to your credit score.</p>
              </div>
            </div>
            <button className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
              View My Offers <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => { setActiveTab(tab.name); setOffersReady(false); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                activeTab === tab.name
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Product Cards (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-extrabold text-gray-900">Top {activeTab} for You</h2>
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">Showing {products.length} partners</span>
            </div>

            {products.map((p, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${
                  offersReady ? 'border-orange-200 shadow-orange-50 shadow-md' : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <BrandLogo brand={p.brand} color={p.brandColor} short={p.brandShort} />

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.badgeColor}`}>{p.badge}</span>
                          {offersReady && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Pre-Approved ✓</span>}
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">{p.name}</h3>
                        <p className="text-xs font-semibold text-gray-500">{p.brand}</p>
                      </div>
                      <StarRating rating={p.rating} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${p.tagColor}`}>{p.tag}</span>
                      <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">Min: {p.minIncome}</span>
                      <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{p.joiningFee}</span>
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {p.benefits.map((b, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2 font-medium">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span><strong className="text-gray-900">{p.appliedToday.toLocaleString()}</strong> applied today</span>
                      </div>
                      <button
                        onClick={() => fireProductInquiry(p)}
                        className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-2.5 px-7 rounded-xl transition-all shadow-sm text-sm flex items-center gap-1.5"
                      >
                        Apply Now <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Eligibility Check */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-400/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-400/10 rounded-full" />
              <div className="relative z-10">
                <Award className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className="text-lg font-extrabold text-indigo-900 mb-1">Check Eligibility in 60s</h3>
                <p className="text-sm text-indigo-700/80 mb-5 font-medium leading-relaxed">
                  Find the best {activeTab.toLowerCase()} you qualify for — with <strong>zero impact</strong> on your credit score.
                </p>
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Your Monthly Income (₹)"
                    className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="PAN Number"
                    className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleCheckOffers}
                  disabled={isChecking || offersReady}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md text-sm disabled:opacity-70 active:scale-95"
                >
                  {isChecking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking your profile...
                    </span>
                  ) : offersReady ? '✅ Offers Unlocked!' : 'Check Offers For Me'}
                </button>
              </div>
            </div>

            {/* Why ET Financial */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" /> Why ET Financial Services?
              </h4>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  ['🚫', 'Zero Commission — we earn nothing from your choice'],
                  ['⚡', 'Instant eligibility check — 60 seconds, 0 credit impacts'],
                  ['🏆', 'Only RBI/IRDAI/SEBI regulated partners featured'],
                  ['🔒', 'Bank-grade 256-bit encryption on all your data'],
                  ['🤖', 'AI matches products to your exact financial profile'],
                ].map(([emoji, text], i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-base">{emoji}</span>
                    <span className="font-medium leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100 text-center">
              <ShieldCheck className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-gray-900 text-sm mb-1">100% Secure & Trustworthy</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                All lending partners are RBI-regulated. Insurance partners are IRDAI-licensed. We never share your data without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

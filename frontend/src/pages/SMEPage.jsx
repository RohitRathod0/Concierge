import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Leaf,
  Factory,
  Landmark,
  Globe2,
  Rocket,
  Wallet,
  Users,
  Trophy,
  Award,
  Briefcase,
  FileText,
  ChevronRight,
  ArrowRight,
  Brain,
  IndianRupee,
  Target,
  CheckCircle2,
  BarChart3,
  Play,
  TrendingUp,
  Zap
} from 'lucide-react';

import smeHeroBg from '../assets/sme-hero.jpg';
import trustSectionImg from '../assets/social-media-woman.jpg';

const businessStages = [
  { id: 'idea', label: 'Idea Stage' },
  { id: 'early', label: 'Early Stage' },
  { id: 'scaling', label: 'Scaling Stage' }
];

const businessTypes = [
  'Manufacturing', 'Services', 'Retail',
  'Technology', 'Export Business', 'D2C Brand',
  'Food & Beverage', 'Other'
];

const sectorOptions = [
  'Textiles', 'Engineering', 'Food Processing',
  'Technology', 'Healthcare', 'Retail',
  'Logistics', 'Education'
];

const mainSections = [
  {
    id: 'sustainability', title: 'Sustainability',
    subtitle: 'Build ESG-ready, future-facing businesses',
    icon: Leaf, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-100',
    desc: 'Learn how sustainability and green financing can strengthen your business.',
    suggestions: ['How sustainability impacts SME funding', 'Incentives for eco-friendly businesses']
  },
  {
    id: 'sector', title: 'SME Sector',
    subtitle: 'Industry-wise trends and growth opportunities',
    icon: Factory, color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-100',
    desc: 'Discover sector-level insights and high-potential opportunities for your model.',
    suggestions: ['Top-performing SME sectors this year', 'Which sector fits your business?']
  },
  {
    id: 'policy', title: 'Policy',
    subtitle: 'Schemes, subsidies and updates made simple',
    icon: Landmark, color: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-100',
    desc: 'Understand MSME schemes, incentives and regulatory changes without complexity.',
    suggestions: ['Schemes you are eligible for', 'Tax benefits for your business']
  },
  {
    id: 'trade', title: 'Trade (Exports)',
    subtitle: 'Export readiness from start to scale',
    icon: Globe2, color: 'text-cyan-700', bg: 'bg-cyan-100', border: 'border-cyan-100',
    desc: 'Explore export processes, compliance and country-level opportunities step-by-step.',
    suggestions: ['How to start exporting from India', 'Best countries to export your product'],
    subsections: ['Pre-Exports', 'Process', 'Logistics', 'Post-Exports', 'Insights']
  },
  {
    id: 'entrepreneurship', title: 'Entrepreneurship',
    subtitle: 'Startup playbooks and scaling guidance',
    icon: Rocket, color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-100',
    desc: 'Access practical business-building strategies and founder execution frameworks.',
    suggestions: ['How to scale from 0 to 1 Cr revenue', 'Mistakes to avoid as a first-time founder']
  },
  {
    id: 'money', title: 'Money',
    subtitle: 'Funding, cash flow and credit access',
    icon: Wallet, color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-100',
    desc: 'Get clarity on SME loans, working capital and financial planning for steady growth.',
    suggestions: ['Best loan options for your SME', 'How to manage cash flow effectively']
  },
  {
    id: 'summits', title: 'SME Summits',
    subtitle: 'Events, networking and ecosystem access',
    icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-100',
    desc: 'Learn from real founders and discover partnerships through SME-focused events.',
    suggestions: ['Upcoming SME networking events', 'Which summit is relevant to your stage?']
  },
  {
    id: 'awards', title: 'MSME Awards',
    subtitle: 'Recognition, credibility and visibility',
    icon: Award, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-100',
    desc: 'Explore recognition opportunities that improve credibility and trust.',
    suggestions: ['Awards your business may qualify for', 'How recognition improves investor confidence']
  },
  {
    id: 'hr', title: 'HR (Leadership & People)',
    subtitle: 'Hiring, leadership and people systems',
    icon: Briefcase, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-100',
    desc: 'Learn how to hire your first team and lead effectively as your business grows.',
    suggestions: ['How to hire your first team', 'Leadership strategies for growing startups']
  },
  {
    id: 'resources', title: 'Resources',
    subtitle: 'Tools, handbooks and operational helpers',
    icon: FileText, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-100',
    desc: 'Access ready-to-use tools and practical resources to simplify business execution.',
    suggestions: ['Generate GST invoices instantly', 'Startup checklist for beginners'],
    resources: ['ET Rise Dialogue', 'GST Invoice Generator', 'Startup Handbook', 'Live, Work & Play in Dubai']
  }
];

function SectionCard({ section }) {
  const Icon = section.icon;
  return (
    <div className={`rounded-2xl border ${section.border} bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${section.color}`} />
        </div>
        <button className="text-slate-300 group-hover:text-sky-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <h3 className="text-lg font-black text-slate-900">{section.title}</h3>
      <p className="text-sm font-semibold text-sky-600 mt-1">{section.subtitle}</p>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">{section.desc}</p>

      {section.subsections && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {section.subsections.map((item, idx) => (
            <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
              {item}
            </span>
          ))}
        </div>
      )}

      {section.resources && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {section.resources.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
              {item}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-3.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">AI Suggestions</span>
        </div>
        <div className="space-y-1.5">
          {section.suggestions.map((s, idx) => (
            <div key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-1.5">
              <span className="text-sky-400 mt-0.5">•</span> {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SMEPage() {
  const [businessStage, setBusinessStage] = useState('early');
  const [businessType, setBusinessType] = useState('Services');
  const [sector, setSector] = useState('Technology');

  const personalizedActions = useMemo(() => {
    if (businessStage === 'idea') return [
      'Validate your business model and identify relevant MSME schemes.',
      'Use the Startup Handbook and GST tools to build your foundation.',
      'Explore which sector has stronger growth tailwinds for your concept.'
    ];
    if (businessStage === 'early') return [
      'Improve cash flow planning and compare SME loan options.',
      'Build your first hiring plan and leadership structure.',
      'Assess export-readiness and what compliance comes first.'
    ];
    return [
      'Review export expansion opportunities and logistics costs.',
      'Explore summits and policy advantages for visibility and partnerships.',
      'Focus on scaling systems: team design, funding readiness and positioning.'
    ];
  }, [businessStage]);

  const riskSignals = useMemo(() => {
    if (businessStage === 'idea') return ['Unclear market fit', 'Weak unit economics', 'Delayed compliance'];
    if (businessStage === 'early') return ['Cash flow stress', 'Hiring too early', 'Limited process discipline'];
    return ['Scaling without systems', 'High customer concentration', 'Margin pressure during expansion'];
  }, [businessStage]);

  const opportunitySignals = useMemo(() => {
    if (businessStage === 'idea') return ['Government startup incentives', 'Fast-growing digital sectors', 'Low-cost pilot launches'];
    if (businessStage === 'early') return ['MSME credit access', 'Sector-specific schemes', 'Domestic-to-export transition'];
    return ['Cross-border trade expansion', 'Strategic partnerships', 'Brand credibility via summits and awards'];
  }, [businessStage]);

  const processSteps = [
    { icon: Brain, label: 'Consultation', desc: 'Understand your business stage and goals', color: 'text-sky-600', bg: 'bg-sky-100' },
    { icon: Target, label: 'Strategy', desc: 'Build personalized growth roadmap', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { icon: Zap, label: 'Implementation', desc: 'Execute with AI-powered guidance', color: 'text-violet-600', bg: 'bg-violet-100' },
    { icon: TrendingUp, label: 'Final Result', desc: 'Scale sustainably with clear insights', color: 'text-emerald-600', bg: 'bg-emerald-100' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div className="relative min-h-[90vh] flex items-center overflow-hidden">
        <img
          src={smeHeroBg}
          alt="SME Business"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-900/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 text-white border border-white/30 px-4 py-2 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-sky-300" />
              SME Growth Intelligence Hub
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Run, Grow &<br />
              <span className="text-sky-400">Scale Your</span><br />
              Business
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-100 max-w-xl leading-relaxed">
              Access policies, funding, export guidance, leadership advice, sector insights,
              tools and AI-powered business recommendations — all in one dedicated SME growth space.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-7 py-4 font-bold shadow-lg transition-all text-base">
                Explore SME Hub
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-3 rounded-xl bg-white/15 hover:bg-white/20 text-white px-7 py-4 font-bold border border-white/25 backdrop-blur-md transition-all text-base">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                Watch How It Works
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'MSME Schemes', value: '50+', color: 'text-sky-400' },
                { label: 'Export Markets', value: '80+', color: 'text-emerald-400' },
                { label: 'AI Insights', value: 'Live', color: 'text-violet-400' },
                { label: 'SME Tools', value: '12+', color: 'text-amber-400' }
              ].map((item, i) => (
                <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* WHY TRUST US */}
        <div className="rounded-[32px] bg-gradient-to-br from-orange-50 via-amber-50 to-sky-50 border border-orange-100 py-16 px-4 sm:px-6 lg:px-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-extrabold text-sky-600 uppercase tracking-widest mb-3">
                Why Choose ET SME Hub
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                Why Trust Us for Your Business Needs?
              </h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                The Economic Times SME platform is India's trusted business growth resource,
                combining real-time intelligence, AI guidance and deep ecosystem expertise.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: IndianRupee, title: 'Affordable Access', desc: 'Premium business intelligence at zero cost for SMEs.' },
                  { icon: Users, title: 'Expert Network', desc: 'Curated advice from real founders and sector experts.' },
                  { icon: BarChart3, title: '15+ Years Experience', desc: 'Trusted by India\'s leading business communities.' },
                  { icon: Trophy, title: 'Award Winning', desc: 'Recognised platform for SME growth and innovation.' }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-sky-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-orange-100 shadow-xl bg-white">
              <img
                src={trustSectionImg}
                alt="Digital business growth"
                className="w-full h-80 lg:h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* PROCESS STEPS */}
        <div className="text-center">
          <div className="text-xs font-extrabold text-sky-600 uppercase tracking-widest mb-3">Our Proven Work Process</div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            How{' '}
            <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
              SME Hub Works
            </span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">
            A clear, guided process that helps you find the right resources, policies and opportunities for your business stage.
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-sky-200 via-indigo-200 to-violet-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className={`relative z-10 w-16 h-16 rounded-full ${step.bg} flex items-center justify-center shadow-lg border-4 border-white mb-4`}>
                    <Icon className={`w-7 h-7 ${step.color}`} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">{step.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[160px]">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUSINESS ADVISOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Business Advisor Setup</h2>
                <p className="text-sm text-slate-500">Tell us about your business to get personalized guidance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Business Stage</label>
                <select
                  value={businessStage}
                  onChange={(e) => setBusinessStage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {businessStages.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {businessTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sector Focus</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {sectorOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-700">
                  Next Best Actions for Growth
                </h3>
              </div>
              <div className="space-y-3">
                {personalizedActions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/70 rounded-xl p-3 border border-white">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900">Growth Radar</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Opportunities
                </div>
                <div className="space-y-2">
                  {opportunitySignals.map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  Risk Signals
                </div>
                <div className="space-y-2">
                  {riskSignals.map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-medium text-rose-800">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTIONS GRID */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-extrabold text-sky-600 uppercase tracking-widest mb-1">Explore Everything</div>
              <h2 className="text-3xl font-black text-slate-900">SME Growth Menu</h2>
            </div>
            <button className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700">
              View all sections <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {mainSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>

        {/* EVENTS / AWARDS / HR */}
        <div>
          <div className="text-center mb-8">
            <div className="text-xs font-extrabold text-sky-600 uppercase tracking-widest mb-2">Community & Recognition</div>
            <h2 className="text-3xl font-black text-slate-900">Grow Beyond Your Business</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6 text-indigo-700" />,
                bg: 'bg-indigo-100',
                title: 'SME Summits',
                desc: 'Learn from real founders, build partnerships and discover ecosystems that accelerate growth.',
                tag: 'Networking'
              },
              {
                icon: <Trophy className="w-6 h-6 text-amber-700" />,
                bg: 'bg-amber-100',
                title: 'MSME Awards',
                desc: 'Recognition that improves brand trust, visibility and long-term business credibility.',
                tag: 'Recognition'
              },
              {
                icon: <Briefcase className="w-6 h-6 text-rose-700" />,
                bg: 'bg-rose-100',
                title: 'People & Leadership',
                desc: 'Build your first team, improve leadership and create systems for stronger execution.',
                tag: 'HR & People'
              }
            ].map((item, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{item.desc}</p>
                <button className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:gap-2.5 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
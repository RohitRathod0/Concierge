import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Brain,
  Bot,
  Cpu,
  LineChart,
  GraduationCap,
  Rocket,
  BarChart3,
  TrendingUp,
  BookOpen,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Workflow,
  UserRound
} from 'lucide-react';

import techAiHero from '../assets/tech-ai-hero.jpg';

const userModes = [
  { id: 'learning', label: 'Learning' },
  { id: 'investing', label: 'Investing' },
  { id: 'exploring', label: 'Exploring' },
  { id: 'networking', label: 'Networking' }
];

const riskLevels = [
  { id: 'low', label: 'Low Risk' },
  { id: 'medium', label: 'Medium Risk' },
  { id: 'high', label: 'High Risk' }
];

const interestOptions = [
  'AI',
  'Stocks',
  'Startups',
  'Crypto',
  'Fintech',
  'Web3',
  'Climate Tech',
  'Robotics'
];

const dynamicFeed = [
  {
    title: 'Trending in AI + Finance',
    desc: 'Discover the latest market shifts, machine intelligence trends and financial innovation in one connected stream.',
    icon: TrendingUp,
    color: 'text-sky-700',
    bg: 'bg-sky-100',
    border: 'border-sky-100'
  },
  {
    title: 'AI Tools for You',
    desc: 'Explore curated AI platforms tailored to your profile, goals and engagement behavior.',
    icon: Brain,
    color: 'text-violet-700',
    bg: 'bg-violet-100',
    border: 'border-violet-100'
  },
  {
    title: 'Future Opportunities',
    desc: 'Track sectors, skills and technologies shaping the next generation of business and investing.',
    icon: Rocket,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    border: 'border-emerald-100'
  },
  {
    title: 'Fintech & Startup Radar',
    desc: 'Signals, funding and IPO trends—kept lightweight in the feed for now.',
    icon: BarChart3,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-100'
  }
];

const beginnerCards = [
  'Best AI tools for beginner investors',
  'How AI predicts stock trends',
  'Top fintech apps to start with'
];

const intermediateCards = [
  'AI-powered portfolio optimization tools',
  'Robo-advisors vs human advisors',
  'How machine learning is used in trading'
];

const advancedCards = [
  'Quant trading with AI',
  'Building AI models for investing',
  'Alternative data in hedge funds'
];

const toolCategories = [
  {
    title: 'Portfolio Management Tools',
    desc: 'Track, optimize and review asset allocation with intelligent insights.',
    icon: Wallet
  },
  {
    title: 'Stock Prediction Platforms',
    desc: 'Use AI-assisted signals, analytics and forecasting dashboards.',
    icon: LineChart
  },
  {
    title: 'Learning AI Platforms',
    desc: 'Master AI, fintech and emerging technologies with structured learning.',
    icon: GraduationCap
  },
  {
    title: 'Automation Tools',
    desc: 'Automate workflows, alerts, research and repetitive business operations.',
    icon: Workflow
  }
];

function FeedCard({ item }) {
  const Icon = item.icon;
  return (
    <div className={`rounded-3xl border ${item.border} bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-5`}>
        <Icon className={`w-7 h-7 ${item.color}`} />
      </div>
      <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mt-2">{item.desc}</p>
      <button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700">
        Explore feed <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function SuggestionColumn({ title, icon: Icon, items, tone }) {
  return (
    <div className={`rounded-3xl border ${tone.border} ${tone.bg} p-6`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-2xl ${tone.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${tone.iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Smart suggestions</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-white border border-white/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`w-4 h-4 mt-0.5 ${tone.iconColor}`} />
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{item}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TechAIPage() {
  const [mode, setMode] = useState('learning');
  const [risk, setRisk] = useState('medium');
  const [interest, setInterest] = useState('AI');

  const recommendations = useMemo(() => {
    const base = [];

    if (interest === 'Stocks') {
      base.push('You explored stock markets → Try AI portfolio tools.');
      base.push('Review stock prediction platforms aligned with your current interest profile.');
    }

    if (interest === 'Startups') {
      base.push('You read about startups → Check emerging fintech IPOs.');
      base.push('Track startup signals and category momentum.');
    }

    if (interest === 'AI') {
      base.push('Explore AI tools curated for your learning and decision-making style.');
      base.push('Compare practical AI platforms for research, productivity and market intelligence.');
    }

    if (mode === 'learning') base.push('You like learning → Recommended AI courses and guided learning tracks.');
    if (mode === 'investing') base.push('Your current mode suggests portfolio intelligence and market tools.');
    if (mode === 'networking') base.push('Recommended founder communities and ecosystem events.');

    if (risk === 'low') base.push('Conservative profile → Focus on educational insights and lower-volatility categories.');
    if (risk === 'high') base.push('Higher risk appetite → Explore startup intelligence and frontier sectors.');

    return base.slice(0, 5);
  }, [mode, risk, interest]);

  const evaReplies = useMemo(() => {
    if (mode === 'learning') {
      return [
        'Suggest AI tools for my current skill level',
        'What should I learn next in AI?',
        'Explain this startup in simple terms'
      ];
    }
    if (mode === 'investing') {
      return [
        'Suggest AI tools for portfolio tracking',
        'Explain robo-advisors vs traditional advisory',
        'What sectors should I monitor next?'
      ];
    }
    return [
      'Show trending AI opportunities',
      'What tools match my interests?',
      'Which topics should I explore next?'
    ];
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">
        <img
          src={techAiHero}
          alt="Tech and AI"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white mb-6">
              <Cpu className="w-4 h-4 text-sky-300" />
              Tech & AI Intelligence Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.02] tracking-tight">
              AI + Tech Hub
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-slate-200 max-w-2xl leading-relaxed">
              Your personalized gateway to the future of finance, technology and opportunities.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-7 py-4 font-bold shadow-lg transition-all">
                Explore Platform
                <ArrowRight className="w-5 h-5" />
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white px-7 py-4 font-bold backdrop-blur-md transition-all">
                Talk to Eva
                <Bot className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* PERSONALIZATION + EVA */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-28 relative z-20">
          <div className="lg:col-span-2 rounded-[28px] border border-slate-200 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                <UserRound className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Personalization Engine</h2>
                <p className="text-sm text-slate-500">
                  Tailored suggestions based on your intent, risk appetite and interests.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Intent</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {userModes.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Risk Appetite</label>
                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {riskLevels.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Primary Interest</label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {interestOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-700">
                  Smart Recommendations
                </h3>
              </div>

              <div className="space-y-3">
                {recommendations.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-white/80 border border-white p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Bot className="w-6 h-6 text-violet-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Eva Assistant</h2>
                <p className="text-sm text-slate-500">Chat-style guidance for discovery</p>
              </div>
            </div>

            <div className="space-y-3">
              {evaReplies.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-sky-50 hover:border-sky-100 transition-all cursor-pointer">
                  {item}
                </div>
              ))}
            </div>

            <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 font-bold transition-all">
              Open Eva
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* DYNAMIC SECTIONS */}
        <section>
          <div className="text-center mb-10">
            <div className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
              Dynamic Sections
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Personalized AI + Tech Feed
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
              A streamlined feed that responds to your intent and interests.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {dynamicFeed.map((item, idx) => (
              <FeedCard key={idx} item={item} />
            ))}
          </div>
        </section>

        {/* SMART SUGGESTIONS (kept) */}
        <section>
          <div className="mb-10">
            <div className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
              Smart Suggestions
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Recommendations by Experience Level
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SuggestionColumn
              title="For Beginners"
              icon={BookOpen}
              items={beginnerCards}
              tone={{
                bg: 'bg-sky-50',
                border: 'border-sky-100',
                iconBg: 'bg-white',
                iconColor: 'text-sky-700'
              }}
            />
            <SuggestionColumn
              title="For Intermediate Users"
              icon={BarChart3}
              items={intermediateCards}
              tone={{
                bg: 'bg-violet-50',
                border: 'border-violet-100',
                iconBg: 'bg-white',
                iconColor: 'text-violet-700'
              }}
            />
            <SuggestionColumn
              title="Advanced Users"
              icon={Rocket}
              items={advancedCards}
              tone={{
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                iconBg: 'bg-white',
                iconColor: 'text-emerald-700'
              }}
            />
          </div>
        </section>

        {/* AI TOOLS DISCOVERY */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
                AI Tools Discovery
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Curated Tools by Use Case
              </h2>
              <p className="mt-3 text-sm text-slate-500 max-w-2xl leading-relaxed">
                Practical tools across investing workflows, learning and automation.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700">
              View all tools <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {toolCategories.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 hover:bg-white hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-sky-700" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{tool.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{tool.desc}</p>

                  <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Why recommended for you
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      Matches your interest in {interest} and current {mode} intent pattern.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-sm font-bold transition-all">
                      Try
                    </button>
                    <button className="flex-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-sm font-bold transition-all">
                      Compare
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
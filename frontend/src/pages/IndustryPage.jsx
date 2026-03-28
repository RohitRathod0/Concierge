import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Car,
  ChevronRight,
  HeartPulse,
  Lightbulb,
  RadioTower,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
  Factory,
  Banknote,
  ShoppingBag,
  Clapperboard,
  Briefcase
} from 'lucide-react';
import industryHero from '../assets/industry-hero.jpg';

const industries = [
  {
    id: 'auto',
    title: 'Auto',
    subtitle: 'Vehicles, components, mobility',
    icon: Car,
    color: 'text-sky-700',
    bg: 'bg-sky-100',
    border: 'border-sky-100',
    growth: 'High',
    tags: ['EV', 'Components', 'Mobility'],
    suggestions: ['EV market growth opportunities', 'Auto stocks to watch']
  },
  {
    id: 'banking',
    title: 'Banking & Finance',
    subtitle: 'Banking, finance, insurance',
    icon: Banknote,
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    border: 'border-emerald-100',
    growth: 'Stable',
    tags: ['Banking', 'Insurance', 'Rates'],
    suggestions: ['Best banking stocks', 'Interest rate impact on markets']
  },
  {
    id: 'consumer',
    title: 'Consumer Products',
    subtitle: 'FMCG, electronics, fashion',
    icon: ShoppingBag,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-100',
    growth: 'High',
    tags: ['FMCG', 'Retail', 'Demand'],
    suggestions: ['High-growth FMCG companies', 'Consumer demand trends']
  },
  {
    id: 'energy',
    title: 'Energy',
    subtitle: 'Power, oil & gas',
    icon: Zap,
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-100',
    growth: 'Moderate',
    tags: ['Power', 'Oil & Gas', 'Utilities'],
    suggestions: ['Energy sector outlook', 'Oil price impact analysis']
  },
  {
    id: 'renewables',
    title: 'Renewables',
    subtitle: 'Solar, wind, EV, hybrid',
    icon: Lightbulb,
    color: 'text-lime-700',
    bg: 'bg-lime-100',
    border: 'border-lime-100',
    growth: 'Very High',
    tags: ['Solar', 'Wind', 'EV'],
    suggestions: ['Best renewable energy investments', 'Future of EV in India']
  },
  {
    id: 'industrial',
    title: 'Industrial Goods',
    subtitle: 'Construction, cement, metals, packaging',
    icon: Factory,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-100',
    growth: 'High',
    tags: ['Infra', 'Metals', 'Construction'],
    suggestions: ['Infrastructure growth opportunities', 'Top industrial stocks']
  },
  {
    id: 'healthcare',
    title: 'Healthcare / Biotech',
    subtitle: 'Pharma, healthcare, biotech',
    icon: HeartPulse,
    color: 'text-rose-700',
    bg: 'bg-rose-100',
    border: 'border-rose-100',
    growth: 'Stable',
    tags: ['Pharma', 'Biotech', 'Hospitals'],
    suggestions: ['Pharma sector growth trends', 'Healthcare investments post-COVID']
  },
  {
    id: 'services',
    title: 'Services',
    subtitle: 'Consulting, education, retail, travel',
    icon: Briefcase,
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    border: 'border-indigo-100',
    growth: 'Moderate',
    tags: ['Education', 'Travel', 'Consulting'],
    suggestions: ['Fastest growing service sectors', 'Post-pandemic service recovery trends']
  },
  {
    id: 'media',
    title: 'Media & Entertainment',
    subtitle: 'Media, entertainment, streaming',
    icon: Clapperboard,
    color: 'text-violet-700',
    bg: 'bg-violet-100',
    border: 'border-violet-100',
    growth: 'Moderate',
    tags: ['OTT', 'Media', 'Digital'],
    suggestions: ['OTT vs traditional media growth', 'Digital media demand trends']
  },
  {
    id: 'transport',
    title: 'Transportation',
    subtitle: 'Railways, aviation, shipping, logistics',
    icon: Truck,
    color: 'text-cyan-700',
    bg: 'bg-cyan-100',
    border: 'border-cyan-100',
    growth: 'High',
    tags: ['Logistics', 'Railways', 'Shipping'],
    suggestions: ['Logistics sector boom', 'Transport infrastructure outlook']
  },
  {
    id: 'tech',
    title: 'Tech',
    subtitle: 'ITES, startups, internet, funding',
    icon: Building2,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-100',
    growth: 'Very High',
    tags: ['Startups', 'Internet', 'AI'],
    suggestions: ['Top startup sectors to invest', 'AI companies to watch']
  },
  {
    id: 'telecom',
    title: 'Telecom',
    subtitle: 'Telecom policy, networks, connectivity',
    icon: RadioTower,
    color: 'text-fuchsia-700',
    bg: 'bg-fuchsia-100',
    border: 'border-fuchsia-100',
    growth: 'Moderate',
    tags: ['5G', 'Policy', 'Infra'],
    suggestions: ['5G impact on economy', 'Telecom policy outlook']
  }
];

const trendingSectors = [
  { title: 'Renewables', note: 'Policy tailwinds and EV ecosystem expansion', tone: 'bg-lime-50 text-lime-800 border-lime-100' },
  { title: 'Tech', note: 'AI-led growth, startup momentum and digital infra', tone: 'bg-sky-50 text-sky-800 border-sky-100' },
  { title: 'Industrial Goods', note: 'Infrastructure and manufacturing demand remains strong', tone: 'bg-slate-50 text-slate-800 border-slate-100' },
  { title: 'Banking & Finance', note: 'Credit growth and rate-cycle sensitivity continue to matter', tone: 'bg-emerald-50 text-emerald-800 border-emerald-100' }
];

function IndustryCard({ item, onSelect }) {
  const Icon = item.icon;
  const growthTone =
    item.growth === 'Very High'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : item.growth === 'High'
      ? 'bg-sky-50 text-sky-700 border-sky-100'
      : 'bg-amber-50 text-amber-700 border-amber-100';

  return (
    <div className={`rounded-3xl border ${item.border} bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${item.color}`} />
        </div>
        <span className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${growthTone}`}>
          {item.growth}
        </span>
      </div>

      <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
      <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {item.tags.map((tag) => (
          <span key={tag} className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-700">
            AI Suggestions
          </span>
        </div>
        <div className="space-y-2">
          {item.suggestions.map((s, i) => (
            <div key={i} className="text-sm text-slate-700 font-medium">
              {s}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSelect(item)}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700"
      >
        Explore industry <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function IndustryPage() {
  const [selectedIndustry, setSelectedIndustry] = useState(industries[4]);

  const crossInsights = useMemo(() => {
    if (selectedIndustry.id === 'auto') {
      return [
        'Users exploring EV can also be shown Renewables opportunities.',
        'Auto interest can trigger related mobility and component stock suggestions.'
      ];
    }
    if (selectedIndustry.id === 'banking') {
      return [
        'Banking users can be routed to finance tools and market-rate explainers.',
        'Related content: credit growth, interest cycles and insurance trends.'
      ];
    }
    if (selectedIndustry.id === 'tech') {
      return [
        'Startup readers can be nudged toward SME and funding-related sections.',
        'Tech interest can surface AI companies, digital infra and startup trends.'
      ];
    }
    return [
      'Cross-sector recommendations can connect adjacent industries automatically.',
      'The page can surface related stocks, news and opportunity themes based on reads.'
    ];
  }, [selectedIndustry]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.10),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.08),_transparent_30%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-sky-700 shadow-sm mb-6">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                Industry Intelligence Hub
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.02] tracking-tight">
                Explore Industries,
                <br />
                Trends &
                <br />
                Opportunities
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Navigate sectors, compare growth potential, discover investment themes and
                uncover career or business opportunities through one connected industry experience.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-7 py-4 font-bold shadow-lg transition-all">
                  Explore Industries
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-7 py-4 font-bold shadow-sm transition-all">
                  View Trending Sectors
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Industries', value: '12+' },
                  { label: 'Trending Signals', value: 'Live' },
                  { label: 'AI Suggestions', value: 'Smart' },
                  { label: 'Cross Insights', value: 'Connected' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="text-2xl font-black text-slate-900">{item.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-wider font-bold text-slate-500">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-sky-200/40 via-amber-100/30 to-transparent blur-2xl rounded-[40px]" />
              <div className="relative rounded-[32px] overflow-hidden border border-white shadow-2xl bg-white">
                <img
                  src={industryHero}
                  alt="Industry operations"
                  className="w-full h-[420px] sm:h-[500px] object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* TRENDING SECTORS */}
        <section className="-mt-10 relative z-20">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-sky-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Trending Sectors</h2>
                <p className="text-sm text-slate-500">Priority sectors with strong momentum and user interest</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingSectors.map((item, idx) => (
                <div key={idx} className={`rounded-2xl border p-5 ${item.tone}`}>
                  <h3 className="font-black text-base">{item.title}</h3>
                  <p className="text-sm mt-2 leading-relaxed opacity-90">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRY GRID */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-2">
                Main Industry Sections
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Sector-by-Sector Intelligence
              </h2>
              <p className="mt-3 text-sm text-slate-500 max-w-2xl leading-relaxed">
                Browse industries, understand demand shifts and uncover relevant opportunities through AI-guided prompts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {industries.map((industry) => (
              <IndustryCard
                key={industry.id}
                item={industry}
                onSelect={setSelectedIndustry}
              />
            ))}
          </div>
        </section>

        {/* SELECTED INDUSTRY PANEL */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-14 h-14 rounded-2xl ${selectedIndustry.bg} flex items-center justify-center`}>
                <selectedIndustry.icon className={`w-7 h-7 ${selectedIndustry.color}`} />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-sky-600 mb-1">
                  Selected Industry
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {selectedIndustry.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{selectedIndustry.subtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Growth Potential</div>
                <div className="text-lg font-black text-slate-900">{selectedIndustry.growth}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Themes</div>
                <div className="text-sm font-semibold text-slate-700">{selectedIndustry.tags.join(', ')}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">Use Cases</div>
                <div className="text-sm font-semibold text-slate-700">Research, compare, track opportunities</div>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 to-indigo-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-700">
                  Recommended Prompts
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedIndustry.suggestions.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-white border border-white p-4 text-sm font-medium text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-violet-700" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Cross-Insights</h2>
                <p className="text-sm text-slate-500">Connected ecosystem recommendations</p>
              </div>
            </div>

            <div className="space-y-3">
              {crossInsights.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-slate-700 leading-relaxed">{item}</div>
                </div>
              ))}
            </div>

            <button className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 font-bold transition-all">
              Compare Sector
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
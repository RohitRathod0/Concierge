import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { courseService } from '../services/api/courseService';
import CourseCard from '../components/courses/CourseCard';
import {
  BookOpen, TrendingUp, Zap, Award, Users, Clock,
  ChevronRight, Play, Star, Quote, Shield, CheckCircle,
} from 'lucide-react';

// ─── Static template data ────────────────────────────────────────────────────

const STATS = [
  { icon: <Users className="w-5 h-5" />, value: '4,80,000+', label: 'Active Learners' },
  { icon: <BookOpen className="w-5 h-5" />, value: '120+', label: 'Expert Courses' },
  { icon: <Award className="w-5 h-5" />, value: '4.8★', label: 'Avg. Rating' },
  { icon: <Clock className="w-5 h-5" />, value: '500+ hrs', label: 'Content' },
];

const LEARNING_PATHS = [
  {
    title: 'Stock Market Starter',
    tag: 'Most Popular',
    tagColor: 'bg-blue-100 text-blue-700',
    courses: 5, hours: 22, emoji: '📈',
    gradient: 'from-blue-600 to-indigo-700',
    desc: 'From zero to your first portfolio — demat, fundamentals, and live picks.',
  },
  {
    title: 'Tax Saving Masterplan',
    tag: 'Trending',
    tagColor: 'bg-orange-100 text-orange-700',
    courses: 3, hours: 8, emoji: '🧾',
    gradient: 'from-orange-500 to-red-600',
    desc: 'Save up to ₹46,800 in taxes this year using 80C, NPS, HRA & more.',
  },
  {
    title: 'SIP & Mutual Fund Pro',
    tag: 'Beginner Friendly',
    tagColor: 'bg-emerald-100 text-emerald-700',
    courses: 4, hours: 14, emoji: '💰',
    gradient: 'from-emerald-500 to-teal-700',
    desc: 'Build a ₹1 crore corpus in 15 years. AI-simulated SIP planning included.',
  },
  {
    title: 'F&O: Options Trading',
    tag: 'Advanced',
    tagColor: 'bg-red-100 text-red-700',
    courses: 6, hours: 30, emoji: '🔮',
    gradient: 'from-violet-600 to-purple-800',
    desc: 'Greeks, hedging, spreads & iron condors — taught by a SEBI-registered trader.',
  },
];

const INSTRUCTORS = [
  { name: 'Sonal Jain', role: 'Chartered Accountant, ex-Big4', courses: 8,  students: '42k',  rating: 4.9, color: 'from-pink-500 to-rose-600',   initials: 'SJ', specialty: 'Personal Finance & Tax' },
  { name: 'Neeraj Gupta', role: 'CFA, Fund Manager 15yr exp', courses: 12, students: '74k',  rating: 4.7, color: 'from-blue-500 to-indigo-700', initials: 'NG', specialty: 'Equities & Stock Picking' },
  { name: 'Priya Sharma', role: 'SEBI-Registered Advisor, CFP', courses: 6,  students: '31k',  rating: 4.6, color: 'from-teal-500 to-emerald-700', initials: 'PS', specialty: 'Mutual Funds & Retirement' },
  { name: 'Rahul Mehta', role: 'Derivatives Trader, 12yr exp', courses: 9,  students: '28k',  rating: 4.8, color: 'from-violet-500 to-purple-800', initials: 'RM', specialty: 'F&O & Options Strategies' },
];

const TESTIMONIALS = [
  {
    name: 'Arjun Verma',
    role: 'Software Engineer, Bengaluru',
    rating: 5,
    text: 'I went from not knowing what a NAV is to having a solid SIP portfolio in 3 months. The Mutual Funds Deep Dive course is genuinely life-changing.',
    course: 'Mutual Funds Deep Dive',
    initials: 'AV',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Sneha Patel',
    role: 'MBA Graduate, Mumbai',
    rating: 5,
    text: 'The Tax Saving Masterclass helped me save ₹78,000 in taxes last year. The instructor explains Section 80C like no CA ever did in school.',
    course: 'Tax Saving Masterclass',
    initials: 'SP',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Raj Iyer',
    role: 'Business Owner, Chennai',
    rating: 5,
    text: 'I tried YouTube for 2 years. ET Masterclass gave me a structured path from basics to live F&O trading in 6 months. Worth every rupee.',
    course: 'F&O: Options Trading',
    initials: 'RI',
    color: 'from-violet-500 to-purple-700',
  },
];

const TRUST_BADGES = [
  { emoji: '🏛️', text: 'SEBI Registered Instructors' },
  { emoji: '🔒', text: 'Bank-Grade Data Security' },
  { emoji: '🎓', text: 'Industry-Recognized Certificates' },
  { emoji: '📱', text: 'Learn on Any Device, Anytime' },
  { emoji: '♾️', text: 'Lifetime Course Access' },
  { emoji: '💯', text: '7-Day Money Back Guarantee' },
];

const CATEGORY_META = {
  all:             { emoji: '📚', label: 'All Courses',     gradient: 'from-slate-600 to-slate-800' },
  equities:        { emoji: '📈', label: 'Equities',        gradient: 'from-blue-600 to-indigo-700' },
  trading:         { emoji: '⚡', label: 'Trading',         gradient: 'from-violet-600 to-purple-800' },
  mutual_funds:    { emoji: '💰', label: 'Mutual Funds',    gradient: 'from-emerald-500 to-teal-700' },
  derivatives:     { emoji: '🔮', label: 'Derivatives',     gradient: 'from-orange-500 to-red-700' },
  personal_finance:{ emoji: '🏦', label: 'Personal Finance',gradient: 'from-pink-500 to-rose-700' },
  ipo:             { emoji: '🚀', label: 'IPO Strategy',    gradient: 'from-amber-500 to-yellow-700' },
};

function StarRow({ rating }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const MasterclassPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  const categories = Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, ...meta }));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recRes, coursesRes] = await Promise.all([
          courseService.getRecommended(),
          courseService.getCourses({ category: activeCategory, sort: sortBy }),
        ]);
        const allCourses = coursesRes.courses || [];
        setRecommended(recRes.courses || []);
        setCourses(allCourses);
        // Pick the highest-rated paid course as featured spotlight
        const paid = allCourses.filter(c => !c.is_free).sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setFeatured(paid[0] || allCourses[0] || null);
      } catch {
        // silent — cards will just be empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeCategory, sortBy]);

  const freeCourses = courses.filter(c => c.is_free);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ────────────────────────────────────────────── */}
      <div className="relative bg-gray-950 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" /> PREMIUM LEARNING PLATFORM
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
                Master Your<br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Learn from India's top CAs, fund managers, and SEBI-registered advisors. AI-personalized learning paths, real market simulations, and industry certificates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4" /> Explore Courses
                </button>
                <button className="border border-white/20 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <BookOpen className="w-4 h-4" /> Start Free Today
                </button>
              </div>
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {STATS.map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur text-center hover:bg-white/10 transition-colors">
                  <div className="flex justify-center text-orange-400 mb-2">{s.icon}</div>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
      </div>

      {/* ── TRUST BADGES TICKER ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-4 overflow-hidden">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 shrink-0">
              <span className="text-lg">{b.emoji}</span> {b.text}
              <span className="text-gray-200 ml-6">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED COURSE SPOTLIGHT ────────────────────────── */}
      {featured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white">
              <Star className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Featured Course</h2>
            <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-orange-200 uppercase tracking-wider">Top Rated</span>
          </div>

          <div
            className="group relative bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-gray-900/30 transition-all"
            onClick={() => navigate(`/masterclass/${featured.id}`)}
          >
            {/* Background orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row gap-0">
              {/* Left thumbnail */}
              <div className="md:w-2/5 h-60 md:h-auto bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_70%,white,transparent)]" />
                <span className="text-8xl drop-shadow-2xl">📈</span>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/0 group-hover:bg-white rounded-full transition-all flex items-center justify-center">
                    <Play className="w-7 h-7 text-transparent group-hover:text-gray-900 ml-1 transition-colors" />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                  🏆 TOP RATED
                </div>
              </div>

              {/* Right content */}
              <div className="flex-1 p-8 text-white">
                <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-2 block">
                  {(featured.category || '').replace('_', ' ')}
                </span>
                <h3 className="text-3xl font-extrabold mb-3 leading-tight group-hover:text-orange-400 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-gray-400 font-medium mb-6 leading-relaxed max-w-lg">
                  {featured.short_description || featured.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <StarRow rating={featured.rating} />
                    <span className="font-bold text-white">{featured.rating?.toFixed(1)}</span>
                    <span className="text-gray-500">({(featured.total_learners || 0).toLocaleString()} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {featured.duration_hours} hours</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> {featured.total_modules} modules</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {(featured.total_learners / 1000).toFixed(1)}k learners</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Certificate included</span>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    {featured.is_free ? (
                      <span className="text-2xl font-extrabold text-green-400">FREE</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        {featured.original_price > featured.price && (
                          <span className="text-gray-500 line-through text-lg">₹{featured.original_price}</span>
                        )}
                        <span className="text-3xl font-extrabold text-white">₹{featured.price}</span>
                      </div>
                    )}
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95">
                    Enroll Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNING PATHS ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Curated Learning Paths</h2>
            <p className="text-sm text-gray-500 mt-1">Goal-based bundles — pick one and start your journey today.</p>
          </div>
          <button className="text-sm text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            All paths <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEARNING_PATHS.map((lp, i) => (
            <div key={i} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
              <div className={`h-32 bg-gradient-to-br ${lp.gradient} flex items-center justify-center relative`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-8 -mt-8" />
                <span className="text-5xl drop-shadow-lg">{lp.emoji}</span>
                <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${lp.tagColor}`}>{lp.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 text-base mb-2 group-hover:text-orange-600 transition-colors">{lp.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">{lp.desc}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-semibold">
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{lp.courses} courses</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lp.hours} hrs</span>
                </div>
                <button className="mt-4 w-full bg-gray-900 group-hover:bg-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                  Start Path →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI RECOMMENDED ───────────────────────────────────── */}
      {!loading && recommended.length > 0 && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                <Star className="w-4 h-4" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Recommended For You</h2>
              <span className="bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-200 uppercase tracking-wider">AI Pick</span>
            </div>
            <button className="text-sm text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(c => <CourseCard key={`rec-${c.id}`} course={c} isRecommended />)}
          </div>
        </div>
      )}

      {/* ── MEET YOUR INSTRUCTORS ─────────────────────────────── */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-2">Learn from the Best</h2>
            <p className="text-gray-400 font-medium">SEBI-registered advisors, CAs, and fund managers — all in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INSTRUCTORS.map((ins, i) => (
              <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:-translate-y-1 transition-all cursor-pointer">
                <div className={`w-16 h-16 bg-gradient-to-br ${ins.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {ins.initials}
                </div>
                <h3 className="font-extrabold text-white text-base mb-1">{ins.name}</h3>
                <p className="text-gray-400 text-xs font-medium mb-3 leading-relaxed">{ins.role}</p>
                <p className="text-orange-400 text-[11px] font-bold uppercase tracking-wider mb-4">{ins.specialty}</p>
                <div className="flex justify-center gap-4 text-[11px] text-gray-400">
                  <span><strong className="text-white">{ins.courses}</strong> courses</span>
                  <span><strong className="text-white">{ins.students}</strong> students</span>
                  <span><strong className="text-yellow-400">{ins.rating}★</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXPLORE CATALOG ──────────────────────────────────── */}
      <div id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Explore All Courses</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{courses.length} courses across 6 categories</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl shadow-sm bg-white py-2 pl-3 pr-8 font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-md scale-105`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500">Try a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-t border-orange-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">What Learners Say</h2>
            <p className="text-gray-500 font-medium">Real stories from people who changed their financial lives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-all">
                <Quote className="w-8 h-8 text-orange-200 mb-4" />
                <p className="text-gray-700 leading-relaxed font-medium mb-5 text-sm">"{t.text}"</p>
                <p className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider mb-4 bg-orange-50 inline-block px-2 py-0.5 rounded">
                  Course: {t.course}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-xl flex items-center justify-center text-white font-extrabold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                  </div>
                  <div className="ml-auto"><StarRow rating={t.rating} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FREE COURSES BANNER ───────────────────────────────── */}
      {!loading && freeCourses.length > 0 && activeCategory === 'all' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <span className="inline-block bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-4">ZERO COST</span>
                <h3 className="text-3xl font-extrabold mb-3">Start Learning for Free 🎓</h3>
                <p className="text-emerald-200 text-base font-medium max-w-lg leading-relaxed">
                  {freeCourses.length} full courses with lifetime access — no credit card, no catch.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 min-w-[220px]">
                {freeCourses.slice(0, 2).map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/masterclass/${c.id}`)}
                    className="bg-white text-emerald-800 font-bold py-3 px-6 rounded-xl hover:bg-emerald-50 transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4" /> {c.title.split(' ').slice(0, 3).join(' ')}…
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterclassPage;

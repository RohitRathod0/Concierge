import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { courseService } from '../services/api/courseService';
import CourseCard from '../components/courses/CourseCard';
import PageSkeleton from '../components/common/PageSkeleton';

const MasterclassPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [courses, setCourses] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'equities', label: 'Equities' },
    { id: 'trading', label: 'Trading' },
    { id: 'mutual_funds', label: 'Mutual Funds' },
    { id: 'derivatives', label: 'Derivatives' },
    { id: 'personal_finance', label: 'Personal Finance' },
    { id: 'ipo', label: 'IPO Strategy' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recRes, coursesRes] = await Promise.all([
          courseService.getRecommended(),
          courseService.getCourses({ category: activeCategory, sort: sortBy })
        ]);
        setRecommended(recRes.courses || []);
        setCourses(coursesRes.courses || []);
        setError(null);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory, sortBy]);

  const freeCourses = courses.filter(c => c.is_free);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <button onClick={() => navigate('/services')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Services / ET Masterclasses
        </button>
      </nav>

      {/* Hero */}
      <div className="mb-10 bg-gray-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-orange-500/30">PREMIUM LEARNING</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">ET Masterclasses</h1>
          <p className="text-lg md:text-xl text-gray-300 font-medium">Expert-led · AI personalized · Learn at your pace</p>
          <div className="mt-8 flex gap-4">
            <button onClick={() => {
              document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
            }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow">
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Section - Only show if profile has personalization data */}
      {!loading && recommended.length > 0 && user && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase">AI Pick</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(course => (
              <CourseCard key={`rec-${course.id}`} course={course} isRecommended={true} />
            ))}
          </div>
        </div>
      )}

      {/* Main Explore Section */}
      <div id="explore-section" className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore Catalog</h2>
          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-[80vw] md:max-w-xl lg:max-w-3xl">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-gray-500">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 bg-white py-2 pl-3 pr-8 font-medium cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {error && (
        <div className="bg-red-50 p-4 border border-red-200 rounded-lg text-red-700 flex flex-col items-center my-8">
          <p className="mb-3">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="bg-white border text-center border-gray-100 rounded-xl p-5 h-80 animate-pulse flex flex-col">
                <div className="h-32 bg-gray-200 rounded-lg mb-4 w-full"></div>
                <div className="h-6 bg-gray-100 rounded w-1/2 mb-4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 mx-auto"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
             </div>
          ))}
        </div>
      ) : courses.length === 0 && !error ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
          <p className="text-gray-500">Try selecting a different category or adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Free Courses Banner */}
      {!loading && freeCourses.length > 0 && activeCategory === 'all' && (
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="mb-6 md:mb-0 md:pr-8">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded mb-3 uppercase border border-emerald-200">Zero Cost</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Learning for Free</h3>
            <p className="text-gray-600 text-lg">Kickstart your financial education journey without spending a rupee. Full access, no credit card required.</p>
          </div>
          <div className="shrink-0 flex gap-4">
             {freeCourses.slice(0, 1).map(c => (
                <button 
                  key={c.id}
                  onClick={() => navigate(`/masterclass/${c.id}`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md whitespace-nowrap"
                >
                  Enroll in {c.title.split(' ')[0]} Now
                </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterclassPage;

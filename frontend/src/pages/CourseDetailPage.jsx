import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { courseService } from '../services/api/courseService';
import CourseCard from '../components/courses/CourseCard';
import PageSkeleton from '../components/common/PageSkeleton';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const isAuthenticated = !!token;
  
  const [course, setCourse] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    courseService.getCourseById(courseId)
      .then(data => {
        if (isMounted) {
          setCourse(data);
          setError(null);
          // Auto-expand first 2 modules
          const initialExpanded = {};
          (data.modules || []).slice(0, 2).forEach(m => initialExpanded[m.id] = true);
          setExpandedModules(initialExpanded);
          
          // Fetch related courses
          return courseService.getCourses({ category: data.category });
        }
      })
      .then(res => {
        if (isMounted && res) {
          setRelated((res.courses || []).filter(c => c.id !== courseId).slice(0, 2));
        }
      })
      .catch(err => {
        if (isMounted) setError('Failed to load course details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
      
    return () => { isMounted = false; };
  }, [courseId]);

  const handleEnrollClick = async () => {
    if (!isAuthenticated) return navigate(`/login?redirect=/masterclass/${courseId}`);
    
    try {
      if (course.is_free) {
        await courseService.enroll(courseId);
        alert('Enrolled successfully! You can now start learning.');
        setCourse({ ...course, is_enrolled: true, progress_pct: 0, last_module_completed: 0 });
      } else if (!course.is_enrolled) {
        // Mock payment flow
        const conf = window.confirm(`Proceed to mock payment of ₹${course.price} for this course?`);
        if (conf) {
          await courseService.enroll(courseId);
          alert('Payment Successful! You are now enrolled.');
          setCourse({ ...course, is_enrolled: true, progress_pct: 0, last_module_completed: 0 });
        }
      }
    } catch (e) {
      alert(e.message || 'Error occurred during enrollment');
    }
  };

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <PageSkeleton />;
  if (error || !course) return <div className="p-8 text-center text-red-600 font-bold">{error || 'Not found'}</div>;

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Dark Header Hero */}
      <div className="bg-gray-900 text-white pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/masterclass')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1 mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Masterclasses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{course.category.replace('_', ' ')}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelColors[course.level] || 'bg-gray-800 text-gray-200 border-gray-700'}`}>
                  {course.level}
                </span>
                {course.badge_label && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{course.badge_label.toUpperCase()}</span>}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.short_description || course.description.substring(0,100)}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-500 font-bold text-base">{course.rating?.toFixed(1) || '0.0'}</span>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  {(course.total_learners || 0).toLocaleString('en-IN')} learners
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  By {course.instructor_name}
                </div>
              </div>
            </div>
            <div className="lg:block hidden"></div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Stats Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-wrap gap-x-12 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Duration</p>
                  <p className="font-bold text-gray-900">{course.duration_hours} hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Curriculum</p>
                  <p className="font-bold text-gray-900">{course.total_modules} modules</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Completion</p>
                  <p className="font-bold text-gray-900">Certificate Included</p>
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Meet Your Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0 overflow-hidden flex items-center justify-center border border-gray-300">
                  {course.instructor_avatar_url ? (
                    <img src={course.instructor_avatar_url} alt={course.instructor_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-500">{course.instructor_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{course.instructor_name}</h3>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{course.instructor_bio || 'Expert instructor at ET Masterclasses.'}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this Course</h2>
              <div className="prose prose-orange max-w-none text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: course.description?.split('\n').join('<br/>')}} />
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
                <span className="text-sm font-medium text-gray-500">{course.modules?.length || 0} Modules total</span>
              </div>
              
              <div className="space-y-3">
                {(course.modules || []).map(m => (
                  <div key={m.id} className="border border-gray-200 rounded-lg overflow-hidden transition-colors hover:border-gray-300">
                    <button 
                      onClick={() => toggleModule(m.id)}
                      className="w-full bg-gray-50 px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-gray-400 w-5">{(m.module_number || 0).toString().padStart(2, '0')}</div>
                        <h4 className="font-semibold text-gray-900 text-sm">{m.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.is_free_preview && course.is_free === false && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Preview</span>
                        )}
                        <span className="text-xs text-gray-500 font-medium">{m.duration_minutes} min</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedModules[m.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </button>
                    
                    {expandedModules[m.id] && (
                      <div className="px-4 py-4 bg-white border-t border-gray-100 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span className="text-sm text-gray-600">Video Lesson</span>
                        </div>
                        {(!course.is_enrolled && !m.is_free_preview && !course.is_free) ? (
                          <button disabled className="text-xs font-bold flex items-center gap-1.5 text-gray-400 cursor-not-allowed bg-gray-100 px-3 py-1.5 rounded">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Enroll to Unlock
                          </button>
                        ) : (
                          <button className="text-xs font-bold flex items-center gap-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded transition-colors">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Play Lesson
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-Sell */}
            {related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Students who took this also learned</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {related.map(r => (
                    <CourseCard key={r.id} course={r} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Column */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-8 transform lg:-translate-y-16">
              <div className="h-48 bg-gray-100 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="Course Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </div>
                )}
                {course.preview_video_url && (
                  <button className="absolute inset-0 m-auto w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-col mb-6 pb-6 border-b border-gray-100 items-start">
                  {!course.is_free ? (
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-extrabold text-gray-900">₹{course.price}</span>
                       {course.original_price > course.price && (
                         <span className="text-lg font-medium text-gray-400 line-through mb-1 shadow-sm">₹{course.original_price}</span>
                       )}
                    </div>
                  ) : (
                    <span className="text-3xl font-extrabold text-green-600">Free</span>
                  )}
                  {course.original_price > course.price && !course.is_free && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded mt-2 uppercase">Big Discount Applied</span>
                  )}
                </div>

                {course.is_enrolled ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 text-center mb-4">
                      <p className="text-sm font-bold flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        You are enrolled!
                      </p>
                      <p className="text-xs mt-1 font-medium">{course.progress_pct || 0}% Complete</p>
                    </div>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow">
                      Continue Learning → Module {(course.last_module_completed || 0) + 1}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={handleEnrollClick}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-lg"
                    >
                      {course.is_free ? 'Start Learning — Free' : `Enroll for ₹${course.price}`}
                    </button>
                    {!course.is_free && (
                      <p className="text-xs text-center text-gray-500 font-medium">30-day money-back guarantee</p>
                    )}
                  </div>
                )}
                
                <div className="mt-8 space-y-3 font-medium">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">This course includes:</h4>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    {course.duration_hours} hours on-demand video
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    Full lifetime access
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    Access on mobile and desktop
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Certificate of completion
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;

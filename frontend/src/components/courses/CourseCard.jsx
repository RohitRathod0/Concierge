import React from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, isRecommended = false }) => {
  const navigate = useNavigate();

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };

  const getBadge = () => {
    if (isRecommended) return <div className="absolute -top-3 -left-3 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10 transform -rotate-2">FOR YOU ⭐</div>;
    if (course.badge_label) return <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm z-10">{course.badge_label.toUpperCase()}</div>;
    return null;
  };

  const getDiscount = () => {
    if (!course.original_price || course.price >= course.original_price) return 0;
    return Math.round(((course.original_price - course.price) / course.original_price) * 100);
  };

  const renderStars = () => {
    const rating = Math.round(course.rating || 0);
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-gray-900">{course.rating?.toFixed(1) || '0.0'}</span>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-[10px] text-gray-500 ml-1">({(course.total_learners || 0).toLocaleString('en-IN')})</span>
      </div>
    );
  };

  return (
    <div 
      onClick={() => navigate(`/masterclass/${course.id}`)}
      className={`relative bg-white border rounded-xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 group
        ${isRecommended ? 'border-green-200 shadow-md hover:shadow-lg hover:border-green-400' : 'border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300'}
      `}
    >
      {/* Decorative gradient top bar */}
      <div className={`h-1.5 w-full ${isRecommended ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`}></div>

      {getBadge()}
      
      {course.is_enrolled && (
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          ENROLLED
        </div>
      )}

      {/* Image placeholder with abstract pattern based on category */}
      <div className="h-36 bg-gray-100 relative overflow-hidden flex items-center justify-center">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 opacity-20 ${isRecommended ? 'bg-gradient-to-br from-green-500 to-teal-700' : 'bg-gradient-to-br from-blue-500 to-indigo-800'}`}></div>
        )}
        {!course.thumbnail_url && (
            <svg className="w-12 h-12 text-gray-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{course.category.replace('_', ' ')}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelColors[course.level] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {course.level}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-xs text-gray-600 mb-4 line-clamp-2 flex-grow">
          {course.short_description || course.description}
        </p>

        <div className="space-y-3 mt-auto">
          {renderStars()}
          
          <div className="flex items-center text-[11px] text-gray-500 font-medium">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {course.duration_hours} hrs · {course.total_modules} modules
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                {course.instructor_name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{course.instructor_name}</span>
            </div>
            
            <div className="text-right">
              {course.is_free ? (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">FREE</span>
              ) : (
                <div className="flex flex-col items-end leading-none">
                  <div className="flex items-center gap-1.5">
                    {course.original_price > course.price && (
                      <span className="text-[10px] text-gray-400 line-through">₹{course.original_price}</span>
                    )}
                    <span className="text-base font-bold text-gray-900">₹{course.price}</span>
                  </div>
                  {getDiscount() > 0 && <span className="text-[9px] font-bold text-green-600 mt-0.5">{getDiscount()}% OFF</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Play, Zap } from 'lucide-react';

const CATEGORY_GRADIENTS = {
  equities:         'from-blue-500 via-indigo-600 to-blue-800',
  trading:          'from-violet-500 via-purple-600 to-indigo-800',
  mutual_funds:     'from-emerald-500 via-teal-600 to-green-800',
  derivatives:      'from-orange-500 via-red-500 to-rose-800',
  personal_finance: 'from-pink-500 via-rose-500 to-red-700',
  ipo:              'from-amber-500 via-yellow-500 to-orange-700',
  default:          'from-slate-500 via-gray-600 to-slate-800',
};

const CATEGORY_ICONS = {
  equities:         '📈',
  trading:          '⚡',
  mutual_funds:     '💰',
  derivatives:      '🔮',
  personal_finance: '🏦',
  ipo:              '🚀',
  default:          '📚',
};

const LEVEL_STYLES = {
  beginner:     { pill: 'bg-green-100 text-green-800 border-green-200',     dot: 'bg-green-500' },
  intermediate: { pill: 'bg-amber-100 text-amber-800 border-amber-200',     dot: 'bg-amber-500' },
  advanced:     { pill: 'bg-red-100 text-red-800 border-red-200',           dot: 'bg-red-500' },
};

function StarRow({ rating, count }) {
  const rounded = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-extrabold text-gray-900">{(rating || 0).toFixed(1)}</span>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-3.5 h-3.5 ${i < rounded ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-gray-400 font-medium">({(count || 0).toLocaleString('en-IN')})</span>
    </div>
  );
}

const CourseCard = ({ course, isRecommended = false }) => {
  const navigate = useNavigate();

  const cat = (course.category || 'default').toLowerCase().replace(' ', '_');
  const gradient = CATEGORY_GRADIENTS[cat] || CATEGORY_GRADIENTS.default;
  const catIcon  = CATEGORY_ICONS[cat]  || CATEGORY_ICONS.default;
  const level    = LEVEL_STYLES[course.level] || { pill: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };

  const discount = (course.original_price && course.original_price > course.price)
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/masterclass/${course.id}`)}
      className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300 group border
        ${isRecommended
          ? 'border-emerald-200 shadow-md shadow-emerald-50 hover:shadow-xl hover:shadow-emerald-100 hover:-translate-y-1'
          : 'border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200'
        }
      `}
    >

      {/* ── Thumbnail ── */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <>
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-black/10 rounded-full" />
            {/* Big centred emoji */}
            <span className="text-6xl drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform">{catIcon}</span>
          </>
        )}

        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          {/* Recommended badge */}
          {isRecommended && (
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
              ⭐ FOR YOU
            </span>
          )}
          {/* Badge label from backend */}
          {!isRecommended && course.badge_label && (
            <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
              {course.badge_label.toUpperCase()}
            </span>
          )}
          {(!isRecommended && !course.badge_label) && <span />}

          {/* Level pill */}
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${level.pill} backdrop-blur bg-white/80`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${level.dot}`} style={{ verticalAlign: 'middle' }} />
            {course.level}
          </span>
        </div>

        {/* Enrolled tag */}
        {course.is_enrolled && (
          <div className="absolute bottom-3 right-3 bg-white text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 shadow">
            ✓ ENROLLED
          </div>
        )}

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category label */}
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
          {(course.category || '').replace('_', ' ')}
        </p>

        {/* Title */}
        <h3 className="text-base font-extrabold text-gray-900 leading-snug mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-grow font-medium">
          {course.short_description || course.description}
        </p>

        {/* Stars */}
        <StarRow rating={course.rating} count={course.total_learners} />

        {/* Meta row */}
        <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium mt-2 mb-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration_hours}h</span>
          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{course.total_modules} modules</span>
          {course.total_learners > 0 && (
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{(course.total_learners / 1000).toFixed(1)}k</span>
          )}
        </div>

        {/* Instructor + Price */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow`}>
              {(course.instructor_name || 'ET').charAt(0)}
            </div>
            <span className="text-xs font-semibold text-gray-600 truncate max-w-[110px]">
              {course.instructor_name}
            </span>
          </div>

          <div>
            {course.is_free ? (
              <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                FREE
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                {course.original_price > course.price && (
                  <span className="text-[11px] text-gray-400 line-through">₹{course.original_price}</span>
                )}
                <span className="text-base font-extrabold text-gray-900">₹{course.price}</span>
                {discount > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                    {discount}% OFF
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

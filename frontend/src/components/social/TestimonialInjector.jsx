import React from 'react';

const TestimonialInjector = ({ testimonial }) => {
  if (!testimonial) return null;

  return (
    <div className="my-6 border-l-4 border-yellow-400 pl-4 py-2 bg-gradient-to-r from-yellow-50 to-transparent pr-4 italic text-gray-700 relative">
      <div className="text-4xl text-yellow-200 absolute -top-2 -left-2 z-0 font-serif">"</div>
      <p className="relative z-10 text-sm md:text-base font-medium">"{testimonial.content}"</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">— {testimonial.author}</span>
        <span className="text-yellow-500 text-xs tracking-widest">{testimonial.rating === "5/5" ? '★★★★★' : '★★★★☆'}</span>
      </div>
    </div>
  );
};

export default TestimonialInjector;

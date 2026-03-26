import React, { useState } from 'react';
import { Star, Clock, Users, PlayCircle, BookOpen, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MasterclassPage() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Stock Market', 'Tax Planning', 'Retirement', 'Crypto', 'Real Estate'];

  const courses = [
    { title: "Stock Market Basics for Beginners", instructor: "Rachana Ranade", rating: 4.8, students: 24500, hours: 12, price: 1999, img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80" },
    { title: "Advanced Options Trading", instructor: "PR Sundar", rating: 4.9, students: 8200, hours: 18, price: 8999, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?auto=format&fit=crop&w=400&q=80" },
    { title: "Tax Planning for Salaried Professionals", instructor: "CA Monika", rating: 4.7, students: 15400, hours: 5, price: 1499, img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80" },
    { title: "Complete Real Estate Investing", instructor: "Rohan D'Souza", rating: 4.6, students: 6300, hours: 22, price: 4999, img: "https://images.unsplash.com/photo-1560518846-1ea114660e5a?auto=format&fit=crop&w=400&q=80" },
    { title: "Technical Analysis Masterclass", instructor: "Nitin B.", rating: 4.8, students: 11200, hours: 15, price: 3999, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?auto=format&fit=crop&w=400&q=80" },
    { title: "Retirement Corpus Building", instructor: "Wealth Managers", rating: 4.9, students: 5100, hours: 8, price: 2499, img: "https://images.unsplash.com/photo-1633519398850-89111867c406?auto=format&fit=crop&w=400&q=80" }
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 text-white pt-20 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
           <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover opacity-20" alt="Audience" />
           <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center">
           <div className="md:w-3/5">
              <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-xs uppercase tracking-widest rounded mb-6 border border-blue-500/30">ET Masterclass</span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Learn From India's <br/> Top Financial Minds</h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-xl mb-8">Curated courses taught by practitioners, not professors. Master the markets, optimize your taxes, and grow your wealth alongside experts.</p>
              
              <div className="flex gap-4 items-center bg-gray-800/80 p-4 rounded-xl border border-gray-700 w-max backdrop-blur-md">
                 <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-red-500 z-30"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-green-500 z-20"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-blue-500 z-10"></div>
                 </div>
                 <div className="text-sm font-medium text-gray-300">
                    <span className="text-white font-bold block leading-none">50,000+</span>
                    Active Learners
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Course Comparison AI Banner */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
         <div className="bg-gradient-to-r from-orange-500 to-[#f26522] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between text-white border border-orange-400">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <Star className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h3 className="font-bold text-lg">Not sure which to pick?</h3>
                  <p className="text-orange-100 text-sm">Let our AI recommend the perfect course based on your profile.</p>
               </div>
            </div>
            <Link to="/onboarding" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
               Get Recommendations
            </Link>
         </div>
      </div>

      {/* Featured Banner */}
      <section className="pt-24 pb-12 max-w-7xl mx-auto px-4">
         <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 flex flex-col md:flex-row mb-12 group">
            <div className="md:w-1/2 relative overflow-hidden">
               <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?auto=format&fit=crop&w=800&q=80" alt="Featured" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute top-4 left-4 bg-red-500 text-white text-xs uppercase font-bold px-3 py-1 rounded">Next Batch: Starts Tomorrow</div>
            </div>
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
               <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                  <span className="text-orange-600">Featured</span> • Option Trading Masterclass
               </div>
               <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">Master Option Trading in 4 Weeks</h2>
               <p className="text-gray-600 mb-6 text-lg">Go from beginner to profitable trader with our flagship options trading program taught by 15-year veteran traders.</p>
               
               <div className="flex items-center gap-6 mb-8 text-sm font-semibold text-gray-700 border-b border-gray-100 pb-8">
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400"/> 24 Hours</div>
                  <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-gray-400"/> 12,000+ Enrolled</div>
                  <div className="flex items-center text-yellow-600"><Star className="w-4 h-4 mr-1 fill-current"/> 4.9 Stars</div>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-colors">Enrol Now — ₹4,999</button>
                  <button className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-4 rounded-xl border border-orange-200 transition-colors flex justify-center items-center">
                    <PlayCircle className="w-5 h-5 mr-2" /> Free Preview
                  </button>
               </div>
            </div>
         </div>

         {/* Filter Bar */}
         <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mr-2 flex-shrink-0">
               <Filter className="w-5 h-5 text-gray-400" />
            </div>
            {tabs.map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-gray-900 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                 }`}
               >
                 {tab}
               </button>
            ))}
         </div>

         {/* Course Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {courses.map((course, i) => (
               <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                  <div className="h-48 relative overflow-hidden group">
                     <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                     <button className="absolute inset-0 m-auto w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-orange-600 z-10 hover:scale-110 transform duration-300 shadow-xl">
                        <PlayCircle className="w-6 h-6" />
                     </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{course.instructor}</span>
                        <div className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                           <Star className="w-3 h-3 mr-1 fill-current"/> {course.rating}
                        </div>
                     </div>
                     <h3 className="font-extrabold text-lg text-gray-900 mb-4 leading-snug flex-1 cursor-pointer hover:text-orange-600 transition-colors">{course.title}</h3>
                     
                     <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-6 border-b border-gray-100 pb-4">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> {course.hours} Hours</span>
                        <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> {(course.students/1000).toFixed(1)}k Students</span>
                     </div>
                     
                     <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-extrabold text-gray-900">₹{course.price}</span>
                        <button className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors border border-orange-100">
                           Preview
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

    </div>
  );
}

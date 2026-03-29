import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, ChevronDown } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center font-bold text-white text-xl tracking-tighter">
                ET
              </div>
              <span className="font-extrabold text-xl hidden sm:block tracking-tight text-gray-900">
                AI Concierge
              </span>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/markets" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">Markets</Link>
            <Link to="/ipo" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">IPO</Link>
            <Link to="/masterclass" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">Masterclass</Link>
            <Link to="/portfolio" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">Portfolio</Link>
            <Link to="/news" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">News</Link>
            <Link to="/et-prime" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">ET Prime</Link>
            <Link to="/financial-services" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">Services</Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-5">
            <button className="text-gray-500 hover:text-gray-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            <NotificationBell />
            
            <div className="hidden sm:flex items-center gap-2 cursor-pointer pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-sm">
                R
              </div>
              <span className="text-sm font-semibold text-gray-700">Hi, Rohit</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            <Link 
              to="/et-prime" 
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-[#f26522] hover:bg-[#d95215] transition-colors"
            >
              Get ET Prime
            </Link>

            {/* Mobile menu button */}
            <div className="flex flex-col justify-center items-center md:hidden">
              <button className="text-gray-500 hover:text-gray-900 p-2">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

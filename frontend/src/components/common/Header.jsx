import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, ChevronDown } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  const navLinks = [
    { to: '/markets', label: 'Markets' },
    { to: '/ipo', label: 'IPO' },
    { to: '/masterclass', label: 'Masterclass' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/news', label: 'News' },
    { to: '/tech-ai', label: 'Tech & AI' },
    { to: '/industry', label: 'Industry' },
    { to: '/et-prime', label: 'ET Prime' },
    { to: '/financial-services', label: 'Services' },
    { to: '/sme', label: 'SME' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6">
          {/* Left: Logo */}
          <div className="flex items-center min-w-fit">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-md bg-black flex items-center justify-center font-bold text-white text-2xl tracking-tight shadow-sm">
                ET
              </div>
              <span className="font-extrabold text-[20px] hidden sm:block tracking-tight text-slate-900 whitespace-nowrap">
                AI Concierge
              </span>
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="hidden lg:flex flex-1 justify-center items-center">
            <div className="flex items-center gap-6 xl:gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 min-w-fit">
            <button className="hidden sm:inline-flex text-slate-500 hover:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                R
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                  Hi, Rohit
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>

            <Link
              to="/et-prime"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#f26522] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#d95215] transition-colors whitespace-nowrap"
            >
              Get ET Prime
            </Link>

            {/* Mobile menu */}
            <button className="lg:hidden inline-flex items-center justify-center p-2 text-slate-600 hover:text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
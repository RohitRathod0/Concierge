import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ipoService } from '../../services/api/ipoService';

const IPOCard = ({ ipo, onAlertToggle }) => {
  const navigate = useNavigate();
  // Safe destructure just in case authStore behavior implies something else, 
  // but usually it exposes isAuthenticated or token.
  const token = useAuthStore(state => state.token);
  const isAuthenticated = !!token;
  
  const [isAlertSet, setIsAlertSet] = useState(ipo.user_has_alert || false);
  const [isHoveringAlert, setIsHoveringAlert] = useState(false);

  const statusColors = {
    open: 'bg-red-100 text-red-800 border-red-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    listed: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const getDaysRemaining = () => {
    if (ipo.status === 'open' && ipo.close_date) {
      const days = Math.ceil((new Date(ipo.close_date) - new Date()) / 86400000);
      return days >= 0 ? `${days} days left to apply` : 'Closes today';
    }
    if (ipo.status === 'upcoming' && ipo.open_date) {
      const days = Math.ceil((new Date(ipo.open_date) - new Date()) / 86400000);
      return days >= 0 ? `${days} days to open` : 'Opens tomorrow';
    }
    return '';
  };

  const getGMPDisplay = () => {
    if (ipo.status === 'listed') {
      return ipo.listing_gain_percent !== undefined ? `Listed ${ipo.listing_gain_percent > 0 ? '+' : ''}${ipo.listing_gain_percent}%` : 'Listed';
    }
    if (ipo.gmp_premium > 0) {
      return <span className="text-green-600 font-medium">+₹{ipo.gmp_premium} ({ipo.gmp_percent}%)</span>;
    }
    if (ipo.gmp_premium === 0 && ipo.status === 'upcoming') {
      return <span className="text-gray-500">GMP not yet available</span>;
    }
    return <span className="text-gray-500">Not available</span>;
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < (ipo.et_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const handleAlertClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login?redirect=/ipo');
      return;
    }

    try {
      if (isAlertSet) {
        await ipoService.removeAlert(ipo.id);
        setIsAlertSet(false);
      } else {
        await ipoService.setAlert(ipo.id);
        setIsAlertSet(true);
      }
      if (onAlertToggle) onAlertToggle(ipo.id, !isAlertSet);
    } catch (err) {
      console.error(err);
    }
  };

  const getCTA = () => {
    if (ipo.status === 'open') return 'View & Apply →';
    if (ipo.status === 'upcoming') return 'View Details →';
    return 'View Analysis →';
  };

  return (
    <div 
      onClick={() => navigate(`/ipo/${ipo.id}`)}
      className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-orange-200 group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{ipo.company_name}</h3>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded mt-2 inline-block shadow-sm">{ipo.sector}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${statusColors[ipo.status] || 'bg-gray-100 text-gray-800'}`}>
          {ipo.status}
        </span>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-sm bg-gray-50/80 rounded-lg p-4 border border-gray-100">
          <div>
            <p className="text-gray-500 text-xs mb-1 font-medium">Price Band</p>
            <p className="font-bold text-gray-900">₹{ipo.price_band_low} - ₹{ipo.price_band_high}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1 font-medium">Min Invest</p>
            <p className="font-bold text-gray-900">₹{ipo.min_investment}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1 font-medium">Lot Size</p>
            <p className="font-bold text-gray-900">{ipo.lot_size} shares</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1 font-medium">Expected GMP <span className="text-[10px] text-gray-400 font-normal">est.</span></p>
            <div className="font-bold">{getGMPDisplay()}</div>
          </div>
        </div>

        {getDaysRemaining() && (
          <div className="flex items-center text-xs text-orange-600 font-semibold mb-4 bg-orange-50 px-3 py-2 rounded-md border border-orange-100 w-max">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {getDaysRemaining()}
          </div>
        )}

        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
          <div className="flex items-center gap-1 mb-1 relative z-10 pl-2">
            <span className="text-[11px] font-bold text-gray-700 mr-1 uppercase tracking-wider">ET Verdict</span>
            {renderStars()}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 italic leading-relaxed pl-2 relative z-10">"{ipo.et_verdict}"</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
        <button 
          onClick={handleAlertClick}
          onMouseEnter={() => setIsHoveringAlert(true)}
          onMouseLeave={() => setIsHoveringAlert(false)}
          className={`text-xs font-bold px-4 py-2 rounded shadow-sm transition-all flex-1 text-center ${isAlertSet ? 'text-green-700 bg-green-50 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'}`}
        >
          {isAlertSet ? (isHoveringAlert ? 'Remove Alert' : 'Alert Set ✓') : 'Set Alert 🔔'}
        </button>
        <button 
          className="text-xs font-bold text-white bg-gray-900 hover:bg-orange-600 px-4 py-2 rounded shadow transition-colors flex-[1.5] flex justify-center items-center"
        >
          {getCTA()}
        </button>
      </div>
    </div>
  );
};

export default IPOCard;

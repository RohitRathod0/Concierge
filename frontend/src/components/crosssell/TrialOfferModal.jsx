import React from 'react';

const TrialOfferModal = ({ offer, onClose, onAccept }) => {
  if (!offer) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in-center">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4">ET</div>
          <h2 className="text-2xl font-bold mb-2">{offer.title}</h2>
          <p className="text-gray-300">{offer.subtitle}</p>
        </div>
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {offer.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center text-gray-700">
                <span className="text-green-500 mr-3">✓</span> {benefit}
              </li>
            ))}
          </ul>
          <button 
            onClick={onAccept}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-700 shadow-lg shadow-orange-500/30 transition-all"
          >
            Start {offer.trialDays}-Day Free Trial
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">No credit card required for trial.</p>
        </div>
      </div>
    </div>
  );
};

export default TrialOfferModal;

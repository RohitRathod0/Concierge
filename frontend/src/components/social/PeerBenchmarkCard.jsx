import React from 'react';

const PeerBenchmarkCard = ({ benchmarkData }) => {
  if (!benchmarkData) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow border border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-100 rounded-lg p-2 text-indigo-600">📊</div>
        <h3 className="font-bold text-gray-800 text-lg">You vs. Your Peers</h3>
      </div>
      
      <p className="text-gray-600 text-sm mb-6">
        Comparing you against <span className="font-semibold text-gray-800 text-sm">{benchmarkData.peer_segment}s</span> in <span className="font-semibold text-gray-800 text-sm">{benchmarkData.peer_city}</span>.
      </p>
      
      <div className="space-y-4 relative">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end text-sm">
            <span className="font-semibold text-indigo-700">You (Top {benchmarkData.top_percentile}%)</span>
            <span className="font-bold text-gray-800">{benchmarkData.user_products_used} Product{benchmarkData.user_products_used !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full w-1/3 relative shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 opacity-70">
          <div className="flex justify-between items-end text-sm">
            <span className="font-medium text-gray-500">Average Peer</span>
            <span className="font-bold text-gray-600">{benchmarkData.avg_products_used} Products</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-gray-400 h-full rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
        <p className="text-sm font-medium text-indigo-900 mb-2">Level up your portfolio</p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors text-sm shadow-md">
          Explore {benchmarkData.suggested_product}
        </button>
      </div>
    </div>
  );
};

export default PeerBenchmarkCard;

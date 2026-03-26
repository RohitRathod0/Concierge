import React, { useEffect, useState } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { recommendationService } from '../../services/api/recommendationService';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export function RecommendationCarousel() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await recommendationService.getRecommendations(5);
        setRecommendations(data);
      } catch (err) {
        setError('Failed to load recommendations.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl border border-gray-100 mt-8 mb-10 mx-6">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    document.getElementById('rec-carousel').scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    document.getElementById('rec-carousel').scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <div className="relative mt-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Recommended for You</h2>
        <div className="flex space-x-2">
          <button onClick={scrollLeft} className="p-2 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={scrollRight} className="p-2 rounded-full bg-white shadow border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div 
        id="rec-carousel" 
        className="flex overflow-x-auto pb-4 pt-2 -mx-2 snap-x hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
        {recommendations.map(rec => (
          <div key={rec.recommendation_id} className="snap-start flex-none">
            <RecommendationCard recommendation={rec} />
          </div>
        ))}
      </div>
    </div>
  );
}

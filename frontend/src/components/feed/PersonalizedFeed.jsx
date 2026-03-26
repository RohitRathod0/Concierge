import React, { useEffect, useState } from 'react';
import FeedCard from './FeedCard';
import { feedService } from '../../services/api/feedService';
import InlineCrossSellBanner from '../crosssell/InlineCrossSellBanner';
import axios from 'axios';
import { tracker } from '../../services/behaviorTracker';
import { getToken } from '../../utils/storage';

const fallbackFeed = [
  {
    card_id: "fb_hdfc",
    type: "MARKET_ALERT",
    content: "HDFC Bank Q3: Net Profit climbs 12% YoY. Asset quality steady despite margin pressures.",
    relevance_score: 94,
    relevance_reason: "High portfolio coverage",
    action_url: "/markets"
  },
  {
    card_id: "fb_tech",
    type: "PEER_INSIGHT",
    content: "IT Sector Outlook: Margin recovery expected in H2. Top analysts upgrade tier-1 IT.",
    relevance_score: 88,
    relevance_reason: "Matches your tech sector interest",
    action_url: "/et-prime"
  },
  {
    card_id: "fb_bonds",
    type: "LEARNING_CARD",
    content: "Why RBI might keep repo rate unchanged. Inflation stickiness suggests longer pause.",
    relevance_score: 75,
    relevance_reason: "Macroeconomic trend affecting debt funds",
    action_url: "/financial-services"
  }
];

const PersonalizedFeed = ({ userId }) => {
  const [feed, setFeed] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tracker.trackPageView('dashboard_feed');

    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Fetch feed and dynamic recommendations concurrently
    Promise.all([
      feedService.getPersonalizedFeed(userId, 'morning'),
      axios.get('http://127.0.0.1:8000/api/v1/recommendations/for-me', {
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
      }).catch(() => ({ data: { recommendations: [] } }))
    ])
    .then(([feedData, recsData]) => {
      setFeed(feedData.feed || feedData || []);
      setRecs(recsData.data.recommendations || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Personalized feed failed", err);
      setLoading(false);
    });
  }, [userId]);

  const handleFeedback = async (cardId, type) => {
    try {
      await feedService.submitFeedback(cardId, 'feed_card', type);
      console.log(`Feedback ${type} recorded for card ${cardId}`);
    } catch (e) {
       console.log("Feedback ignored for fallback card");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse px-2 mt-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl w-full"></div>
        ))}
      </div>
    );
  }

  const displayFeed = feed.length > 0 ? feed : fallbackFeed;
  
  // Distribute cross-sells at index 0 and 3
  const firstCrossSell = recs.length > 0 ? recs[0] : null;
  const secondCrossSell = recs.length > 1 ? recs[1] : null;

  return (
    <div className="py-2">
      <div className="space-y-6">
        {displayFeed.map((card, idx) => (
          <React.Fragment key={card.card_id || idx}>
            <FeedCard card={card} onFeedback={handleFeedback} />
            
            {/* Dynamic Inject: High Match Product */}
            {idx === 0 && firstCrossSell && firstCrossSell.match_score > 40 && (
              <InlineCrossSellBanner 
                type={firstCrossSell.product_id.split('_')[0]} 
                title={firstCrossSell.product_name} 
                text={firstCrossSell.match_reason} 
                cta={firstCrossSell.cta_text}
                link={firstCrossSell.cta_url}
              />
            )}
            
            {/* Dynamic Inject: Secondary Match Product */}
            {idx === 3 && secondCrossSell && secondCrossSell.match_score > 40 && (
              <InlineCrossSellBanner 
                type={secondCrossSell.product_id.split('_')[0]} 
                title={secondCrossSell.product_name} 
                text={secondCrossSell.match_reason} 
                cta={secondCrossSell.cta_text}
                link={secondCrossSell.cta_url}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedFeed;

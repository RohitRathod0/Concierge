import React, { useEffect, useState } from 'react';
import FeedCard from './FeedCard';
import { feedService } from '../../services/api/feedService';
import InlineCrossSellBanner from '../crosssell/InlineCrossSellBanner';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    feedService.getPersonalizedFeed(userId, 'morning')
      .then(data => {
        setFeed(data.feed || data || []);
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

  return (
    <div className="py-2">
      <div className="space-y-6">
        {displayFeed.map((card, idx) => (
          <React.Fragment key={card.card_id || idx}>
            <FeedCard card={card} onFeedback={handleFeedback} />
            
            {/* Inject Cross-Sell Banner dynamically after the first item */}
            {idx === 0 && (
              <InlineCrossSellBanner 
                type="prime" 
                title="Unlock 500+ Premium Stock Screeners" 
                text="Stop guessing. See exactly which stocks match your criteria in seconds." 
                cta="Get ET Prime"
              />
            )}
            
            {/* Inject another Cross-Sell Banner later down the feed */}
            {idx === 3 && (
              <InlineCrossSellBanner 
                type="masterclass" 
                title="Master Options Trading" 
                text="Learn advanced strategies from SEBI-registered portfolio managers." 
                cta="Explore Masterclass"
                link="/masterclass"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedFeed;

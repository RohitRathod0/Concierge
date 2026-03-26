import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function useNudgeEngine() {
  const { user, token } = useAuthStore();
  const [activeNudge, setActiveNudge] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const userId = user?.user_id ?? user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchPendingNudges = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/v1/nudges/pending/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const pendingNudges = response.data.nudges || [];
        
        if (pendingNudges.length > 0) {
          const nudge = pendingNudges[0];
          const shownNudges = JSON.parse(sessionStorage.getItem('shown_nudges') || '[]');
          if (!shownNudges.includes(nudge.id)) {
            setActiveNudge(nudge);
            shownNudges.push(nudge.id);
            sessionStorage.setItem('shown_nudges', JSON.stringify(shownNudges));
            
            axios.post(`${API_BASE}/api/v1/nudges/${nudge.id}/impression`, {}, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }).catch(e => console.error("Failed to track nudge impression", e));

            if (nudge.channel === 'BOTTOM_SHEET') {
              setIsBottomSheetOpen(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch pending nudges", error);
      }
    };

    fetchPendingNudges();
    const interval = setInterval(fetchPendingNudges, 60000);

    return () => clearInterval(interval);
  }, [token, userId]);

  const dismissNudge = async (nudgeId) => {
    setActiveNudge(null);
    setIsBottomSheetOpen(false);
    try {
      await axios.post(`${API_BASE}/api/v1/nudges/${nudgeId}/dismiss`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error("Failed to dismiss nudge", e);
    }
  };

  const convertNudge = async (nudgeId, ctaUrl) => {
    setActiveNudge(null);
    setIsBottomSheetOpen(false);
    try {
      await axios.post(`${API_BASE}/api/v1/nudges/${nudgeId}/convert`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error("Failed to convert nudge", e);
    }
    if (ctaUrl) {
      window.location.href = ctaUrl;
    }
  };

  return { activeNudge, dismissNudge, convertNudge, isBottomSheetOpen };
}

'use client';

import { useEffect } from 'react';

interface ProfileViewTrackerProps {
  traderId: string;
}

export function ProfileViewTracker({ traderId }: ProfileViewTrackerProps) {
  useEffect(() => {
    // Track profile view on mount
    const trackView = async () => {
      try {
        await fetch(`/api/traders/${traderId}/view`, {
          method: 'POST',
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Failed to track profile view:', error);
      }
    };

    trackView();
  }, [traderId]);

  // This component doesn't render anything
  return null;
}


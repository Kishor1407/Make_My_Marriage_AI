'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function WakingServerBanner() {
  const [isWaking, setIsWaking] = useState(false);
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Ping the backend health check
    const checkServer = async () => {
      // If server takes longer than 2s to reply, it's probably cold-started on Render
      timeoutId = setTimeout(() => {
        setIsWaking(true);
      }, 2000);

      try {
        await api.get('/health');
        clearTimeout(timeoutId);
        setIsWaking(false);
        setIsAwake(true);
      } catch (err) {
        console.warn('Backend ping error:', err);
      }
    };

    checkServer();

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isWaking || isAwake) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-700 flex items-center justify-center gap-2">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
      <span>
        Waking up free cloud server (Render free tier sleeps after inactivity)... please wait ~30 seconds.
      </span>
    </div>
  );
}


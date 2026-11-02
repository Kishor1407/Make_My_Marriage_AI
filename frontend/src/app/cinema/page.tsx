'use client';

import React, { Suspense } from 'react';
import LiveStreamCinemaPage from '../marriage/[id]/cinema/page';

export default function GlobalCinemaRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-xs font-semibold text-neutral-500">
          Loading Sovereign Ceremonial Cinema...
        </div>
      }
    >
      <LiveStreamCinemaPage />
    </Suspense>
  );
}


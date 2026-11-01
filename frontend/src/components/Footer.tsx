import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-white/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-xs text-zinc-500 space-y-2">
        <p className="flex items-center justify-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Indian Weddings
        </p>
        <p className="text-zinc-400">
          Powered by 100% Free Tiers: Next.js on Vercel · Node/Express on Render · MongoDB Atlas GridFS
        </p>
      </div>
    </footer>
  );
}


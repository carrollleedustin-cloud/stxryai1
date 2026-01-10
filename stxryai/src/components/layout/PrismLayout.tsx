'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PrismLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 text-slate-200 selection:bg-fuchsia-500/30 selection:text-fuchsia-200 font-sans">
      {/* --- Ambient Background Layers --- */}

      {/* 1. Deep Space Base */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      {/* 2. Aurora Nebulas (Animated) */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] h-[50vh] w-[50vw] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen animate-float"
          style={{ animationDuration: '25s' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[50vh] w-[50vw] rounded-full bg-fuchsia-600/20 blur-[120px] mix-blend-screen animate-float"
          style={{ animationDuration: '30s', animationDelay: '-10s' }}
        />
        <div
          className="absolute top-[40%] left-[30%] h-[40vh] w-[40vw] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen animate-pulse"
          style={{ animationDuration: '15s' }}
        />
      </div>

      {/* 3. Holographic Grid (Fixed) */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

      {/* 4. Noise Texture (CSS) */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
      </div>

      {/* --- Main Content --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {children}
      </motion.div>

      {/* --- Vignette --- */}
      <div className="fixed inset-0 z-50 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Spline from "@splinetool/react-spline";

interface SplineBackgroundProps {
  sceneUrl?: string;
  className?: string;
}

export default function SplineBackground({
  sceneUrl = "https://prod.spline.design/10zPux2YFPQ1vlHD/scene.splinecode",
  className = "",
}: SplineBackgroundProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden pointer-events-none select-none ${className}`}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 3D Spline Canvas with mouse wheel zoom disabled */}
      <Spline
        scene={sceneUrl}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full pointer-events-none"
      />

      {/* Subtle Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-lg">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Loading 3D Solar Environment...</span>
          </div>
        </div>
      )}
    </div>
  );
}

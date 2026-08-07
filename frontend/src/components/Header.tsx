"use client";

import React from "react";
import { Sun, ShieldAlert, Activity, Wifi, WifiOff, Info, Code, Eye, EyeOff } from "lucide-react";
import { ForecastHorizon } from "@/lib/utils";

interface HeaderProps {
  apiConnected: boolean;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenInfoModal: () => void;
  onOpenApiModal: () => void;
  horizon: ForecastHorizon;
  onChangeHorizon: (h: ForecastHorizon) => void;
  show3DHero: boolean;
  onToggle3DHero: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiConnected,
  isSimulating,
  onToggleSimulation,
  onOpenInfoModal,
  onOpenApiModal,
  horizon,
  onChangeHorizon,
  show3DHero,
  onToggle3DHero,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-amber-500/10 px-4 lg:px-8 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight solar-gradient-text">
              SURYAKAVACH<span className="text-amber-400 font-light ml-1">ENTERPRISE</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
              Space Weather SaaS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Energetic Electron (&gt;2 MeV) Forecast Engine for GEO & MEO Satellites
          </p>
        </div>
      </div>

      {/* Multi-Horizon Selector Tabs */}
      <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        {(["1h", "6h", "12h"] as ForecastHorizon[]).map((h) => (
          <button
            key={h}
            onClick={() => onChangeHorizon(h)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              horizon === h
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {h === "1h" ? "1-Hour (Tactical)" : h === "6h" ? "6-Hour (Tasking)" : "12-Hour (Strategic)"}
          </button>
        ))}
      </div>

      {/* Controls & Status Badges */}
      <div className="flex items-center flex-wrap justify-end gap-2.5">
        {/* Toggle 3D Hero Viewport */}
        <button
          onClick={onToggle3DHero}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            show3DHero
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
        >
          {show3DHero ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{show3DHero ? "3D Sun Active" : "3D Viewport Off"}</span>
        </button>

        {/* Connection Indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
          apiConnected 
            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
            : "bg-amber-950/60 border-amber-500/40 text-amber-300"
        }`}>
          {apiConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
          <span>{apiConnected ? "API Connected" : "Simulation"}</span>
        </div>

        {/* Developer API Trigger Button */}
        <button
          onClick={onOpenApiModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 text-slate-950 shadow-md hover:brightness-110 transition-all"
        >
          <Code className="w-3.5 h-3.5" />
          <span>B2B API & SDK</span>
        </button>

        {/* Info Modal */}
        <button
          onClick={onOpenInfoModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-500/40 transition-all"
        >
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>NOAA Scales</span>
        </button>
      </div>
    </header>
  );
};

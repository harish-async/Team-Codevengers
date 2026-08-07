"use client";

import React, { useState, useEffect } from "react";
import { formatFlux, getNOAAStormLevel } from "@/lib/utils";
import { ShieldAlert, TrendingUp, TrendingDown, Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MetricCardsProps {
  currentFlux: number;
  predictedFlux: number;
  timestamp: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  currentFlux,
  predictedFlux,
  timestamp,
}) => {
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    try {
      setFormattedTime(new Date(timestamp).toLocaleTimeString());
    } catch {
      setFormattedTime("");
    }
  }, [timestamp]);

  const noaa = getNOAAStormLevel(predictedFlux);
  const fluxDiff = predictedFlux - currentFlux;
  const percentChange = currentFlux > 0 ? (fluxDiff / currentFlux) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Current Particle Flux Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Telemetry (t=0)
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {formatFlux(currentFlux)}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span suppressHydrationWarning>
              Recorded at {formattedTime || "Live"}
            </span>
          </p>
        </div>
      </div>

      {/* 2. 60m Advance Predicted Radiation Flux Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden border-amber-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Predicted Flux (t+60m)
          </span>
          <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          <div className="text-3xl font-extrabold solar-gradient-text tracking-tight">
            {formatFlux(predictedFlux)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-0.5 ${
              percentChange >= 0 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}>
              {percentChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(percentChange).toFixed(1)}% vs current
            </span>
          </div>
        </div>
      </div>

      {/* 3. NOAA Storm Severity Scale Badge Card */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            NOAA Radiation Scale
          </span>
          <ShieldAlert className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xl font-black rounded-lg border ${noaa.badgeClass}`}>
              {noaa.code}
            </span>
            <div>
              <div className="text-sm font-bold text-slate-200">
                {noaa.name}
              </div>
              <p className="text-[11px] text-slate-400">
                Threshold: ≥ {noaa.minPfu} pfu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Threat Level & Advisory Card */}
      <div className={`glass-panel p-5 rounded-2xl relative overflow-hidden border transition-all ${
        noaa.code !== "S0" ? "border-amber-500/40 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]" : "border-slate-800"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Threat & Advisory
          </span>
          {noaa.code !== "S0" ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="mt-1">
          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
            noaa.code !== "S0" ? "text-amber-400" : "text-emerald-400"
          }`}>
            {noaa.code !== "S0" ? "EARLY STORM ALERT ACTIVE" : "SYSTEM OPERATIONAL • QUIET"}
          </div>
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
            {noaa.description}
          </p>
        </div>
      </div>
    </div>
  );
};

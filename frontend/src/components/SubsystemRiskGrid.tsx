"use client";

import React from "react";
import { calculateSubsystemRisks } from "@/lib/utils";
import { ShieldCheck, Cpu, BatteryCharging, AlertOctagon, CpuIcon } from "lucide-react";

interface SubsystemRiskGridProps {
  predictedFlux: number;
}

export const SubsystemRiskGrid: React.FC<SubsystemRiskGridProps> = ({ predictedFlux }) => {
  const risk = calculateSubsystemRisks(predictedFlux);

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <CpuIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Satellite Subsystem Radiation & Dielectric Risk Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Estimated physical degradation & bit-flip hazards for Geostationary Orbit (GEO) payloads
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-black tracking-wider uppercase ${risk.dielectricColor}`}>
          Dielectric Charging: {risk.dielectricChargingLevel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. SEU Bit-Flip Hazard */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              SEU Bit-Flip Rate
            </span>
            <span className="text-[10px] text-slate-500">RAM/Flash</span>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {risk.seuBitFlipRate}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Single Event Upsets caused by &gt;2 MeV energetic electron dielectric penetration.
          </p>
        </div>

        {/* 2. Solar Array Degradation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
              Solar Array Degradation
            </span>
            <span className="text-[10px] text-slate-500">Power Grid</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1">
            {risk.solarArrayDegradation}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Photovoltaic cell efficiency degradation rate per storm day.
          </p>
        </div>

        {/* 3. Recommended Flight Control Protocol */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              Automated Action Protocol
            </span>
            <span className="text-[10px] text-slate-500">Flight Telemetry</span>
          </div>
          <p className="text-xs font-semibold text-amber-200 mt-2 leading-relaxed">
            {risk.recommendedSatelliteAction}
          </p>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { X, ShieldAlert, AlertTriangle, Radio, Plane, Satellite } from "lucide-react";

interface NOAALegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NOAALegendModal: React.FC<NOAALegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const scales = [
    {
      code: "S5",
      name: "Extreme Radiation Storm",
      pfu: "≥ 100,000 pfu",
      color: "bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-500/50",
      biological: "Unavoidable radiation risk to astronauts on EVA; high-altitude flight exposure.",
      satellite: "Complete memory loss, severe payload damage, permanent satellite orientation loss.",
      radio: "Complete blackout of HF communications across polar regions for days."
    },
    {
      code: "S4",
      name: "Severe Radiation Storm",
      pfu: "≥ 10,000 pfu",
      color: "bg-purple-950/90 text-purple-300 border-purple-500/50",
      biological: "High radiation hazard for astronauts on EVA; polar flight passengers advised to reroute.",
      satellite: "Single event upsets, memory device degradation, noise on star trackers.",
      radio: "Blackout of HF communications through the polar regions."
    },
    {
      code: "S3",
      name: "Strong Radiation Storm",
      pfu: "≥ 1,000 pfu",
      color: "bg-red-950/90 text-red-300 border-red-500/50",
      biological: "Radiation hazard avoidance recommended for high-altitude polar flight paths.",
      satellite: "Single-event upsets on orbital payloads; solar panel efficiency degradation.",
      radio: "Degraded HF propagation in polar regions."
    },
    {
      code: "S2",
      name: "Moderate Radiation Storm",
      pfu: "≥ 100 pfu",
      color: "bg-orange-950/90 text-orange-300 border-orange-500/50",
      biological: "Infrequent radiation exposure to high-altitude passengers.",
      satellite: "Infrequent single-event upsets to satellite electronics.",
      radio: "Small effects on polar HF propagation."
    },
    {
      code: "S1",
      name: "Minor Radiation Storm",
      pfu: "≥ 10 pfu",
      color: "bg-amber-950/90 text-amber-300 border-amber-500/50",
      biological: "No significant biological risk.",
      satellite: "No operational satellite impacts.",
      radio: "Minor impacts on polar HF radio propagation."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-amber-500/20 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                NOAA Space Weather Scales: Solar Radiation Storms
              </h3>
              <p className="text-xs text-slate-400">
                Official thresholds and physical impact categories (pfu = particles / cm² · s · sr)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scale Cards List */}
        <div className="space-y-3.5">
          {scales.map((s) => (
            <div key={s.code} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 text-sm font-black rounded-md border ${s.color}`}>
                    {s.code}
                  </span>
                  <span className="text-sm font-bold text-slate-200">{s.name}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  {s.pfu}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/60">
                <div className="flex items-start gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">Aviation & Bio</span>
                    <span>{s.biological}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">Satellites & Payload</span>
                    <span>{s.satellite}</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400 block text-[10px] uppercase">HF Radio & Comms</span>
                    <span>{s.radio}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

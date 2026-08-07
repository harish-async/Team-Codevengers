"use client";

import React, { useRef } from "react";
import { Sliders, Upload, Play, Pause, RefreshCw, Gauge, Cpu, FileText } from "lucide-react";

export interface TelemetryParams {
  E2W_COR_FLUX: number;
  F: number;
  BX_GSE: number;
  BY_GSM: number;
  BZ_GSM: number;
  flow_speed: number;
  proton_density: number;
}

interface TelemetryControlPanelProps {
  params: TelemetryParams;
  onChangeParam: (key: keyof TelemetryParams, value: number) => void;
  onReset: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onFileUpload: (file: File) => void;
}

export const TelemetryControlPanel: React.FC<TelemetryControlPanelProps> = ({
  params,
  onChangeParam,
  onReset,
  isSimulating,
  onToggleSimulation,
  simSpeed,
  onChangeSpeed,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 1. Solar Wind Parameter Adjustment Sliders */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Solar Wind & Plasma Telemetry Adjustment
            </h3>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-all border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* F: Total Magnetic Field */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Total Mag Field (F)</span>
              <span className="font-mono text-amber-400 font-bold">{params.F.toFixed(2)} nT</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.1"
              value={params.F}
              onChange={(e) => onChangeParam("F", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* BZ_GSM: Z-component */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Southward BZ (BZ_GSM)</span>
              <span className="font-mono text-amber-400 font-bold">{params.BZ_GSM.toFixed(2)} nT</span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="0.5"
              value={params.BZ_GSM}
              onChange={(e) => onChangeParam("BZ_GSM", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* flow_speed: Solar Wind Speed */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Solar Wind Velocity</span>
              <span className="font-mono text-amber-400 font-bold">{params.flow_speed.toFixed(0)} km/s</span>
            </div>
            <input
              type="range"
              min="250"
              max="1000"
              step="10"
              value={params.flow_speed}
              onChange={(e) => onChangeParam("flow_speed", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* proton_density: Density */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-300">Proton Density</span>
              <span className="font-mono text-amber-400 font-bold">{params.proton_density.toFixed(1)} cm⁻³</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="60"
              step="0.5"
              value={params.proton_density}
              onChange={(e) => onChangeParam("proton_density", parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 2. Simulation & File Upload Controls */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Simulation & Data Controls
            </h3>
          </div>

          {/* Play/Pause & Speed Buttons */}
          <div className="space-y-3 mb-5">
            <button
              onClick={onToggleSimulation}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border shadow-lg ${
                isSimulating
                  ? "bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/40 hover:brightness-110"
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSimulating ? "PAUSE LIVE STREAMING" : "START SIMULATED REAL-TIME STREAM"}</span>
            </button>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400 font-medium">Update Interval</span>
              <div className="flex gap-1.5">
                {[1000, 2000, 5000].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onChangeSpeed(speed)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                      simSpeed === speed
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {speed / 1000}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* File Drag & Drop Upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 mx-auto flex items-center justify-center mb-2 transition-all">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-300 group-hover:text-amber-300">
            Upload CSV (sim.csv)
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Click to process custom solar telemetry dataset
          </p>
        </div>
      </div>
    </div>
  );
};

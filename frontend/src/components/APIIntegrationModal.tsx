"use client";

import React, { useState } from "react";
import { X, Code, Copy, Check, Key, Terminal, Send, Rocket } from "lucide-react";

interface APIIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APIIntegrationModal: React.FC<APIIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [apiKey] = useState("sk_live_suryakavach_99f3a1b8c2d4e7f");

  if (!isOpen) return null;

  const pythonSnippet = `import suryakavach

# Initialize SuryaKavach Enterprise SDK
client = suryakavach.Client(api_key="${apiKey}")

# Fetch 6-Hour Advance Energetic Electron (>2 MeV) Forecast
forecast = client.get_radiation_forecast(horizon="6h", orbit="GEO")

print(f"Predicted Flux: {forecast.predicted_flux_pfu} pfu")
print(f"Dielectric Charging Level: {forecast.dielectric_charging_risk}")

if forecast.dielectric_charging_risk == "CRITICAL":
    print("⚠️ ALERT: Triggering Satellite Automated Payload Safe Mode!")`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-amber-500/20 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-slate-950 font-bold">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                SuryaKavach B2B Space Weather API & SDK
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  For NewSpace Operators
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Plug-and-play Space Weather Intelligence SDK for Satellite Ground Station Control Systems
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

        {/* Key Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[11px] text-slate-400 block">Your Production API Key</span>
              <span className="font-mono text-xs font-bold text-amber-300">{apiKey}</span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
            Active • 100,000 req/mo
          </span>
        </div>

        {/* Code Snippet */}
        <div className="mb-5">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-t-xl border-t border-x border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              suryakavach_example.py
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
          <pre className="bg-[#090d16] p-4 rounded-b-xl border border-slate-800 text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
            {pythonSnippet}
          </pre>
        </div>

        {/* Features Bullet List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">⚡ Zero-Latency REST Endpoints</span>
            <p className="text-slate-400">Low-latency JSON predictions serving 1h, 6h, and 12h forecast horizons.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <span className="font-bold text-white block mb-1">🔔 Automated PagerDuty & Webhooks</span>
            <p className="text-slate-400">Instant webhooks triggered whenever predicted flux exceeds NOAA S3 storm levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

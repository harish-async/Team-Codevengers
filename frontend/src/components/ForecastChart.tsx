"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Activity, Maximize2, Layers } from "lucide-react";

export interface ChartDataPoint {
  timestamp: string;
  timeLabel: string;
  actualFlux: number;
  predictedFlux: number;
  logActual?: number;
  logPredicted?: number;
}

interface ForecastChartProps {
  data: ChartDataPoint[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const [scaleType, setScaleType] = useState<"log" | "linear">("linear");

  // Transform data if log scale is requested
  const processedData = data.map((d) => ({
    ...d,
    displayActual: scaleType === "log" ? Math.log10(Math.max(1, d.actualFlux)) : d.actualFlux,
    displayPredicted: scaleType === "log" ? Math.log10(Math.max(1, d.predictedFlux)) : d.predictedFlux,
  }));

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6">
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Solar Radiation Particle Flux Timeline
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparison of observed GOES particle flux (pfu) vs. SuryaKavach 60-Minute Advance Prediction
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setScaleType("linear")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                scaleType === "linear"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Linear Scale (pfu)
            </button>
            <button
              onClick={() => setScaleType("log")}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                scaleType === "log"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Log Scale (log₁₀)
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[360px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="actualGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
              tickFormatter={(val) => (scaleType === "log" ? `10^${val.toFixed(1)}` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0d1321",
                borderColor: "rgba(245, 158, 11, 0.3)",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                fontSize: "12px",
                color: "#f8fafc",
              }}
              formatter={(value: any, name: any) => [
                typeof value === "number"
                  ? scaleType === "log"
                    ? `10^${value.toFixed(2)} (${Math.pow(10, value).toFixed(1)} pfu)`
                    : `${value.toFixed(2)} pfu`
                  : value,
                name === "displayActual" ? "Observed Flux (t=0)" : "60m Advance Predicted Flux",
              ]}
            />

            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-300">
                  {value === "displayActual" ? "Observed Telemetry (GOES)" : "SuryaKavach 60m Forecast"}
                </span>
              )}
            />

            {/* NOAA Storm Reference Lines */}
            <ReferenceLine
              y={scaleType === "log" ? 1 : 10}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              label={{ value: "S1 Minor (10 pfu)", fill: "#F59E0B", fontSize: 10, position: "insideTopRight" }}
            />
            <ReferenceLine
              y={scaleType === "log" ? 2 : 100}
              stroke="#F97316"
              strokeDasharray="4 4"
              label={{ value: "S2 Moderate (100 pfu)", fill: "#F97316", fontSize: 10, position: "insideTopRight" }}
            />
            <ReferenceLine
              y={scaleType === "log" ? 3 : 1000}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{ value: "S3 Strong (1000 pfu)", fill: "#EF4444", fontSize: 10, position: "insideTopRight" }}
            />

            {/* Lines */}
            <Line
              type="monotone"
              dataKey="displayActual"
              stroke="#38BDF8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#38BDF8" }}
            />
            <Line
              type="monotone"
              dataKey="displayPredicted"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#F59E0B" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

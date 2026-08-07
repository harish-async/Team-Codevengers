"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { ForecastChart, ChartDataPoint } from "@/components/ForecastChart";
import { SubsystemRiskGrid } from "@/components/SubsystemRiskGrid";
import { TelemetryControlPanel, TelemetryParams } from "@/components/TelemetryControlPanel";
import { NOAALegendModal } from "@/components/NOAALegendModal";
import { APIIntegrationModal } from "@/components/APIIntegrationModal";
import SplineBackground from "@/components/SplineBackground";
import { ForecastHorizon } from "@/lib/utils";
import { Sun, ChevronDown } from "lucide-react";
import confetti from "canvas-confetti";

const DEFAULT_PARAMS: TelemetryParams = {
  E2W_COR_FLUX: 399.01,
  F: 4.52,
  BX_GSE: 1.20,
  BY_GSM: -2.31,
  BZ_GSM: -3.85,
  flow_speed: 412.50,
  proton_density: 5.40,
};

export default function Home() {
  const [params, setParams] = useState<TelemetryParams>(DEFAULT_PARAMS);
  const [horizon, setHorizon] = useState<ForecastHorizon>("1h");
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(2000);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [show3DHero, setShow3DHero] = useState<boolean>(true);
  
  // Modals
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  // Predictions State
  const [currentFlux, setCurrentFlux] = useState<number>(399.01);
  const [predictedFlux, setPredictedFlux] = useState<number>(415.20);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>(new Date().toISOString());

  // Chart Buffer
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const stepRef = useRef<number>(0);
  const prevPfuRef = useRef<number>(415.20);
  const analyticsRef = useRef<HTMLDivElement>(null);

  // 1. Initial Seed Data
  useEffect(() => {
    const initialBuffer: ChartDataPoint[] = [];
    const now = new Date();
    let baseFlux = 380;

    for (let i = 25; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const noise = (Math.sin(i * 0.5) * 15) + (Math.cos(i * 0.8) * 10);
      const actual = Math.max(10, baseFlux + noise);
      const pred = Math.max(10, actual * (1 + (Math.sin(i * 0.3) * 0.08)));

      initialBuffer.push({
        timestamp: t.toISOString(),
        timeLabel: timeStr,
        actualFlux: actual,
        predictedFlux: pred,
      });
    }

    setChartData(initialBuffer);
  }, []);

  // 2. Health check connection to FastAPI server
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch("http://localhost:8000/health", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setApiConnected(data.model_loaded === true);
        } else {
          setApiConnected(false);
        }
      } catch {
        setApiConnected(false);
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  // 3. Compute Prediction for active Horizon (1h, 6h, 12h)
  const computePrediction = async (currentParams: TelemetryParams, activeHorizon: ForecastHorizon) => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let nextPredicted = 0;
    const horizonMultiplier = activeHorizon === "12h" ? 1.25 : activeHorizon === "6h" ? 1.12 : 1.0;

    if (apiConnected) {
      try {
        const res = await fetch("http://localhost:8000/api/v1/predict/single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timestamp: now.toISOString(),
            horizon: activeHorizon,
            ...currentParams,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          nextPredicted = data.predictions.predicted_raw_flux_pfu;
        } else {
          nextPredicted = calculatePhysicsPrediction(currentParams) * horizonMultiplier;
        }
      } catch {
        nextPredicted = calculatePhysicsPrediction(currentParams) * horizonMultiplier;
      }
    } else {
      nextPredicted = calculatePhysicsPrediction(currentParams) * horizonMultiplier;
    }

    if (nextPredicted >= 1000 && prevPfuRef.current < 1000) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#EF4444", "#F59E0B", "#F97316"],
      });
    }
    prevPfuRef.current = nextPredicted;

    setCurrentFlux(currentParams.E2W_COR_FLUX);
    setPredictedFlux(nextPredicted);
    setCurrentTimestamp(now.toISOString());

    setChartData((prev) => {
      const updated = [
        ...prev,
        {
          timestamp: now.toISOString(),
          timeLabel,
          actualFlux: currentParams.E2W_COR_FLUX,
          predictedFlux: nextPredicted,
        },
      ];
      return updated.slice(-35);
    });
  };

  const calculatePhysicsPrediction = (p: TelemetryParams): number => {
    const bzEffect = p.BZ_GSM < 0 ? Math.abs(p.BZ_GSM) * 8.5 : -p.BZ_GSM * 2;
    const speedEffect = (p.flow_speed - 400) * 0.35;
    const densityEffect = p.proton_density * 1.8;

    const netChange = (bzEffect + speedEffect + densityEffect) * (p.F / 5.0);
    const predicted = Math.max(1, p.E2W_COR_FLUX + netChange);
    return parseFloat(predicted.toFixed(2));
  };

  // 4. Live Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      stepRef.current += 1;
      const step = stepRef.current;

      const fluxDelta = Math.sin(step * 0.4) * 12 + (Math.cos(step * 0.9) * 8);
      const newFlux = Math.max(15, params.E2W_COR_FLUX + fluxDelta);
      const newBz = -3.5 + Math.sin(step * 0.3) * 4.0;
      const newSpeed = 410 + Math.cos(step * 0.2) * 25;

      const updatedParams: TelemetryParams = {
        ...params,
        E2W_COR_FLUX: parseFloat(newFlux.toFixed(2)),
        BZ_GSM: parseFloat(newBz.toFixed(2)),
        flow_speed: parseFloat(newSpeed.toFixed(1)),
      };

      setParams(updatedParams);
      computePrediction(updatedParams, horizon);
    }, simSpeed);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, params, horizon, apiConnected]);

  const handleParamChange = (key: keyof TelemetryParams, value: number) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    computePrediction(updated, horizon);
  };

  const handleHorizonChange = (newHorizon: ForecastHorizon) => {
    setHorizon(newHorizon);
    computePrediction(params, newHorizon);
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return;

    const newChartPoints: ChartDataPoint[] = [];
    for (let i = 1; i < Math.min(lines.length, 35); i++) {
      const parts = lines[i].split(",");
      if (parts.length >= 2) {
        const timeStr = parts[0].trim();
        const fluxVal = parseFloat(parts[1].trim()) || 100;
        const predVal = fluxVal * (1 + (Math.sin(i * 0.4) * 0.06));

        newChartPoints.push({
          timestamp: timeStr,
          timeLabel: timeStr.includes(" ") ? timeStr.split(" ")[1] : timeStr,
          actualFlux: fluxVal,
          predictedFlux: predVal,
        });
      }
    }

    if (newChartPoints.length > 0) {
      setChartData(newChartPoints);
      const lastPoint = newChartPoints[newChartPoints.length - 1];
      setCurrentFlux(lastPoint.actualFlux);
      setPredictedFlux(lastPoint.predictedFlux);
      setIsSimulating(false);
    }
  };

  const scrollToAnalytics = () => {
    analyticsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col relative cyber-grid">
      {/* Main Navigation Header */}
      <Header
        apiConnected={apiConnected}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        horizon={horizon}
        onChangeHorizon={handleHorizonChange}
        show3DHero={show3DHero}
        onToggle3DHero={() => setShow3DHero(!show3DHero)}
      />

      {/* 1. DEDICATED 3D SOLAR ENVIRONMENT HERO VIEWPORT */}
      {show3DHero && (
        <section className="relative w-full h-[420px] lg:h-[480px] bg-slate-950/90 border-b border-amber-500/20 overflow-hidden group">
          {/* 3D Spline Interactive Scene */}
          <SplineBackground sceneUrl="https://prod.spline.design/10zPux2YFPQ1vlHD/scene.splinecode" />

          {/* Floating Hero Info Card */}
          <div className="absolute bottom-6 left-6 lg:left-12 z-10 glass-panel p-4 rounded-xl border border-amber-500/30 max-w-sm pointer-events-none">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sun className="w-4 h-4 animate-spin-slow" />
              <span>Interactive 3D Solar Model</span>
            </div>
            <p className="text-xs text-slate-300">
              Drag or rotate to inspect current solar flare plasma dynamics and energetic electron acceleration zones.
            </p>
          </div>

          {/* Scroll Down Indicator */}
          <button
            onClick={scrollToAnalytics}
            className="absolute bottom-6 right-6 lg:right-12 z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer shadow-lg"
          >
            <span>Explore Analytics Cockpit</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
          </button>
        </section>
      )}

      {/* 2. MISSION CONTROL ANALYTICS COCKPIT */}
      <main ref={analyticsRef} className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 z-10 relative">
        {/* Top Metric Cards */}
        <MetricCards
          currentFlux={currentFlux}
          predictedFlux={predictedFlux}
          timestamp={currentTimestamp}
        />

        {/* Satellite Subsystem Radiation & Dielectric Risk Analysis Grid */}
        <SubsystemRiskGrid predictedFlux={predictedFlux} />

        {/* Time-series Recharts Line Chart */}
        <ForecastChart data={chartData} />

        {/* Telemetry Control Panel */}
        <TelemetryControlPanel
          params={params}
          onChangeParam={handleParamChange}
          onReset={() => {
            setParams(DEFAULT_PARAMS);
            computePrediction(DEFAULT_PARAMS, horizon);
          }}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          simSpeed={simSpeed}
          onChangeSpeed={setSimSpeed}
          onFileUpload={handleFileUpload}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 glass-panel flex flex-col sm:flex-row items-center justify-between gap-2 z-10 relative">
        <p>☀️ SuryaKavach Enterprise • B2B Space Weather SaaS Platform for GEO & MEO Satellites</p>
        <div className="flex gap-4">
          <button onClick={() => setIsApiModalOpen(true)} className="hover:text-amber-400">Developer API</button>
          <button onClick={() => setIsInfoModalOpen(true)} className="hover:text-amber-400">NOAA Scales</button>
        </div>
      </footer>

      {/* Modals */}
      <NOAALegendModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <APIIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}

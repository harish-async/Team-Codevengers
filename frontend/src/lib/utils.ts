import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFlux(value: number): string {
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " pfu";
  if (value >= 100) return value.toFixed(1) + " pfu";
  if (value >= 10) return value.toFixed(2) + " pfu";
  return value.toFixed(3) + " pfu";
}

export type ForecastHorizon = "1h" | "6h" | "12h";

export interface NOAAInfo {
  code: "S0" | "S1" | "S2" | "S3" | "S4";
  name: string;
  minPfu: number;
  description: string;
  badgeClass: string;
  color: string;
  glowColor: string;
}

export interface SubsystemRiskMetrics {
  dielectricChargingLevel: "NORMAL" | "MODERATE" | "HIGH" | "CRITICAL";
  dielectricColor: string;
  seuBitFlipRate: string; // e.g. "0.02 flips/MB/hr"
  solarArrayDegradation: string; // e.g. "0.005%/day"
  recommendedSatelliteAction: string;
}

export function getNOAAStormLevel(pfu: number): NOAAInfo {
  if (pfu >= 10000) {
    return {
      code: "S4",
      name: "Severe Radiation Storm (>2 MeV)",
      minPfu: 10000,
      description: "Severe hazard to satellite electronics, flight computers, and space station EVA activities.",
      badgeClass: "bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      color: "#A855F7",
      glowColor: "rgba(168, 85, 247, 0.6)"
    };
  }
  if (pfu >= 1000) {
    return {
      code: "S3",
      name: "Strong Radiation Storm (>2 MeV)",
      minPfu: 1000,
      description: "Single-event upset risks to satellite payloads & microcontrollers, polar HF radio blackouts.",
      badgeClass: "bg-red-950/80 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      color: "#EF4444",
      glowColor: "rgba(239, 68, 68, 0.6)"
    };
  }
  if (pfu >= 100) {
    return {
      code: "S2",
      name: "Moderate Radiation Storm (>2 MeV)",
      minPfu: 100,
      description: "Infrequent satellite single-event upsets; elevated radiation doses for polar flight routes.",
      badgeClass: "bg-orange-950/80 text-orange-300 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
      color: "#F97316",
      glowColor: "rgba(249, 115, 22, 0.6)"
    };
  }
  if (pfu >= 10) {
    return {
      code: "S1",
      name: "Minor Radiation Storm (>2 MeV)",
      minPfu: 10,
      description: "Minor impacts on polar HF radio propagation; low-altitude satellite payload monitoring advised.",
      badgeClass: "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
      color: "#F59E0B",
      glowColor: "rgba(245, 158, 11, 0.6)"
    };
  }
  return {
    code: "S0",
    name: "Normal Background Radiation",
    minPfu: 0,
    description: "Quiet energetic electron particle flux (>2 MeV). All space weather metrics within normal operational bounds.",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.5)"
  };
}

export function calculateSubsystemRisks(pfu: number): SubsystemRiskMetrics {
  if (pfu >= 10000) {
    return {
      dielectricChargingLevel: "CRITICAL",
      dielectricColor: "text-purple-400 border-purple-500/40 bg-purple-950/50",
      seuBitFlipRate: "~12.8 flips/MB/hr",
      solarArrayDegradation: "0.15% / day",
      recommendedSatelliteAction: "TRIGGER SAFE MODE: Power down high-voltage payloads & isolate onboard memory buses."
    };
  }
  if (pfu >= 1000) {
    return {
      dielectricChargingLevel: "HIGH",
      dielectricColor: "text-red-400 border-red-500/40 bg-red-950/50",
      seuBitFlipRate: "~3.4 flips/MB/hr",
      solarArrayDegradation: "0.04% / day",
      recommendedSatelliteAction: "PREVENTIVE PAYLOAD SHIELDING: Switch star-trackers to redundant mode & flush RAM buffers."
    };
  }
  if (pfu >= 100) {
    return {
      dielectricChargingLevel: "MODERATE",
      dielectricColor: "text-orange-400 border-orange-500/40 bg-orange-950/50",
      seuBitFlipRate: "~0.6 flips/MB/hr",
      solarArrayDegradation: "0.01% / day",
      recommendedSatelliteAction: "INCREASED MONITORING: Enable error-correcting code (ECC) memory reporting."
    };
  }
  return {
    dielectricChargingLevel: "NORMAL",
    dielectricColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/50",
    seuBitFlipRate: "<0.01 flips/MB/hr",
    solarArrayDegradation: "<0.001% / day",
    recommendedSatelliteAction: "NOMINAL OPERATIONS: All GEO & MEO satellite systems operating normally."
  };
}

# import asyncio
# from contextlib import asynccontextmanager
# import json
# import joblib
# import numpy as np
# import pandas as pd
# from pathlib import Path
# from pydantic import BaseModel
# from fastapi import FastAPI, HTTPException, status
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import FileResponse, StreamingResponse

# # =====================================================================
# # 1. PATH RESOLUTION & FEATURE COLUMN DEFINITIONS
# # =====================================================================
# BASE_DIR = Path(__file__).resolve().parent

# # Dynamic paths resolved relative to main.py
# MODEL_PATH = BASE_DIR.parent / "ML" / "Model" / "suryya-kavach.joblib"
# CSV_PATH = BASE_DIR.parent / "sim.csv"
# INDEX_PATH = BASE_DIR / "index.html"

# TIMESTAMP_COL = "Epoch"
# TARGET_COL = "target_log_flux_1h"

# FEATURE_COLS = [
#     "F", "BX_GSE", "BY_GSM", "BZ_GSM", "flow_speed", "proton_density",
#     "E2W_COR_FLUX", "log_flux", "log_flux_lag_15m", "log_flux_lag_30m",
#     "log_flux_lag_60m", "F_lag_15m", "F_lag_30m", "F_lag_60m",
#     "BX_GSE_lag_15m", "BX_GSE_lag_30m", "BX_GSE_lag_60m",
#     "BY_GSM_lag_15m", "BY_GSM_lag_30m", "BY_GSM_lag_60m",
#     "BZ_GSM_lag_15m", "BZ_GSM_lag_30m", "BZ_GSM_lag_60m",
#     "flow_speed_lag_15m", "flow_speed_lag_30m", "flow_speed_lag_60m",
#     "proton_density_lag_15m", "proton_density_lag_30m", "proton_density_lag_60m",
#     "BZ_GSM_roll_mean_1h", "BZ_GSM_roll_std_1h", "BZ_GSM_roll_mean_3h",
#     "flow_speed_roll_mean_1h", "flow_speed_roll_std_1h", "flow_speed_roll_mean_3h",
#     "log_flux_roll_mean_1h", "log_flux_roll_std_1h", "log_flux_roll_mean_3h"
# ]

# PRELOAD_START = "2019-02-01 00:00:00"
# PRELOAD_END   = "2019-02-05 15:25:00"
# SIM_START     = "2019-02-05 15:25:00"
# SIM_END       = "2019-02-06 06:00:00"

# model = None
# full_df = None
# preloaded_df = None
# simulation_df = None

# class SimulationManager:
#     def __init__(self):
#         self.is_running = False
#         self.current_idx = 0
#         self.delay = 0.5
#         self.total_sim_steps = 0

#     def start(self): self.is_running = True
#     def stop(self): self.is_running = False
#     def restart(self):
#         self.current_idx = 0
#         self.is_running = True

# sim_manager = SimulationManager()

# # =====================================================================
# # 2. LIFESPAN EVENT
# # =====================================================================
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     global model, full_df, preloaded_df, simulation_df
    
#     # Load Trained XGBoost Model
#     try:
#         if MODEL_PATH.exists():
#             model = joblib.load(MODEL_PATH)
#             print(f"✅ XGBoost Model loaded from: {MODEL_PATH}")
#         else:
#             print(f"⚠️ Model file not found at: {MODEL_PATH}. Fallback mode active.")
#     except Exception as e:
#         print(f"⚠️ Model load failed ({e}). Fallback mode active.")

#     # Load Dataset
#     try:
#         full_df = pd.read_csv(CSV_PATH)
#         full_df[TIMESTAMP_COL] = pd.to_datetime(full_df[TIMESTAMP_COL])
        
#         # Fill missing NaN values to prevent JSON serialization errors
#         full_df = full_df.fillna(0.0)
#         print(f"✅ CSV loaded successfully with {len(full_df):,} records (NaNs sanitized).")
#     except Exception as e:
#         print(f"⚠️ Failed to load '{CSV_PATH}': {e}")
#         dates = pd.date_range("2019-02-01 00:00:00", "2019-02-06 06:00:00", freq="h")
#         data_dict = {TIMESTAMP_COL: dates}
#         for col in FEATURE_COLS:
#             data_dict[col] = np.random.normal(0, 1, len(dates))
#         data_dict["flow_speed"] = 400 + 100 * np.sin(np.linspace(0, 20, len(dates)))
#         data_dict["proton_density"] = np.abs(np.random.normal(5, 2, len(dates)))
#         data_dict["BZ_GSM"] = np.random.normal(0, 5, len(dates))
#         data_dict["log_flux"] = np.random.normal(0.5, 0.2, len(dates))
#         data_dict[TARGET_COL] = data_dict["log_flux"] + np.random.normal(0, 0.05)
#         full_df = pd.DataFrame(data_dict)

#     # Slice explicit timeframe ranges
#     preloaded_df = full_df[
#         (full_df[TIMESTAMP_COL] >= PRELOAD_START) & (full_df[TIMESTAMP_COL] <= PRELOAD_END)
#     ].copy()

#     simulation_df = full_df[
#         (full_df[TIMESTAMP_COL] >= SIM_START) & (full_df[TIMESTAMP_COL] <= SIM_END)
#     ].copy()

#     sim_manager.total_sim_steps = len(simulation_df)
    
#     print(f"✅ Preloaded Window ({PRELOAD_START} -> {PRELOAD_END}): {len(preloaded_df)} records.")
#     print(f"✅ Simulation Window ({SIM_START} -> {SIM_END}): {len(simulation_df)} records.")
    
#     yield
#     model = None
#     full_df = None

# # =====================================================================
# # 3. FASTAPI SETUP
# # =====================================================================
# app = FastAPI(title="Space Weather Real-time Stream Engine", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def get_noaa_category(pfu: float) -> str:
#     if pfu >= 10000.0: return "S4"
#     if pfu >= 1000.0:  return "S3"
#     if pfu >= 100.0:   return "S2"
#     if pfu >= 10.0:    return "S1"
#     return "Quiet"

# def log_to_pfu(log_val: float) -> float:
#     return float(max(0.0, (10 ** log_val) - 1))

# # =====================================================================
# # 4. FRONTEND UI ROUTE
# # =====================================================================
# @app.get("/")
# async def serve_frontend():
#     """Serves index.html directly at the root URL."""
#     if not INDEX_PATH.exists():
#         raise HTTPException(
#             status_code=404, 
#             detail=f"index.html not found at {INDEX_PATH}. Please ensure index.html exists in the same folder as main.py."
#         )
#     return FileResponse(INDEX_PATH)

# # =====================================================================
# # 5. STATIC PRELOADED API
# # =====================================================================
# @app.get("/api/preloaded")
# async def get_preloaded_dataset():
#     """Returns static preloaded dataset for building initial baseline charts."""
#     if preloaded_df is None or preloaded_df.empty:
#         raise HTTPException(status_code=500, detail="Preloaded dataset not initialized.")

#     actual_pfu_series = [log_to_pfu(v) for v in preloaded_df["log_flux"]]

#     return {
#         "range": {"start": PRELOAD_START, "end": PRELOAD_END},
#         "total_records": len(preloaded_df),
#         "timestamps": preloaded_df[TIMESTAMP_COL].dt.strftime("%Y-%m-%d %H:%M:%S").tolist(),
#         "actual_pfu": actual_pfu_series,
#         "sw_speed": preloaded_df["flow_speed"].tolist(),
#         "sw_density": preloaded_df["proton_density"].tolist(),
#         "imf_bz": preloaded_df["BZ_GSM"].tolist()
#     }

# # =====================================================================
# # 6. SIMULATION CONTROLS
# # =====================================================================
# @app.post("/api/simulation/start")
# async def start_simulation():
#     sim_manager.start()
#     return {"status": "started", "current_index": sim_manager.current_idx}

# @app.post("/api/simulation/stop")
# async def stop_simulation():
#     sim_manager.stop()
#     return {"status": "stopped", "current_index": sim_manager.current_idx}

# @app.post("/api/simulation/restart")
# async def restart_simulation():
#     sim_manager.restart()
#     return {"status": "restarted", "current_index": 0}

# # =====================================================================
# # 7. NON-BLOCKING SSE STREAMING API
# # =====================================================================
# @app.get("/api/simulation/stream")
# async def stream_simulation():
#     """Streams data point by point without blocking control APIs."""
#     async def event_generator():
#         while True:
#             if sim_manager.is_running and sim_manager.current_idx < len(simulation_df):
#                 row = simulation_df.iloc[sim_manager.current_idx]
                
#                 features_vec = row[FEATURE_COLS].values.astype(np.float32).reshape(1, -1)
                
#                 if model is not None and hasattr(model, "predict"):
#                     pred_log = float(model.predict(features_vec)[0])
#                 else:
#                     pred_log = float(row[TARGET_COL])

#                 pred_pfu = log_to_pfu(pred_log)
#                 actual_target_log = float(row[TARGET_COL])
#                 actual_pfu = log_to_pfu(actual_target_log)

#                 pred_cat = get_noaa_category(pred_pfu)
#                 actual_cat = get_noaa_category(actual_pfu)

#                 payload = {
#                     "step_id": sim_manager.current_idx,
#                     "timestamp": row[TIMESTAMP_COL].strftime("%Y-%m-%d %H:%M:%S"),
#                     "features": {
#                         "sw_speed": float(row["flow_speed"]),
#                         "sw_density": float(row["proton_density"]),
#                         "imf_bz": float(row["BZ_GSM"]),
#                         "current_log_flux": float(row["log_flux"])
#                     },
#                     "predictions": {
#                         "pred_log": round(pred_log, 4),
#                         "pred_pfu": round(pred_pfu, 2),
#                         "pred_category": pred_cat
#                     },
#                     "ground_truth": {
#                         "actual_log": round(actual_target_log, 4),
#                         "actual_pfu": round(actual_pfu, 2),
#                         "actual_category": actual_cat
#                     },
#                     "evaluation": {
#                         "is_accurate": (pred_cat == actual_cat),
#                         "abs_error_pfu": round(abs(pred_pfu - actual_pfu), 2)
#                     }
#                 }

#                 sim_manager.current_idx += 1
#                 yield f"data: {json.dumps(payload)}\n\n"

#             elif sim_manager.current_idx >= len(simulation_df):
#                 sim_manager.stop()
#                 yield f"data: {json.dumps({'event': 'END_OF_STREAM'})}\n\n"

#             await asyncio.sleep(sim_manager.delay)

#     return StreamingResponse(event_generator(), media_type="text/event-stream")









































import asyncio
from contextlib import asynccontextmanager
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

# =====================================================================
# 1. PATH RESOLUTION & FEATURE COLUMN DEFINITIONS
# =====================================================================
BASE_DIR = Path(__file__).resolve().parent

# Dynamic paths resolved relative to main.py
MODEL_PATH = BASE_DIR.parent / "ML" / "Model" / "surya-kavach.joblib"
CSV_PATH = BASE_DIR.parent / "sim.csv"
INDEX_PATH = BASE_DIR / "index1.html"

TIMESTAMP_COL = "Epoch"
TARGET_COL = "target_log_flux_1h"

# Exact 37 features expected by the model (excluding Epoch, E2W_COR_FLUX, and target_log_flux_1h)
FEATURE_COLS = [
    "F", "BX_GSE", "BY_GSM", "BZ_GSM", "flow_speed", "proton_density",
    "log_flux", "log_flux_lag_15m", "log_flux_lag_30m", "log_flux_lag_60m",
    "F_lag_15m", "F_lag_30m", "F_lag_60m",
    "BX_GSE_lag_15m", "BX_GSE_lag_30m", "BX_GSE_lag_60m",
    "BY_GSM_lag_15m", "BY_GSM_lag_30m", "BY_GSM_lag_60m",
    "BZ_GSM_lag_15m", "BZ_GSM_lag_30m", "BZ_GSM_lag_60m",
    "flow_speed_lag_15m", "flow_speed_lag_30m", "flow_speed_lag_60m",
    "proton_density_lag_15m", "proton_density_lag_30m", "proton_density_lag_60m",
    "BZ_GSM_roll_mean_1h", "BZ_GSM_roll_std_1h", "BZ_GSM_roll_mean_3h",
    "flow_speed_roll_mean_1h", "flow_speed_roll_std_1h", "flow_speed_roll_mean_3h",
    "log_flux_roll_mean_1h", "log_flux_roll_std_1h", "log_flux_roll_mean_3h"
]

PRELOAD_START = "2019-02-01 00:00:00"
PRELOAD_END   = "2019-02-05 15:25:00"
SIM_START     = "2019-02-05 15:25:00"
SIM_END       = "2019-02-06 06:00:00"

model = None
full_df = None
preloaded_df = None
simulation_df = None

class SimulationManager:
    def __init__(self):
        self.is_running = False
        self.current_idx = 0
        self.delay = 0.5
        self.total_sim_steps = 0

    def start(self): self.is_running = True
    def stop(self): self.is_running = False
    def restart(self):
        self.current_idx = 0
        self.is_running = True

sim_manager = SimulationManager()

# =====================================================================
# 2. LIFESPAN EVENT
# =====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, full_df, preloaded_df, simulation_df
    
    # Load Trained XGBoost Model
    try:
        if MODEL_PATH.exists():
            model = joblib.load(MODEL_PATH)
            print(f"✅ XGBoost Model loaded from: {MODEL_PATH}")
        else:
            print(f"⚠️ Model file not found at: {MODEL_PATH}. Fallback mode active.")
    except Exception as e:
        print(f"⚠️ Model load failed ({e}). Fallback mode active.")

    # Load Dataset
    try:
        full_df = pd.read_csv(CSV_PATH)
        full_df[TIMESTAMP_COL] = pd.to_datetime(full_df[TIMESTAMP_COL])
        
        # Fill missing NaN values to prevent JSON serialization errors
        full_df = full_df.fillna(0.0)
        print(f"✅ CSV loaded successfully with {len(full_df):,} records (NaNs sanitized).")
    except Exception as e:
        print(f"⚠️ Failed to load '{CSV_PATH}': {e}")
        dates = pd.date_range("2019-02-01 00:00:00", "2019-02-06 06:00:00", freq="h")
        data_dict = {TIMESTAMP_COL: dates}
        for col in FEATURE_COLS:
            data_dict[col] = np.random.normal(0, 1, len(dates))
        data_dict["flow_speed"] = 400 + 100 * np.sin(np.linspace(0, 20, len(dates)))
        data_dict["proton_density"] = np.abs(np.random.normal(5, 2, len(dates)))
        data_dict["BZ_GSM"] = np.random.normal(0, 5, len(dates))
        data_dict["log_flux"] = np.random.normal(0.5, 0.2, len(dates))
        data_dict[TARGET_COL] = data_dict["log_flux"] + np.random.normal(0, 0.05)
        full_df = pd.DataFrame(data_dict)

    # Slice explicit timeframe ranges
    preloaded_df = full_df[
        (full_df[TIMESTAMP_COL] >= PRELOAD_START) & (full_df[TIMESTAMP_COL] <= PRELOAD_END)
    ].copy()

    simulation_df = full_df[
        (full_df[TIMESTAMP_COL] >= SIM_START) & (full_df[TIMESTAMP_COL] <= SIM_END)
    ].copy()

    sim_manager.total_sim_steps = len(simulation_df)
    
    print(f"✅ Preloaded Window ({PRELOAD_START} -> {PRELOAD_END}): {len(preloaded_df)} records.")
    print(f"✅ Simulation Window ({SIM_START} -> {SIM_END}): {len(simulation_df)} records.")
    
    yield
    model = None
    full_df = None

# =====================================================================
# 3. FASTAPI SETUP
# =====================================================================
app = FastAPI(title="Space Weather Real-time Stream Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_noaa_category(pfu: float) -> str:
    if pfu >= 10000.0: return "S4"
    if pfu >= 1000.0:  return "S3"
    if pfu >= 100.0:   return "S2"
    if pfu >= 10.0:    return "S1"
    return "Quiet"

def log_to_pfu(log_val: float) -> float:
    return float(max(0.0, (10 ** log_val) - 1))

# =====================================================================
# 4. FRONTEND UI ROUTE
# =====================================================================
@app.get("/")
async def serve_frontend():
    """Serves index.html directly at the root URL."""
    if not INDEX_PATH.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"index.html not found at {INDEX_PATH}. Please ensure index.html exists in the same folder as main.py."
        )
    return FileResponse(INDEX_PATH)

# =====================================================================
# 5. STATIC PRELOADED API
# =====================================================================
@app.get("/api/preloaded")
async def get_preloaded_dataset():
    """Returns static preloaded dataset for building initial baseline charts."""
    if preloaded_df is None or preloaded_df.empty:
        raise HTTPException(status_code=500, detail="Preloaded dataset not initialized.")

    actual_pfu_series = [log_to_pfu(v) for v in preloaded_df["log_flux"]]

    return {
        "range": {"start": PRELOAD_START, "end": PRELOAD_END},
        "total_records": len(preloaded_df),
        "timestamps": preloaded_df[TIMESTAMP_COL].dt.strftime("%Y-%m-%d %H:%M:%S").tolist(),
        "actual_pfu": actual_pfu_series,
        "sw_speed": preloaded_df["flow_speed"].tolist(),
        "sw_density": preloaded_df["proton_density"].tolist(),
        "imf_bz": preloaded_df["BZ_GSM"].tolist()
    }

# =====================================================================
# 6. SIMULATION CONTROLS
# =====================================================================
@app.post("/api/simulation/start")
async def start_simulation():
    sim_manager.start()
    return {"status": "started", "current_index": sim_manager.current_idx}

@app.post("/api/simulation/stop")
async def stop_simulation():
    sim_manager.stop()
    return {"status": "stopped", "current_index": sim_manager.current_idx}

@app.post("/api/simulation/restart")
async def restart_simulation():
    sim_manager.restart()
    return {"status": "restarted", "current_index": 0}

# =====================================================================
# 7. NON-BLOCKING SSE STREAMING API
# =====================================================================
@app.get("/api/simulation/stream")
async def stream_simulation():
    """Streams data point by point without blocking control APIs."""
    async def event_generator():
        while True:
            if sim_manager.is_running and sim_manager.current_idx < len(simulation_df):
                row = simulation_df.iloc[sim_manager.current_idx]
                
                # Pass a pandas DataFrame containing exact 37 feature columns with names
                features_vec = pd.DataFrame([row[FEATURE_COLS]])
                
                if model is not None and hasattr(model, "predict"):
                    pred_log = float(model.predict(features_vec)[0])
                else:
                    pred_log = float(row[TARGET_COL])

                pred_pfu = log_to_pfu(pred_log)
                actual_target_log = float(row[TARGET_COL])
                actual_pfu = log_to_pfu(actual_target_log)

                pred_cat = get_noaa_category(pred_pfu)
                actual_cat = get_noaa_category(actual_pfu)

                payload = {
                    "step_id": sim_manager.current_idx,
                    "timestamp": row[TIMESTAMP_COL].strftime("%Y-%m-%d %H:%M:%S"),
                    "features": {
                        "sw_speed": float(row["flow_speed"]),
                        "sw_density": float(row["proton_density"]),
                        "imf_bz": float(row["BZ_GSM"]),
                        "current_log_flux": float(row["log_flux"])
                    },
                    "predictions": {
                        "pred_log": round(pred_log, 4),
                        "pred_pfu": round(pred_pfu, 2),
                        "pred_category": pred_cat
                    },
                    "ground_truth": {
                        "actual_log": round(actual_target_log, 4),
                        "actual_pfu": round(actual_pfu, 2),
                        "actual_category": actual_cat
                    },
                    "evaluation": {
                        "is_accurate": (pred_cat == actual_cat),
                        "abs_error_pfu": round(abs(pred_pfu - actual_pfu), 2)
                    }
                }

                sim_manager.current_idx += 1
                yield f"data: {json.dumps(payload)}\n\n"

            elif sim_manager.current_idx >= len(simulation_df):
                sim_manager.stop()
                yield f"data: {json.dumps({'event': 'END_OF_STREAM'})}\n\n"

            await asyncio.sleep(sim_manager.delay)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
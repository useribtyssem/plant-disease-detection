import { useState, useCallback, useRef } from "react";

const API_URL = "http://127.0.0.1:8000";

const DISEASE_TIPS = {
  "Early_blight": "Remove affected leaves immediately. Apply copper-based fungicide every 7–10 days.",
  "Late_blight": "Destroy infected plants. Avoid overhead watering. Use resistant varieties next season.",
  "Bacterial_spot": "Apply copper bactericide. Avoid working with wet plants. Rotate crops yearly.",
  "Septoria_leaf_spot": "Remove infected lower leaves. Mulch around base. Apply fungicide preventively.",
  "Leaf_Mold": "Improve air circulation. Reduce humidity. Apply fungicide if severe.",
  "Spider_mites": "Spray with neem oil or insecticidal soap. Increase humidity around plants.",
  "Target_Spot": "Apply chlorothalonil fungicide. Remove debris. Improve drainage.",
  "YellowLeaf__Curl_Virus": "No cure — remove infected plants immediately to prevent spread.",
  "mosaic_virus": "No cure — remove infected plants. Control aphid vectors.",
  "healthy": "Your plant looks healthy! Keep up the good care routine.",
};

function getTip(disease) {
  for (const [key, tip] of Object.entries(DISEASE_TIPS)) {
    if (disease?.toLowerCase().includes(key.toLowerCase())) return tip;
  }
  return "Monitor your plant regularly and maintain good watering practices.";
}

function ConfidenceBar({ value, color = "#22c55e", animate = true }) {
  return (
    <div style={{ background: "#1a2a1a", borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 99, background: color,
        width: animate ? `${value}%` : 0,
        transition: animate ? "width 1.2s cubic-bezier(0.4,0,0.2,1)" : "none",
      }} />
    </div>
  );
}

function LeafIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c0 0-8-4-8-12a8 8 0 0 1 16 0c0 8-8 12-8 12z" />
      <path d="M12 22V10" />
      <path d="M12 14c2-2 4-3 6-2" />
      <path d="M12 18c-2-2-4-3-6-2" />
    </svg>
  );
}

function ScanLines() {
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden",
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.03) 2px, rgba(34,197,94,0.03) 4px)",
      pointerEvents: "none",
    }} />
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, [handleFile]);

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message.includes("fetch") ? "Cannot connect to API. Make sure uvicorn is running on port 8000." : e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  const confidenceColor = result
    ? result.confidence > 80 ? "#22c55e" : result.confidence > 50 ? "#f59e0b" : "#ef4444"
    : "#22c55e";

  return (
    <div style={{
      minHeight: "100vh", background: "#050e05",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      color: "#c8e6c8", padding: "2rem 1rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a150a; }
        ::-webkit-scrollbar-thumb { background: #1a4a1a; border-radius: 2px; }
        .btn-primary {
          background: #22c55e; color: #030803; border: none;
          padding: 12px 32px; border-radius: 8px; font-size: 14px;
          font-weight: 500; cursor: pointer; width: 100%;
          font-family: 'DM Mono', monospace; letter-spacing: 0.05em;
          transition: all 0.2s; text-transform: uppercase;
        }
        .btn-primary:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .btn-ghost {
          background: transparent; color: #4a7a4a; border: 1px solid #1a3a1a;
          padding: 8px 20px; border-radius: 6px; font-size: 12px;
          cursor: pointer; font-family: 'DM Mono', monospace;
          letter-spacing: 0.08em; transition: all 0.2s; text-transform: uppercase;
        }
        .btn-ghost:hover { border-color: #2a5a2a; color: #6aaa6a; }
        .drop-zone {
          border: 1px dashed #1a4a1a; border-radius: 16px;
          padding: 3rem 2rem; text-align: center; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
          background: rgba(10, 30, 10, 0.5);
        }
        .drop-zone:hover, .drop-zone.active {
          border-color: #22c55e; background: rgba(34, 197, 94, 0.04);
        }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .terminal-text { font-family: 'DM Mono', monospace; }
        .glow { box-shadow: 0 0 20px rgba(34, 197, 94, 0.08); }
      `}</style>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 99, padding: "4px 14px", marginBottom: "1rem",
            fontSize: 11, color: "#4ade80", letterSpacing: "0.1em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} className="pulse" />
            SYSTEM ONLINE — MODEL v1.0 — 97.9% ACC
          </div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 600,
            color: "#f0fdf0", margin: "0 0 8px", letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            Plant Disease<br />
            <span style={{ color: "#22c55e" }}>Detector</span>
          </h1>
          <p style={{ fontSize: 13, color: "#4a7a4a", margin: 0, letterSpacing: "0.03em" }}>
            EfficientNetB0 · Transfer Learning · Grad-CAM XAI
          </p>
        </div>

        {/* Upload zone */}
        {!preview ? (
          <div
            className={`drop-zone ${dragging ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <ScanLines />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 16, opacity: dragging ? 1 : 0.5, transition: "opacity 0.3s" }}>
                <LeafIcon size={40} color="#22c55e" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#6aaa6a", margin: "0 0 6px" }}>
                {dragging ? "Release to upload" : "Drop leaf image here"}
              </p>
              <p style={{ fontSize: 12, color: "#2a4a2a", margin: "0 0 16px" }}>
                JPG · PNG · WEBP · max 10MB
              </p>
              <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}>
                Browse files
              </button>
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 0 }} className="glow">
            <img src={preview} alt="Leaf preview" style={{
              width: "100%", height: 280, objectFit: "cover", display: "block",
              filter: loading ? "brightness(0.4)" : "brightness(0.9) saturate(1.2)",
              transition: "filter 0.4s",
            }} />
            {loading && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: "2px solid #1a3a1a", borderTop: "2px solid #22c55e",
                }} className="spin" />
                <p style={{ fontSize: 12, color: "#4ade80", letterSpacing: "0.1em" }}>ANALYZING LEAF...</p>
              </div>
            )}
            <div style={{
              position: "absolute", top: 12, right: 12, display: "flex", gap: 8,
            }}>
              <button className="btn-ghost" onClick={reset} style={{ padding: "6px 12px", fontSize: 11 }}>
                ✕ Reset
              </button>
            </div>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(5,14,5,0.95))",
              padding: "2rem 1.25rem 1.25rem",
            }}>
              <p style={{ fontSize: 12, color: "#4a7a4a", margin: "0 0 4px" }}>
                {file?.name}
              </p>
            </div>
          </div>
        )}

        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])} />

        {/* Analyze button */}
        {preview && !result && (
          <div style={{ marginTop: 16 }}>
            <button className="btn-primary" onClick={handlePredict} disabled={loading}>
              {loading ? "Scanning..." : "→ Analyze leaf"}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 8,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            fontSize: 13, color: "#f87171",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="fade-in" style={{ marginTop: 16 }}>
            <div style={{
              background: "#080f08", border: "1px solid #1a3a1a",
              borderRadius: 16, overflow: "hidden",
            }} className="glow">

              {/* Result header */}
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #0f1f0f",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <LeafIcon size={16} color="#22c55e" />
                  <span style={{ fontSize: 12, color: "#4a7a4a", letterSpacing: "0.08em" }}>DIAGNOSIS COMPLETE</span>
                </div>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 99,
                  background: result.is_healthy ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  color: result.is_healthy ? "#22c55e" : "#f87171",
                  border: `1px solid ${result.is_healthy ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                  letterSpacing: "0.05em",
                }}>
                  {result.is_healthy ? "● HEALTHY" : "● DISEASED"}
                </span>
              </div>

              {/* Main result */}
              <div style={{ padding: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Plant", value: result.plant },
                    { label: "Disease", value: result.disease },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      background: "#0a150a", borderRadius: 10, padding: "12px 14px",
                      border: "1px solid #0f2a0f",
                    }}>
                      <p style={{ fontSize: 10, color: "#2a5a2a", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                        {label.toUpperCase()}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#a0d4a0", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Confidence */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#2a5a2a", letterSpacing: "0.08em" }}>CONFIDENCE</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: confidenceColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {result.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <ConfidenceBar value={result.confidence} color={confidenceColor} />
                </div>

                {/* Top 3 */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "#2a5a2a", letterSpacing: "0.08em", margin: "0 0 12px" }}>
                    TOP 3 PREDICTIONS
                  </p>
                  {result.top3_predictions.map((p, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: i === 0 ? "#6aaa6a" : "#2a5a2a" }}>
                          {i + 1}. {p.plant} — {p.disease}
                        </span>
                        <span style={{ fontSize: 11, color: i === 0 ? "#4ade80" : "#1a4a1a" }}>
                          {p.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <ConfidenceBar
                        value={p.confidence}
                        color={i === 0 ? "#22c55e" : "#1a4a1a"}
                      />
                    </div>
                  ))}
                </div>

                {/* Tip */}
                <div style={{
                  background: "#030803", border: "1px solid #0f2a0f",
                  borderRadius: 10, padding: "14px 16px",
                  borderLeft: "3px solid #22c55e",
                }}>
                  <p style={{ fontSize: 10, color: "#22c55e", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                    TREATMENT ADVICE
                  </p>
                  <p style={{ fontSize: 13, color: "#6aaa6a", margin: 0, lineHeight: 1.6 }}>
                    {getTip(result.disease)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 20px", borderTop: "1px solid #0f1f0f",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 11, color: "#1a3a1a" }}>
                  {result.model} · {result.accuracy}
                </span>
                <button className="btn-ghost" onClick={reset} style={{ padding: "5px 14px", fontSize: 11 }}>
                  New scan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <p style={{ fontSize: 11, color: "#1a3a1a", letterSpacing: "0.05em" }}>
            built by Ibtissem Ben Hamed · EfficientNetB0 · PlantVillage dataset
          </p>
        </div>
      </div>
    </div>
  );
}

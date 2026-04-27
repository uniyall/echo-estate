"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Bubble {
  id: string;
  label: string;
  x: number; // normalised 0–1 fraction of canvas width
  y: number; // normalised 0–1 fraction of canvas height
}

interface UnplacedScene {
  id: string;
  label: string;
}

const DEFAULT_UNPLACED: UnplacedScene[] = [
  { id: "master", label: "Master Bedroom" },
  { id: "terrace", label: "Terrace View" },
];

const DEFAULT_PLACED: Bubble[] = [
  { id: "kitchen", label: "Kitchen", x: 0.78, y: 0.43 },
  { id: "living", label: "Living Room", x: 0.34, y: 0.76 },
];

export default function ViewMapPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bubbles, setBubbles] = useState<Bubble[]>(DEFAULT_PLACED);
  const [unplaced, setUnplaced] = useState<UnplacedScene[]>(DEFAULT_UNPLACED);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [floorPlanFile, setFloorPlanFile] = useState<string | null>(null);

  const [addingScene, setAddingScene] = useState(false);
  const [newSceneLabel, setNewSceneLabel] = useState("");

  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Load clips from Step 1 as unplaced scenes
  useEffect(() => {
    const stored = localStorage.getItem("echo_upload_clips");
    if (stored) {
      try {
        const clips = JSON.parse(stored) as { id: string; label: string }[];
        if (clips.length > 0) {
          setUnplaced(clips);
          setBubbles([]);
        }
      } catch {
        /* fall through to defaults */
      }
    }
    // Show last-saved timestamp
    const now = new Date();
    setSavedAt(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }, []);

  function handleSceneDragStart(e: React.DragEvent<HTMLDivElement>, id: string, source: "placed" | "unplaced") {
    e.dataTransfer.setData("sceneId", id);
    e.dataTransfer.setData("source", source);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleCanvasDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOverCanvas(true);
  }

  function handleCanvasDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const id = e.dataTransfer.getData("sceneId");
    const source = e.dataTransfer.getData("source");
    if (!id) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.max(0.06, Math.min(0.94, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.06, Math.min(0.94, (e.clientY - rect.top) / rect.height));

    if (source === "unplaced") {
      const scene = unplaced.find((s) => s.id === id);
      if (!scene) return;
      setBubbles((prev) => [...prev, { id, label: scene.label, x, y }]);
      setUnplaced((prev) => prev.filter((s) => s.id !== id));
    } else {
      // Reposition existing bubble
      setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, x, y } : b)));
    }

    const now = new Date();
    setSavedAt(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  }

  function returnToUnplaced(id: string) {
    const bubble = bubbles.find((b) => b.id === id);
    if (!bubble) return;
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setUnplaced((prev) => [...prev, { id: bubble.id, label: bubble.label }]);
  }

  function handleAddScene() {
    if (!newSceneLabel.trim()) return;
    const id = crypto.randomUUID();
    setUnplaced((prev) => [...prev, { id, label: newSceneLabel.trim() }]);
    setNewSceneLabel("");
    setAddingScene(false);
  }

  function handleFloorPlanInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFloorPlanFile(URL.createObjectURL(file));
  }

  function handlePublish() {
    router.push("/upload/processing");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5efe7",
        fontFamily: "var(--font-crimson-pro), serif",
        color: "#3d3028",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          backgroundColor: "#d97757",
          color: "#faf8f5",
          borderBottom: "4px solid #b85f42",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
        className="px-6 py-5 md:px-12"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-lora), serif", fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Echo Estate
            </div>
            <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8, marginTop: "2px" }}>
              Dealer Portal
            </div>
          </div>
          <nav style={{ gap: "20px", paddingLeft: "20px", borderLeft: "1px solid rgba(250,248,245,0.25)" }} className="hidden md:flex">
            {["Dashboard", "Inventory"].map((item) => (
              <Link
                key={item}
                href="#"
                style={{ fontFamily: "var(--font-lora), serif", fontSize: "14px", fontWeight: 600, color: "rgba(250,248,245,0.72)", textDecoration: "none", transition: "color 0.15s ease" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#faf8f5")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(250,248,245,0.72)")}
              >
                {item}
              </Link>
            ))}
            <span style={{ fontFamily: "var(--font-lora), serif", fontSize: "14px", fontWeight: 600, color: "#faf8f5", borderBottom: "2px solid #faf8f5", paddingBottom: "2px" }}>
              Upload New
            </span>
          </nav>
        </div>
        <Link href="/" style={{ fontFamily: "var(--font-lora), serif", fontSize: "14px", fontWeight: 600, color: "rgba(250,248,245,0.82)", textDecoration: "none", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#faf8f5")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(250,248,245,0.82)")}
        >
          ← Listings
        </Link>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1 }} className="px-5 py-10 md:px-12 md:py-14">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Step indicator */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "var(--font-lora), serif", fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#d97757", margin: "0 0 6px" }}>
                  Step 2 of 2
                </p>
                <h1 style={{ fontFamily: "var(--font-lora), serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#2a1f15", margin: 0 }}>
                  View Map Editor
                </h1>
                <p style={{ fontSize: "17px", color: "#6b5d4f", margin: "8px 0 0", lineHeight: 1.5 }}>
                  Drag scenes from the sidebar onto your floor plan to position each walkthrough hotspot.
                </p>
              </div>
              <span style={{ fontFamily: "var(--font-lora), serif", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em", color: "#d97757", backgroundColor: "#fceae5", padding: "6px 16px", borderRadius: "99px", whiteSpace: "nowrap", flexShrink: 0, marginTop: "6px" }}>
                2 / 2
              </span>
            </div>
            <div style={{ height: "4px", backgroundColor: "#ebe1d4", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ width: "100%", height: "100%", backgroundColor: "#d97757", borderRadius: "99px", transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Sidebar ── */}
            <aside style={{ flexShrink: 0 }} className="w-full lg:w-72 space-y-5">

              {/* Canvas Background */}
              <div style={{ backgroundColor: "#faf8f5", border: "3px solid #d4c4b0", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(61,48,40,0.06)" }}>
                <h3 style={{ fontFamily: "var(--font-lora), serif", fontSize: "18px", fontWeight: 700, color: "#2a1f15", margin: "0 0 8px" }}>
                  Canvas Background
                </h3>
                <p style={{ fontSize: "15px", color: "#6b5d4f", lineHeight: 1.55, margin: "0 0 16px" }}>
                  Upload a clear architectural drawing for best results.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-lora), serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#3d3028",
                    backgroundColor: "#faf8f5",
                    border: "2px solid #d4c4b0",
                    borderRadius: "8px",
                    padding: "11px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "border-color 0.18s ease, color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d97757";
                    (e.currentTarget as HTMLButtonElement).style.color = "#d97757";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#d4c4b0";
                    (e.currentTarget as HTMLButtonElement).style.color = "#3d3028";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {floorPlanFile ? "Replace Plan" : "Upload Floor Plan"}
                </button>
                {floorPlanFile && (
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ebe1d4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#6b5d4f" }}>floorplan.jpg</span>
                    <button type="button" onClick={() => setFloorPlanFile(null)} aria-label="Remove floor plan"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#c4b09d", display: "flex", alignItems: "center", padding: "2px", transition: "color 0.15s ease" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#d97757")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#c4b09d")}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFloorPlanInput} style={{ display: "none" }} aria-hidden="true" />
              </div>

              {/* Unplaced Scenes */}
              <div style={{ backgroundColor: "#faf8f5", border: "3px solid #d4c4b0", borderRadius: "12px", padding: "24px", boxShadow: "0 4px 12px rgba(61,48,40,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h3 style={{ fontFamily: "var(--font-lora), serif", fontSize: "18px", fontWeight: 700, color: "#2a1f15", margin: 0 }}>
                    Unplaced Scenes
                  </h3>
                  {unplaced.length > 0 && (
                    <span style={{ backgroundColor: "#ebe1d4", color: "#2a1f15", fontSize: "12px", fontWeight: 700, padding: "2px 10px", borderRadius: "99px" }}>
                      {unplaced.length}
                    </span>
                  )}
                </div>

                {unplaced.length === 0 ? (
                  <p style={{ fontSize: "15px", color: "#6b5d4f", margin: "0 0 16px", lineHeight: 1.5 }}>
                    All scenes are placed on the map.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    {unplaced.map((scene) => (
                      <div
                        key={scene.id}
                        draggable
                        onDragStart={(e) => handleSceneDragStart(e, scene.id, "unplaced")}
                        style={{
                          padding: "11px 14px",
                          backgroundColor: "#f5efe7",
                          borderRadius: "8px",
                          border: "2px solid #ebe1d4",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "grab",
                          transition: "border-color 0.15s ease, transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "#d4c4b0";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateX(2px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "#ebe1d4";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                        }}
                      >
                        {/* Drag handle */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b09d" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <line x1="8" y1="6" x2="8" y2="6" strokeWidth="3" />
                          <line x1="16" y1="6" x2="16" y2="6" strokeWidth="3" />
                          <line x1="8" y1="12" x2="8" y2="12" strokeWidth="3" />
                          <line x1="16" y1="12" x2="16" y2="12" strokeWidth="3" />
                          <line x1="8" y1="18" x2="8" y2="18" strokeWidth="3" />
                          <line x1="16" y1="18" x2="16" y2="18" strokeWidth="3" />
                        </svg>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: "var(--font-lora), serif", fontSize: "14px", fontWeight: 600, color: "#2a1f15", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {scene.label}
                          </p>
                          <p style={{ fontSize: "13px", color: "#6b5d4f", margin: "2px 0 0" }}>drag to place</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new scene */}
                {addingScene ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      autoFocus
                      type="text"
                      value={newSceneLabel}
                      onChange={(e) => setNewSceneLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddScene(); }
                        if (e.key === "Escape") { setAddingScene(false); setNewSceneLabel(""); }
                      }}
                      placeholder="Scene name…"
                      style={{
                        width: "100%",
                        fontFamily: "var(--font-crimson-pro), serif",
                        fontSize: "15px",
                        color: "#3d3028",
                        backgroundColor: "#faf8f5",
                        border: "2px solid #d97757",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        outline: "none",
                        boxSizing: "border-box",
                        boxShadow: "0 0 0 3px rgba(217,119,87,0.12)",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={handleAddScene}
                        style={{ flex: 1, fontFamily: "var(--font-lora), serif", fontSize: "13px", fontWeight: 600, color: "#faf8f5", backgroundColor: "#d97757", border: "none", borderRadius: "6px", padding: "9px", cursor: "pointer", transition: "background-color 0.15s ease" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b85f42")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d97757")}
                      >Add</button>
                      <button type="button" onClick={() => { setAddingScene(false); setNewSceneLabel(""); }}
                        style={{ flex: 1, fontFamily: "var(--font-lora), serif", fontSize: "13px", fontWeight: 600, color: "#6b5d4f", backgroundColor: "#ebe1d4", border: "none", borderRadius: "6px", padding: "9px", cursor: "pointer", transition: "background-color 0.15s ease" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d4c4b0")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ebe1d4")}
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingScene(true)}
                    style={{
                      width: "100%",
                      fontFamily: "var(--font-lora), serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#d97757",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px",
                      borderRadius: "6px",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fceae5")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add New Scene
                  </button>
                )}
              </div>
            </aside>

            {/* ── Canvas ── */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                ref={canvasRef}
                onDragOver={handleCanvasDragOver}
                onDragLeave={() => setIsDragOverCanvas(false)}
                onDrop={handleCanvasDrop}
                style={{
                  position: "relative",
                  backgroundColor: "#faf8f5",
                  border: `3px solid ${isDragOverCanvas ? "#d97757" : "#d4c4b0"}`,
                  borderRadius: "12px",
                  boxShadow: isDragOverCanvas
                    ? "0 0 0 4px rgba(217,119,87,0.15), 0 8px 24px rgba(61,48,40,0.12)"
                    : "0 8px 24px rgba(61,48,40,0.10)",
                  minHeight: "520px",
                  overflow: "hidden",
                  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                  backgroundImage: "radial-gradient(circle, #d4c4b0 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              >
                {/* Floor plan SVG or uploaded image */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
                  {floorPlanFile ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={floorPlanFile} alt="Floor plan" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", opacity: 0.85, mixBlendMode: "multiply" }} />
                  ) : (
                    <svg
                      viewBox="0 0 500 380"
                      width="100%"
                      style={{ maxHeight: "460px", opacity: 0.75 }}
                      aria-label="Sample floor plan"
                      role="img"
                    >
                      {/* Outer walls */}
                      <rect x="12" y="12" width="476" height="356" fill="none" stroke="#6b5d4f" strokeWidth="6" strokeLinejoin="round" />
                      {/* Bedroom 1 / Bedroom 2 divider (vertical at x=195, y=12–188) with door gap */}
                      <line x1="195" y1="12" x2="195" y2="140" stroke="#6b5d4f" strokeWidth="4" />
                      <line x1="195" y1="168" x2="195" y2="188" stroke="#6b5d4f" strokeWidth="4" />
                      {/* Door arc Bed1→hallway */}
                      <path d="M195 168 Q167 168 167 140" fill="none" stroke="#c4b09d" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Top/bottom divider (horizontal at y=188, x=12–330) with door gap */}
                      <line x1="12" y1="188" x2="130" y2="188" stroke="#6b5d4f" strokeWidth="4" />
                      <line x1="160" y1="188" x2="330" y2="188" stroke="#6b5d4f" strokeWidth="4" />
                      {/* Door arc top→living */}
                      <path d="M130 188 Q130 162 158 162" fill="none" stroke="#c4b09d" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Right column top divider (vertical at x=330, y=12–188) */}
                      <line x1="330" y1="12" x2="330" y2="188" stroke="#6b5d4f" strokeWidth="4" />
                      {/* Bathroom/kitchen divider (horizontal at y=132, x=330–488) with door gap */}
                      <line x1="330" y1="132" x2="390" y2="132" stroke="#6b5d4f" strokeWidth="4" />
                      <line x1="418" y1="132" x2="488" y2="132" stroke="#6b5d4f" strokeWidth="4" />
                      {/* Door arc bath→kitchen */}
                      <path d="M390 132 Q390 108 418 108" fill="none" stroke="#c4b09d" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Living/dining divider (vertical at x=320, y=188–368) with door gap */}
                      <line x1="320" y1="188" x2="320" y2="268" stroke="#6b5d4f" strokeWidth="4" />
                      <line x1="320" y1="298" x2="320" y2="368" stroke="#6b5d4f" strokeWidth="4" />
                      {/* Door arc living→dining */}
                      <path d="M320 268 Q294 268 294 298" fill="none" stroke="#c4b09d" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Room labels */}
                      <text x="100" y="102" textAnchor="middle" fill="#c4b09d" fontSize="13" fontFamily="Georgia, serif">Bedroom 1</text>
                      <text x="260" y="102" textAnchor="middle" fill="#c4b09d" fontSize="12" fontFamily="Georgia, serif">Bedroom 2</text>
                      <text x="408" y="74" textAnchor="middle" fill="#c4b09d" fontSize="11" fontFamily="Georgia, serif">Bathroom</text>
                      <text x="408" y="164" textAnchor="middle" fill="#c4b09d" fontSize="11" fontFamily="Georgia, serif">Kitchen</text>
                      <text x="167" y="285" textAnchor="middle" fill="#c4b09d" fontSize="14" fontFamily="Georgia, serif">Living Room</text>
                      <text x="404" y="285" textAnchor="middle" fill="#c4b09d" fontSize="11" fontFamily="Georgia, serif">Dining</text>
                    </svg>
                  )}
                </div>

                {/* Placed hotspot bubbles */}
                {bubbles.map((bubble) => (
                  <div
                    key={bubble.id}
                    draggable
                    onDragStart={(e) => handleSceneDragStart(e, bubble.id, "placed")}
                    onMouseEnter={() => setHoveredId(bubble.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      position: "absolute",
                      left: `${bubble.x * 100}%`,
                      top: `${bubble.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {/* Bubble */}
                    <div
                      className="hotspot-pulse"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#d97757",
                        border: "3px solid #faf8f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#faf8f5" stroke="none" aria-hidden="true">
                        <path d="M15 10l-8 4 8 4V10z" />
                        <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="#faf8f5" strokeWidth="1.5" />
                        <path d="m10 8 6 4-6 4V8z" fill="#faf8f5" />
                      </svg>
                    </div>

                    {/* Label tag */}
                    <div
                      style={{
                        backgroundColor: hoveredId === bubble.id ? "#d97757" : "#2a1f15",
                        color: "#faf8f5",
                        padding: "4px 10px",
                        borderRadius: "99px",
                        fontSize: "12px",
                        fontFamily: "var(--font-lora), serif",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 8px rgba(61,48,40,0.18)",
                        transition: "background-color 0.15s ease",
                        userSelect: "none",
                      }}
                    >
                      {bubble.label}
                    </div>

                    {/* Remove button on hover */}
                    {hoveredId === bubble.id && (
                      <button
                        type="button"
                        onClick={() => returnToUnplaced(bubble.id)}
                        aria-label={`Return ${bubble.label} to unplaced`}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#faf8f5",
                          border: "2px solid #d4c4b0",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(61,48,40,0.15)",
                          zIndex: 20,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b5d4f" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}

                {/* Empty state hint */}
                {bubbles.length === 0 && !isDragOverCanvas && (
                  <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(42,31,21,0.82)", color: "#faf8f5", padding: "10px 20px", borderRadius: "99px", fontSize: "14px", fontFamily: "var(--font-lora), serif", fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px", pointerEvents: "none" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Drag scenes from the sidebar onto the map
                  </div>
                )}

                {isDragOverCanvas && (
                  <div style={{ position: "absolute", inset: 0, border: "3px dashed #d97757", borderRadius: "10px", backgroundColor: "rgba(217,119,87,0.06)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <p style={{ fontFamily: "var(--font-lora), serif", fontSize: "16px", fontWeight: 600, color: "#d97757" }}>Drop to place scene</p>
                  </div>
                )}

                {/* Zoom controls */}
                <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ backgroundColor: "rgba(250,248,245,0.92)", backdropFilter: "blur(4px)", border: "2px solid #d4c4b0", borderRadius: "8px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 2px 8px rgba(61,48,40,0.10)" }}>
                    {[{ label: "+", title: "Zoom in" }, { label: "−", title: "Zoom out" }].map((btn, i) => (
                      <button
                        key={btn.label}
                        type="button"
                        title={btn.title}
                        style={{
                          background: "none",
                          border: "none",
                          borderTop: i > 0 ? "1px solid #ebe1d4" : "none",
                          cursor: "pointer",
                          padding: "10px 14px",
                          fontFamily: "var(--font-lora), serif",
                          fontSize: "18px",
                          fontWeight: 300,
                          color: "#3d3028",
                          transition: "background-color 0.15s ease",
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ebe1d4")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent")}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" title="Fullscreen"
                    style={{ backgroundColor: "rgba(250,248,245,0.92)", backdropFilter: "blur(4px)", border: "2px solid #d4c4b0", borderRadius: "8px", cursor: "pointer", padding: "10px", color: "#3d3028", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(61,48,40,0.10)", transition: "background-color 0.15s ease" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ebe1d4")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(250,248,245,0.92)")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                  </button>
                </div>
              </div>

              {/* Footer actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "16px", borderTop: "2px solid #ebe1d4" }}>
                <Link
                  href="/upload"
                  style={{ fontFamily: "var(--font-lora), serif", fontSize: "15px", fontWeight: 600, color: "#6b5d4f", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", padding: "11px 20px", border: "2px solid #d4c4b0", borderRadius: "8px", transition: "border-color 0.18s ease, color 0.18s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#c4b09d"; (e.currentTarget as HTMLAnchorElement).style.color = "#3d3028"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#d4c4b0"; (e.currentTarget as HTMLAnchorElement).style.color = "#6b5d4f"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Back
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {savedAt && (
                    <span style={{ fontSize: "14px", color: "#6b5d4f" }} className="hidden sm:inline">
                      Changes auto-saved at {savedAt}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handlePublish}
                    style={{ fontFamily: "var(--font-lora), serif", fontSize: "15px", fontWeight: 600, color: "#faf8f5", backgroundColor: "#d97757", border: "none", borderRadius: "8px", padding: "11px 28px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(217,119,87,0.28)", transition: "background-color 0.18s ease, transform 0.18s ease" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b85f42"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#d97757"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  >
                    Publish Listing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

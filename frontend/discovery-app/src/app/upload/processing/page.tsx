"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProcessingPage() {
  const [propertyTitle, setPropertyTitle] = useState("Your Property");
  const [clipsCount, setClipsCount] = useState(1);

  useEffect(() => {
    const title = localStorage.getItem("echo_upload_title");
    const clips = localStorage.getItem("echo_upload_clips");
    if (title) setPropertyTitle(title);
    if (clips) {
      try {
        setClipsCount(JSON.parse(clips).length || 1);
      } catch {
        /* ignore */
      }
    }
  }, []);

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
          <nav style={{ display: "flex", gap: "20px", paddingLeft: "20px", borderLeft: "1px solid rgba(250,248,245,0.25)" }} className="hidden md:flex">
            {["Inventory", "Analytics"].map((item) => (
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
              Dashboard
            </span>
          </nav>
        </div>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-lora), serif", fontSize: "14px", fontWeight: 600, color: "rgba(250,248,245,0.82)", textDecoration: "none", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#faf8f5")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(250,248,245,0.82)")}
        >
          ← Listings
        </Link>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
        className="px-5 py-12 md:px-12 md:py-20"
      >
        {/* Decorative background blobs */}
        <div
          className="organic-breathe"
          style={{
            position: "absolute",
            top: "-15%",
            left: "-8%",
            width: "420px",
            height: "420px",
            background: "linear-gradient(45deg, #d97757, #f5efe7)",
            opacity: 0.12,
            pointerEvents: "none",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
          aria-hidden="true"
        />
        <div
          className="organic-breathe"
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-6%",
            width: "520px",
            height: "520px",
            background: "linear-gradient(135deg, #ebe1d4, #d97757)",
            opacity: 0.07,
            pointerEvents: "none",
            borderRadius: "40% 60% 70% 30% / 30% 60% 40% 70%",
            animationDelay: "2.5s",
          }}
          aria-hidden="true"
        />

        {/* Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "620px",
            backgroundColor: "#faf8f5",
            border: "3px solid #d4c4b0",
            borderRadius: "12px",
            padding: "clamp(32px, 5vw, 56px)",
            boxShadow: "0 20px 50px rgba(61,48,40,0.10)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Animated splat blob */}
          <div
            style={{ position: "relative", marginBottom: "36px", width: "160px", height: "160px", flexShrink: 0 }}
            aria-hidden="true"
          >
            <div
              className="organic-breathe"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, #d97757 0%, #ebe1d4 100%)",
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              }}
            />
            {/* Inner frosted circle */}
            <div
              style={{
                position: "absolute",
                inset: "24px",
                borderRadius: "50%",
                backgroundColor: "rgba(250,248,245,0.28)",
                backdropFilter: "blur(2px)",
                border: "1.5px solid rgba(250,248,245,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#faf8f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            {/* Floating particles */}
            <div style={{ position: "absolute", top: "4px", right: "4px", width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#d97757", opacity: 0.55 }} />
            <div style={{ position: "absolute", bottom: "18px", left: "-4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#c4b09d", opacity: 0.45 }} />
            <div style={{ position: "absolute", top: "28px", left: "8px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#b85f42", opacity: 0.35 }} />
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#2a1f15",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            We&apos;re Processing Your Scenes
          </h1>

          {/* Body */}
          <div style={{ maxWidth: "460px", marginBottom: "32px" }}>
            <p style={{ fontSize: "18px", color: "#3d3028", lineHeight: 1.7, margin: "0 0 12px" }}>
              Our pipeline is transforming your {clipsCount === 1 ? "clip" : `${clipsCount} clips`} into immersive 3D scenes. This usually takes about{" "}
              <strong style={{ color: "#d97757", fontWeight: 600 }}>15–20 minutes</strong>.
            </p>
            <p style={{ fontSize: "16px", color: "#6b5d4f", lineHeight: 1.6, fontStyle: "italic", margin: "0 0 16px" }}>
              Using Gaussian Splatting, every detail of the property is captured with natural, grounded depth.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#6b5d4f" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span style={{ fontSize: "15px", fontFamily: "var(--font-lora), serif", fontWeight: 600 }}>
                We&apos;ll notify you once your listing is live
              </span>
            </div>
          </div>

          {/* Property preview card */}
          <div
            style={{
              width: "100%",
              backgroundColor: "rgba(250,248,245,0.6)",
              border: "2px solid #ebe1d4",
              borderRadius: "10px",
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
              textAlign: "left",
            }}
          >
            {/* Thumbnail placeholder with spinner */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "8px",
                backgroundColor: "#ebe1d4",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Greyed house icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c4b09d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21V11l9-7 9 7v10" />
                <path d="M9 21v-6h6v6" />
              </svg>
              {/* Spinning overlay */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "2.5px solid rgba(217,119,87,0.25)",
                    borderTopColor: "#d97757",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.85s linear infinite",
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#2a1f15",
                  margin: "0 0 4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {propertyTitle}
              </p>
              <p style={{ fontSize: "12px", color: "#6b5d4f", margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Processing 3D tour
              </p>
              {/* Progress bar */}
              <div style={{ marginTop: "8px", height: "3px", backgroundColor: "#ebe1d4", borderRadius: "99px", overflow: "hidden" }}>
                <div
                  style={{
                    width: "72%",
                    height: "100%",
                    backgroundColor: "#d97757",
                    borderRadius: "99px",
                    background: "linear-gradient(90deg, #d97757, #b85f42)",
                  }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "#d97757", margin: "4px 0 0", fontFamily: "var(--font-lora), serif", fontWeight: 600 }}>
                72% complete
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }} className="sm:flex-row sm:justify-center">
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#faf8f5",
                backgroundColor: "#d97757",
                textDecoration: "none",
                borderRadius: "8px",
                padding: "13px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(217,119,87,0.28)",
                transition: "background-color 0.18s ease, transform 0.18s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#b85f42";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#d97757";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              Back to Dashboard
            </Link>
            <Link
              href="#"
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#d97757",
                textDecoration: "none",
                borderRadius: "8px",
                padding: "13px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.18s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#fceae5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent")}
            >
              View Pending Listing
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "20px 24px",
          borderTop: "1px solid #ebe1d4",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <p style={{ fontSize: "13px", color: "#6b5d4f", margin: 0 }}>
          © 2025 Echo Estate · Dealer Portal
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {["Support", "Documentation", "Terms of Service"].map((link, i, arr) => (
            <span key={link} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                href="#"
                style={{ fontFamily: "var(--font-lora), serif", fontSize: "13px", fontWeight: 600, color: "#6b5d4f", textDecoration: "none", transition: "color 0.15s ease" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#d97757")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6b5d4f")}
              >
                {link}
              </Link>
              {i < arr.length - 1 && <span style={{ color: "#d4c4b0" }}>·</span>}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

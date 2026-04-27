"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Clip {
  id: string;
  label: string;
  fileName: string;
  sizeMb: string;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-crimson-pro), serif",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "#6b5d4f",
  marginBottom: "8px",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-crimson-pro), serif",
  fontSize: "17px",
  color: "#3d3028",
  backgroundColor: "#faf8f5",
  border: "2px solid #c4b09d",
  borderRadius: "8px",
  padding: "13px 18px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
        paddingBottom: "16px",
        borderBottom: "2px solid #ebe1d4",
      }}
    >
      {icon}
      <h2
        style={{
          fontFamily: "var(--font-lora), serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "#2a1f15",
          margin: 0,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function UploadPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [clips, setClips] = useState<Clip[]>([]);
  const [clipLabel, setClipLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function focusOn(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#d97757";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 119, 87, 0.12)";
  }
  function focusOff(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = errors[e.currentTarget.id]
      ? "#d97757"
      : "#c4b09d";
    e.currentTarget.style.boxShadow = "none";
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "video/mp4" || file.type === "video/quicktime")
    ) {
      setPendingFile(file);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  }

  function addClip() {
    if (!clipLabel.trim()) return;
    const fileName = pendingFile?.name ?? "scene_clip.mp4";
    const bytes =
      pendingFile?.size ?? Math.floor(Math.random() * 30 + 8) * 1024 * 1024;
    const sizeMb = (bytes / (1024 * 1024)).toFixed(1);

    setClips((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: clipLabel.trim(), fileName, sizeMb },
    ]);
    setClipLabel("");
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeClip(id: string) {
    setClips((prev) => prev.filter((c) => c.id !== id));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Property title is required.";
    if (!address.trim()) e.address = "Address is required.";
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Enter a valid price.";
    if (!bedrooms || isNaN(Number(bedrooms)) || Number(bedrooms) <= 0)
      e.bedrooms = "Enter number of bedrooms.";
    return e;
  }

  function handleContinue() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    localStorage.setItem("echo_upload_title", title);
    localStorage.setItem(
      "echo_upload_clips",
      JSON.stringify(clips.map((c) => ({ id: c.id, label: c.label }))),
    );
    router.push("/upload/viewmap");
  }

  const canAddClip = clipLabel.trim().length > 0;

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
            <div
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "clamp(20px, 2.5vw, 26px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Echo Estate
            </div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: 0.8,
                marginTop: "2px",
              }}
            >
              Dealer Portal
            </div>
          </div>
          <nav
            style={{
              display: "flex",
              gap: "20px",
              paddingLeft: "20px",
              borderLeft: "1px solid rgba(250,248,245,0.25)",
            }}
            className="hidden md:flex"
          >
            {["Dashboard", "Inventory"].map((item) => (
              <Link
                key={item}
                href="#"
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "rgba(250,248,245,0.72)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#faf8f5")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "rgba(250,248,245,0.72)")
                }
              >
                {item}
              </Link>
            ))}
            <span
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "#faf8f5",
                borderBottom: "2px solid #faf8f5",
                paddingBottom: "2px",
              }}
            >
              Upload New
            </span>
          </nav>
        </div>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-lora), serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "rgba(250,248,245,0.82)",
            textDecoration: "none",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#faf8f5")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(250,248,245,0.82)")
          }
        >
          ← Listings
        </Link>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1 }} className="px-5 py-10 md:px-12 md:py-14">
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Step indicator */}
          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: "14px",
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#2a1f15",
                  margin: 0,
                }}
              >
                Property Details &amp; Media
              </h1>
              <span
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "#d97757",
                  backgroundColor: "#fceae5",
                  padding: "6px 16px",
                  borderRadius: "99px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginTop: "6px",
                }}
              >
                Step 1 of 2
              </span>
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: "#ebe1d4",
                borderRadius: "99px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "50%",
                  height: "100%",
                  backgroundColor: "#d97757",
                  borderRadius: "99px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Form card */}
          <div
            style={{
              backgroundColor: "#faf8f5",
              border: "3px solid #d4c4b0",
              borderRadius: "12px",
              padding: "clamp(24px, 4vw, 40px)",
              boxShadow: "0 4px 12px rgba(61, 48, 40, 0.08)",
            }}
          >
            {/* ── Section A: Basic Details ── */}
            <section style={{ marginBottom: "40px" }}>
              <SectionHeading
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97757"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 21V11l9-7 9 7v10" />
                    <path d="M9 21v-6h6v6" />
                  </svg>
                }
              >
                Basic Details
              </SectionHeading>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "20px",
                }}
              >
                {/* Title */}
                <div>
                  <label htmlFor="prop-title" style={labelStyle}>
                    Property Title
                  </label>
                  <input
                    id="prop-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="e.g. Sunlit Terracotta Villa in Sedona"
                    style={{
                      ...baseInputStyle,
                      borderColor: errors.title ? "#d97757" : "#c4b09d",
                    }}
                  />
                  {errors.title && (
                    <p
                      style={{
                        color: "#d97757",
                        fontSize: "14px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="prop-address" style={labelStyle}>
                    Address
                  </label>
                  <input
                    id="prop-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="Full street address, city, and state"
                    style={{
                      ...baseInputStyle,
                      borderColor: errors.address ? "#d97757" : "#c4b09d",
                    }}
                  />
                  {errors.address && (
                    <p
                      style={{
                        color: "#d97757",
                        fontSize: "14px",
                        marginTop: "6px",
                      }}
                    >
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Price + Bedrooms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="prop-price" style={labelStyle}>
                      Price (₹)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "18px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b5d4f",
                          fontFamily: "var(--font-crimson-pro), serif",
                          fontSize: "17px",
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      >
                        ₹
                      </span>
                      <input
                        id="prop-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onFocus={focusOn}
                        onBlur={focusOff}
                        placeholder="0"
                        style={{
                          ...baseInputStyle,
                          paddingLeft: "34px",
                          borderColor: errors.price ? "#d97757" : "#c4b09d",
                        }}
                      />
                    </div>
                    {errors.price && (
                      <p
                        style={{
                          color: "#d97757",
                          fontSize: "14px",
                          marginTop: "6px",
                        }}
                      >
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="prop-beds" style={labelStyle}>
                      Bedrooms
                    </label>
                    <input
                      id="prop-beds"
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="Number of bedrooms"
                      style={{
                        ...baseInputStyle,
                        borderColor: errors.bedrooms ? "#d97757" : "#c4b09d",
                      }}
                    />
                    {errors.bedrooms && (
                      <p
                        style={{
                          color: "#d97757",
                          fontSize: "14px",
                          marginTop: "6px",
                        }}
                      >
                        {errors.bedrooms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div>
                  <label htmlFor="prop-thumb" style={labelStyle}>
                    Thumbnail Image URL{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        opacity: 0.65,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    id="prop-thumb"
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="https://images.unsplash.com/..."
                    style={baseInputStyle}
                  />
                </div>
              </div>
            </section>

            {/* ── Section B: Upload Scene Clips ── */}
            <section>
              <SectionHeading
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97757"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <path d="m10 8 6 4-6 4V8z" />
                  </svg>
                }
              >
                Upload Scene Clips
              </SectionHeading>

              <p
                style={{
                  fontSize: "17px",
                  color: "#6b5d4f",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                }}
              >
                Our pipeline will transform each clip into an immersive 3D scene
                via Gaussian Splatting. Upload 20–30 second clips of each key
                space.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5 items-start">
                {/* Drop zone */}
                <div>
                  <div
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    style={{
                      border: `2px dashed ${isDragOver ? "#d97757" : pendingFile ? "#b85f42" : "#c4b09d"}`,
                      borderRadius: "10px",
                      backgroundColor: isDragOver
                        ? "rgba(217,119,87,0.05)"
                        : "#f5efe7",
                      padding: "36px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition:
                        "border-color 0.18s ease, background-color 0.18s ease",
                    }}
                  >
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={
                        pendingFile
                          ? "#b85f42"
                          : isDragOver
                            ? "#d97757"
                            : "#c4b09d"
                      }
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ transition: "stroke 0.18s ease" }}
                    >
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <path d="m10 8 6 4-6 4V8z" />
                    </svg>

                    {pendingFile ? (
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-lora), serif",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#b85f42",
                            margin: 0,
                          }}
                        >
                          {pendingFile.name}
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6b5d4f",
                            margin: "4px 0 0",
                          }}
                        >
                          {(pendingFile.size / (1024 * 1024)).toFixed(1)} MB ·
                          click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-lora), serif",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#3d3028",
                            margin: 0,
                          }}
                        >
                          Drag your clip here, or click to browse
                        </p>
                        <p
                          style={{
                            fontSize: "14px",
                            color: "#6b5d4f",
                            margin: "4px 0 0",
                          }}
                        >
                          MP4 or MOV · up to 50 MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      id="clip-file-input"
                      type="file"
                      accept="video/mp4,video/quicktime"
                      onChange={handleFileInput}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Clip label + add */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label htmlFor="clip-label" style={labelStyle}>
                      Scene Label
                    </label>
                    <input
                      id="clip-label"
                      type="text"
                      value={clipLabel}
                      onChange={(e) => setClipLabel(e.target.value)}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addClip();
                        }
                      }}
                      placeholder="e.g. Master Bedroom"
                      style={baseInputStyle}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addClip}
                    disabled={!canAddClip}
                    style={{
                      width: "100%",
                      fontFamily: "var(--font-lora), serif",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: canAddClip ? "#faf8f5" : "#6b5d4f",
                      backgroundColor: canAddClip ? "#d97757" : "#ebe1d4",
                      border: "none",
                      borderRadius: "8px",
                      padding: "13px 16px",
                      cursor: canAddClip ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "background-color 0.18s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (canAddClip)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "#b85f42";
                    }}
                    onMouseLeave={(e) => {
                      if (canAddClip)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "#d97757";
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Clip
                  </button>
                </div>
              </div>

              {/* Clips list */}
              {clips.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <p style={{ ...labelStyle, marginBottom: "12px" }}>
                    Added Clips ({clips.length})
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {clips.map((clip) => (
                      <div
                        key={clip.id}
                        style={{
                          backgroundColor: "#fff",
                          border: "2px solid #ebe1d4",
                          borderRadius: "8px",
                          padding: "13px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          transition: "border-color 0.18s ease",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = "#d4c4b0")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = "#ebe1d4")
                        }
                      >
                        {/* Thumbnail placeholder */}
                        <div
                          style={{
                            width: "64px",
                            height: "44px",
                            flexShrink: 0,
                            backgroundColor: "#ebe1d4",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6b5d4f"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect x="2" y="3" width="20" height="18" rx="2" />
                            <path d="m10 8 6 4-6 4V8z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontFamily: "var(--font-lora), serif",
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "#2a1f15",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {clip.label}
                          </p>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#6b5d4f",
                              margin: "3px 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {clip.fileName} · {clip.sizeMb} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeClip(clip.id)}
                          aria-label={`Remove ${clip.label}`}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                            color: "#c4b09d",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                            transition:
                              "color 0.15s ease, background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "#d97757";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.backgroundColor = "#fceae5";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "#c4b09d";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.backgroundColor = "transparent";
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Footer actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "2px solid #ebe1d4",
            }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#6b5d4f",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 20px",
                border: "2px solid #d4c4b0",
                borderRadius: "8px",
                transition: "border-color 0.18s ease, color 0.18s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "#c4b09d";
                (e.currentTarget as HTMLAnchorElement).style.color = "#3d3028";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor =
                  "#d4c4b0";
                (e.currentTarget as HTMLAnchorElement).style.color = "#6b5d4f";
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleContinue}
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#faf8f5",
                backgroundColor: "#d97757",
                border: "none",
                borderRadius: "8px",
                padding: "11px 28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 12px rgba(217, 119, 87, 0.28)",
                transition: "background-color 0.18s ease, transform 0.18s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#b85f42";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#d97757";
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(0)";
              }}
            >
              Save &amp; Continue to View Map
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

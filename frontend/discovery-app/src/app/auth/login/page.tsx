"use client";

import { useState } from "react";
import Link from "next/link";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-lora), serif",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b5847",
  marginBottom: "8px",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-crimson-pro), serif",
  fontSize: "17px",
  color: "#3d3028",
  backgroundColor: "#faf8f5",
  border: "1.5px solid #d4c4b0",
  borderRadius: "2px",
  padding: "14px 16px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

export default function DealerLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert("Welcome back, dealer. (Demo — no real auth.)");
    }, 700);
  }

  function focusOn(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#d97757";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 119, 87, 0.15)";
  }

  function focusOff(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#d4c4b0";
    e.currentTarget.style.boxShadow = "none";
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
      {/* Header */}
      <header
        style={{
          backgroundColor: "#d97757",
          color: "#faf8f5",
          borderBottom: "4px solid #b85f42",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
        className="px-6 py-5 md:px-12 md:py-8"
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Echo Estate
          </h1>
          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: "clamp(12px, 1.5vw, 15px)",
              opacity: 0.95,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Dealer Portal
          </p>
        </div>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-lora), serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#faf8f5",
            textDecoration: "none",
            opacity: 0.9,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.9")
          }
        >
          ← Back to listings
        </Link>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="px-5 py-8 md:px-12 md:py-16"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "#faf8f5",
            border: "1.5px solid #d4c4b0",
            boxShadow:
              "0 1px 0 rgba(61, 48, 40, 0.04), 0 8px 32px -12px rgba(61, 48, 40, 0.18)",
          }}
          className="p-8 md:p-12"
        >
          {/* Label row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            <svg
              width="22"
              height="22"
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
            <span
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#8a6f5c",
              }}
            >
              Property Dealers
            </span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(28px, 5vw, 34px)",
              fontWeight: 700,
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
              color: "#3d3028",
            }}
          >
            Sign in
          </h2>
          <p
            style={{
              margin: "0 0 32px 0",
              fontSize: "16px",
              color: "#6b5847",
              lineHeight: 1.5,
            }}
          >
            Manage your listings, leads, and viewings.
          </p>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                backgroundColor: "#f4e3dc",
                border: "1px solid #d97757",
                color: "#8a3a1f",
                fontSize: "14px",
                borderRadius: "2px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="dealer-username" style={labelStyle}>
                Username
              </label>
              <input
                id="dealer-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={focusOn}
                onBlur={focusOff}
                placeholder="dealer@echoestate.com"
                style={baseInputStyle}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <label
                  htmlFor="dealer-password"
                  style={{ ...labelStyle, marginBottom: 0 }}
                >
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password reset link sent (demo).");
                  }}
                  style={{
                    fontFamily: "var(--font-lora), serif",
                    fontSize: "13px",
                    color: "#d97757",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="dealer-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                  placeholder="••••••••"
                  style={{ ...baseInputStyle, paddingRight: "64px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: "absolute",
                    right: "4px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 12px",
                    fontFamily: "var(--font-lora), serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#8a6f5c",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "20px 0 28px 0",
                fontSize: "15px",
                color: "#6b5847",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#d97757",
                  cursor: "pointer",
                }}
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                fontFamily: "var(--font-lora), serif",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "#faf8f5",
                backgroundColor: submitting ? "#b85f42" : "#d97757",
                border: "none",
                borderRadius: "2px",
                padding: "14px 20px",
                cursor: submitting ? "wait" : "pointer",
                transition: "background-color 0.18s ease",
              }}
              onMouseEnter={(e) => {
                if (!submitting)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#b85f42";
              }}
              onMouseLeave={(e) => {
                if (!submitting)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#d97757";
              }}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div
            style={{
              margin: "32px 0 0 0",
              paddingTop: "24px",
              borderTop: "1px solid #ebe1d4",
              fontSize: "15px",
              color: "#6b5847",
              textAlign: "center",
            }}
          >
            New to Echo Estate?{" "}
            <Link
              href="/auth/register"
              style={{
                color: "#d97757",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Apply for a dealer account
            </Link>
          </div>
        </div>
      </main>

      <footer
        style={{
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#8a6f5c",
          borderTop: "1px solid #ebe1d4",
        }}
      >
        Protected portal · For licensed property dealers only
      </footer>
    </div>
  );
}

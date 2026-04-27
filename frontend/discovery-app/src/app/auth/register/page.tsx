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

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-lora), serif",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#a89684",
  margin: "12px 0 16px 0",
  paddingBottom: "8px",
  borderBottom: "1px solid #ebe1d4",
};

interface FormState {
  agencyName: string;
  license: string;
  region: string;
  contactName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

function Field({
  id,
  label,
  optional,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {optional && (
          <span
            style={{
              color: "#a89684",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              marginLeft: "6px",
            }}
          >
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export default function DealerRegisterPage() {
  const [form, setForm] = useState<FormState>({
    agencyName: "",
    license: "",
    region: "",
    contactName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [key]: v }));
    };
  }

  function focusOn(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#d97757";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(217, 119, 87, 0.15)";
  }

  function focusOff(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "#d4c4b0";
    e.currentTarget.style.boxShadow = "none";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const required: (keyof FormState)[] = [
      "agencyName",
      "license",
      "contactName",
      "email",
      "phone",
      "username",
      "password",
      "confirmPassword",
    ];
    for (const k of required) {
      if (!String(form[k]).trim()) {
        setError("Please complete all required fields.");
        return;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      setError("Please accept the dealer terms to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 800);
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
            Dealer Registration
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
          alignItems: "flex-start",
          justifyContent: "center",
        }}
        className="px-5 py-8 md:px-12 md:py-16"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "640px",
            backgroundColor: "#faf8f5",
            border: "1.5px solid #d4c4b0",
            boxShadow:
              "0 1px 0 rgba(61, 48, 40, 0.04), 0 8px 32px -12px rgba(61, 48, 40, 0.18)",
          }}
          className="p-8 md:p-14"
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

          {submitted ? (
            /* Confirmation state */
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "clamp(28px, 5vw, 34px)",
                  fontWeight: 700,
                  margin: "0 0 12px 0",
                  letterSpacing: "-0.02em",
                  color: "#3d3028",
                }}
              >
                Application received
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "#6b5847",
                  lineHeight: 1.6,
                  margin: "0 0 12px 0",
                }}
              >
                Thank you,{" "}
                <strong style={{ color: "#3d3028" }}>
                  {form.contactName || "dealer"}
                </strong>
                . We&apos;ve sent a confirmation to{" "}
                <strong style={{ color: "#3d3028" }}>{form.email}</strong>. Our
                team usually verifies licenses within two business days.
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "#8a6f5c",
                  lineHeight: 1.6,
                  margin: "0 0 28px 0",
                }}
              >
                Once approved, you can sign in with the username you chose and
                start listing properties.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href="/auth/login"
                  style={{
                    fontFamily: "var(--font-lora), serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#faf8f5",
                    backgroundColor: "#d97757",
                    border: "none",
                    borderRadius: "2px",
                    padding: "12px 22px",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Go to sign in
                </Link>
                <Link
                  href="/"
                  style={{
                    fontFamily: "var(--font-lora), serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#d97757",
                    backgroundColor: "transparent",
                    border: "1.5px solid #d97757",
                    borderRadius: "2px",
                    padding: "12px 22px",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Browse listings
                </Link>
              </div>
            </div>
          ) : (
            /* Registration form */
            <>
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
                Create a dealer account
              </h2>
              <p
                style={{
                  margin: "0 0 32px 0",
                  fontSize: "16px",
                  color: "#6b5847",
                  lineHeight: 1.5,
                }}
              >
                List properties, manage leads, and reach buyers looking for
                their natural home.
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
                {/* Agency */}
                <div style={{ ...sectionHeadingStyle, marginTop: 0 }}>
                  Agency
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-5">
                  <Field id="reg-agency" label="Agency name">
                    <input
                      id="reg-agency"
                      type="text"
                      value={form.agencyName}
                      onChange={update("agencyName")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="Maple Grove Realty"
                      style={baseInputStyle}
                    />
                  </Field>
                  <Field id="reg-license" label="License number">
                    <input
                      id="reg-license"
                      type="text"
                      value={form.license}
                      onChange={update("license")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="OR-RE-2025-00184"
                      style={baseInputStyle}
                    />
                  </Field>
                </div>

                <Field id="reg-region" label="Primary region" optional>
                  <input
                    id="reg-region"
                    type="text"
                    value={form.region}
                    onChange={update("region")}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="Pacific Northwest"
                    style={baseInputStyle}
                  />
                </Field>

                {/* Contact */}
                <div style={sectionHeadingStyle}>Contact</div>

                <Field id="reg-name" label="Your name">
                  <input
                    id="reg-name"
                    type="text"
                    value={form.contactName}
                    onChange={update("contactName")}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="Jordan Avery"
                    style={baseInputStyle}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-5">
                  <Field id="reg-email" label="Email">
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={update("email")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="jordan@agency.com"
                      style={baseInputStyle}
                    />
                  </Field>
                  <Field id="reg-phone" label="Phone">
                    <input
                      id="reg-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="(503) 555-0142"
                      style={baseInputStyle}
                    />
                  </Field>
                </div>

                {/* Account */}
                <div style={sectionHeadingStyle}>Account</div>

                <Field id="reg-username" label="Username">
                  <input
                    id="reg-username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={update("username")}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    placeholder="javery"
                    style={baseInputStyle}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-5">
                  <Field id="reg-password" label="Password">
                    <input
                      id="reg-password"
                      type="password"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={update("password")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="At least 8 characters"
                      style={baseInputStyle}
                    />
                  </Field>
                  <Field id="reg-confirm" label="Confirm password">
                    <input
                      id="reg-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={update("confirmPassword")}
                      onFocus={focusOn}
                      onBlur={focusOff}
                      placeholder="Re-enter password"
                      style={baseInputStyle}
                    />
                  </Field>
                </div>

                {/* Terms */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    margin: "12px 0 28px 0",
                    fontSize: "15px",
                    color: "#6b5847",
                    lineHeight: 1.5,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.agree}
                    onChange={update("agree")}
                    style={{
                      width: "16px",
                      height: "16px",
                      marginTop: "4px",
                      accentColor: "#d97757",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    I confirm I&apos;m a licensed property dealer and agree to
                    Echo Estate&apos;s{" "}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: "#d97757",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Dealer Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: "#d97757",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Listing Standards
                    </a>
                    .
                  </span>
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
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "#b85f42";
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting)
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "#d97757";
                  }}
                >
                  {submitting ? "Submitting application…" : "Create account"}
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
                Already have a dealer account?{" "}
                <Link
                  href="/auth/login"
                  style={{
                    color: "#d97757",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
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

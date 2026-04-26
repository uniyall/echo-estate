import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PROPERTIES } from "@/lib/properties";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: String(p.id) }));
}

export default function PropertyPage({ params }: Props) {
  const property = PROPERTIES.find((p) => p.id === parseInt(params.id));
  if (!property) notFound();

  const stats = [
    { label: "Bedrooms", value: property.bedrooms },
    { label: "Bathrooms", value: property.bathrooms },
    { label: "Square Feet", value: property.sqft.toLocaleString() },
    { label: "Year Built", value: property.yearBuilt },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5efe7",
        fontFamily: "var(--font-crimson-pro), serif",
        color: "#3d3028",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "#d97757",
          borderBottom: "4px solid #b85f42",
          color: "#faf8f5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="px-6 py-6 md:px-12 md:py-8"
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(24px, 3.5vw, 42px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "#faf8f5",
            }}
          >
            Echo Estate
          </h1>
        </div>
        <Link
          href="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#faf8f5",
            color: "#d97757",
            border: "none",
            borderRadius: "8px",
            fontSize: "clamp(13px, 1.5vw, 16px)",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-crimson-pro), serif",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          ← Back to Listings
        </Link>
      </header>

      <div
        style={{ maxWidth: "1200px", margin: "0 auto" }}
        className="px-6 py-8 md:px-12 md:py-12"
      >
        {/* Hero Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "clamp(240px, 40vw, 500px)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "40px",
            border: "3px solid #d4c4b0",
          }}
        >
          <Image
            src={property.thumbnail}
            alt={property.address}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Title & Price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "32px",
            padding: "32px",
            backgroundColor: "#faf8f5",
            borderRadius: "12px",
            border: "3px solid #d4c4b0",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <h2
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "clamp(22px, 3vw, 36px)",
                fontWeight: 700,
                margin: "0 0 10px 0",
                color: "#2a1f15",
              }}
            >
              {property.address}
            </h2>
            <p style={{ fontSize: "18px", margin: 0, color: "#6b5d4f" }}>
              {property.city}, {property.state}
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#d97757",
              color: "#faf8f5",
              padding: "20px 28px",
              borderRadius: "10px",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ${property.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
          style={{ marginBottom: "40px" }}
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#faf8f5",
                padding: "24px 16px",
                borderRadius: "12px",
                border: "2px solid #d4c4b0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-lora), serif",
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 600,
                  color: "#d97757",
                  marginBottom: "8px",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "15px", color: "#6b5d4f" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div
          style={{
            backgroundColor: "#faf8f5",
            padding: "32px",
            borderRadius: "12px",
            border: "3px solid #d4c4b0",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(20px, 2.5vw, 28px)",
              fontWeight: 600,
              marginTop: 0,
              marginBottom: "16px",
              color: "#2a1f15",
            }}
          >
            About This Home
          </h3>
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#3d3028",
              margin: 0,
            }}
          >
            {property.description}
          </p>
        </div>

        {/* Features + Details */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          style={{ marginBottom: "32px" }}
        >
          {/* Features */}
          <div
            style={{
              backgroundColor: "#faf8f5",
              padding: "32px",
              borderRadius: "12px",
              border: "3px solid #d4c4b0",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "24px",
                fontWeight: 600,
                marginTop: 0,
                marginBottom: "20px",
                color: "#2a1f15",
              }}
            >
              Features
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {property.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: "17px",
                    padding: "10px 0",
                    borderBottom:
                      idx < property.features.length - 1
                        ? "1px solid #e5d9c9"
                        : "none",
                    color: "#3d3028",
                  }}
                >
                  • {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Property Details */}
          <div
            style={{
              backgroundColor: "#faf8f5",
              padding: "32px",
              borderRadius: "12px",
              border: "3px solid #d4c4b0",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-lora), serif",
                fontSize: "24px",
                fontWeight: 600,
                marginTop: 0,
                marginBottom: "20px",
                color: "#2a1f15",
              }}
            >
              Property Details
            </h3>
            <div style={{ fontSize: "17px", color: "#3d3028" }}>
              {[
                { label: "Property Type", value: property.type },
                { label: "Lot Size", value: property.lotSize },
                { label: "Year Built", value: String(property.yearBuilt) },
              ].map((row, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: idx < 2 ? "1px solid #e5d9c9" : "none",
                  }}
                >
                  <span style={{ color: "#6b5d4f" }}>{row.label}</span>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Map CTA */}
        <button
          className="btn-terracotta"
          style={{
            width: "100%",
            padding: "20px",
            color: "#faf8f5",
            border: "none",
            borderRadius: "12px",
            fontSize: "20px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-lora), serif",
          }}
        >
          View 3D Map
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { PROPERTIES } from "@/lib/properties";

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 3;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  border: "2px solid #c4b09d",
  borderRadius: "8px",
  fontSize: "16px",
  fontFamily: "var(--font-crimson-pro), serif",
  backgroundColor: "#faf8f5",
  color: "#3d3028",
  outline: "none",
  boxSizing: "border-box",
};

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = PROPERTIES.filter((prop) => {
    if (
      searchTerm &&
      !prop.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !prop.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (minPrice && prop.price < parseInt(minPrice)) return false;
    if (maxPrice && prop.price > parseInt(maxPrice)) return false;
    if (bedrooms && prop.bedrooms < parseInt(bedrooms)) return false;
    return true;
  });

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [searchTerm, minPrice, maxPrice, bedrooms]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => v + LOAD_MORE_COUNT);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

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
          color: "#faf8f5",
          borderBottom: "4px solid #b85f42",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
        className="px-6 py-6 md:px-12 md:py-8"
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-lora), serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "#faf8f5",
            }}
          >
            Echo Estate
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "clamp(14px, 2vw, 18px)",
              opacity: 0.95,
              color: "#faf8f5",
            }}
          >
            Find your natural home
          </p>
        </div>
        <Link
          href="/auth/login"
          style={{
            fontFamily: "var(--font-lora), serif",
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#faf8f5",
            backgroundColor: "transparent",
            border: "1.5px solid rgba(250, 248, 245, 0.7)",
            borderRadius: "2px",
            padding: "12px 22px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "background-color 0.18s ease, border-color 0.18s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "rgba(250, 248, 245, 0.12)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "#faf8f5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "rgba(250, 248, 245, 0.7)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 21V11l9-7 9 7v10" />
            <path d="M9 21v-6h6v6" />
          </svg>
          <span>Dealer Login</span>
        </Link>
      </header>

      {/* Search & Filter */}
      <div
        style={{
          padding: "32px 48px",
          backgroundColor: "#ebe1d4",
          borderBottom: "2px solid #d4c4b0",
        }}
        className="px-6 py-6 md:px-12 md:py-8"
      >
        <div
          style={{ maxWidth: "1200px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-4"
        >
          <input
            type="text"
            placeholder="Search by location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={inputStyle}
          />
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            style={inputStyle}
          >
            <option value="">Any beds</option>
            <option value="1">1+ bed</option>
            <option value="2">2+ beds</option>
            <option value="3">3+ beds</option>
            <option value="4">4+ beds</option>
          </select>
        </div>
      </div>

      {/* Property Grid */}
      <div style={{ padding: "48px" }} className="px-6 py-8 md:px-12 md:py-12">
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              color: "#6b5d4f",
              fontSize: "18px",
              fontFamily: "var(--font-crimson-pro), serif",
            }}
          >
            No properties found matching your search.
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              style={{ maxWidth: "1400px", margin: "0 auto" }}
            >
              {visible.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  delay={idx}
                />
              ))}
            </div>

            {/* Sentinel triggers next load when scrolled into view */}
            <div ref={sentinelRef} style={{ height: "1px" }} />

            {isLoadingMore && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "32px",
                  color: "#6b5d4f",
                  fontFamily: "var(--font-crimson-pro), serif",
                  fontSize: "16px",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "2px solid #d4c4b0",
                    borderTopColor: "#d97757",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Finding more homes…
              </div>
            )}

            {!hasMore && filtered.length > 0 && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "40px",
                  color: "#6b5d4f",
                  fontFamily: "var(--font-crimson-pro), serif",
                  fontSize: "16px",
                }}
              >
                You&apos;ve seen all {filtered.length} homes
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

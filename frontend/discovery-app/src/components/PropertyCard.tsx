"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "@/lib/properties";

interface PropertyCardProps {
  property: Property;
  delay: number;
}

export default function PropertyCard({ property, delay }: PropertyCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay * 80);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      href={`/properties/${property.id}`}
      style={{
        display: "block",
        backgroundColor: "#faf8f5",
        borderRadius: "12px",
        overflow: "hidden",
        border: "3px solid #d4c4b0",
        textDecoration: "none",
        color: "inherit",
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        boxShadow: isHovered
          ? "0 8px 24px rgba(61, 48, 40, 0.15)"
          : "0 4px 12px rgba(61, 48, 40, 0.08)",
        borderColor: isHovered ? "#c4b09d" : "#d4c4b0",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative w-full" style={{ height: "240px" }}>
        <Image
          src={property.thumbnail}
          alt={property.address}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Price badge */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "#d97757",
            color: "#faf8f5",
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "18px",
            fontWeight: 600,
            fontFamily: "var(--font-lora), serif",
            lineHeight: 1,
          }}
        >
          ${(property.price / 1000).toFixed(0)}k
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px" }}>
        <h3
          style={{
            fontFamily: "var(--font-lora), serif",
            fontSize: "22px",
            fontWeight: 600,
            margin: "0 0 6px 0",
            color: "#2a1f15",
          }}
        >
          {property.address}
        </h3>
        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "16px",
            color: "#6b5d4f",
            fontFamily: "var(--font-crimson-pro), serif",
          }}
        >
          {property.city}, {property.state}
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "15px",
            color: "#3d3028",
            fontFamily: "var(--font-crimson-pro), serif",
          }}
        >
          <span>{property.bedrooms} bed</span>
          <span style={{ color: "#c4b09d" }}>•</span>
          <span>{property.bathrooms} bath</span>
          <span style={{ color: "#c4b09d" }}>•</span>
          <span>{property.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}

import type { Metadata } from "next";
import { Lora, Crimson_Pro } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-crimson-pro",
});

export const metadata: Metadata = {
  title: "Echo Estate — Property Discovery",
  description: "Find your natural home. Browse organic, curated real estate listings with 3D Gaussian Splat scene views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lora.variable} ${crimsonPro.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

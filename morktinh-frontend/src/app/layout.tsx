import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mork Tinh | Premium E-Commerce Store",
    template: "%s | Mork Tinh",
  },
  description: "Discover premium products, high-quality brands, and amazing discounts at Mork Tinh.",
  keywords: ["e-commerce", "shopping", "mork tinh", "online store"],
  metadataBase: new URL("https://morktinh.store"),
  openGraph: {
    title: "Mork Tinh | Premium E-Commerce Store",
    description: "Discover premium products and top brands at Mork Tinh.",
    url: "https://morktinh.store",
    siteName: "Mork Tinh",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mork Tinh",
    description: "Discover premium products and top brands at Mork Tinh.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

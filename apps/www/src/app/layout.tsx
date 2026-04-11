import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GeistPixelSquare } from "geist/font/pixel";
import { ThemeProvider } from "@/components/mode-toggle/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Magicwand CLI | Scaffold Layered DDD Backends",
  description:
    "Generate pragmatic layered DDD backends with Bun, Hono, toolchain presets, and a clean starting architecture.",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: "/favicon-black.svg",
      href: "/favicon-black.svg",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: "/favicon-white.svg",
      href: "/favicon-white.svg",
    },
  ],
  openGraph: {
    title: "Magicwand CLI | Scaffold Layered DDD Backends",
    description:
      "Generate pragmatic layered DDD backends with Bun, Hono, toolchain presets, and a clean starting architecture.",
    siteName: "Magicwand CLI",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Magicwand CLI - Scaffold Layered DDD Backends",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magicwand CLI | Scaffold Layered DDD Backends",
    description:
      "Generate pragmatic layered DDD backends with Bun, Hono, toolchain presets, and a clean starting architecture.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

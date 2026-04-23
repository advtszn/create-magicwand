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
    process.env.NEXT_PUBLIC_APP_URL ?? "https://magicwand.advtszn.xyz",
  ),
  title: "Magicwand CLI | Scaffold Layered Backends",
  description:
    "Generate layered backends with Bun or Node, Hono, toolchain presets, and a clean starting architecture.",
  icons: {
    icon: "/favicon-black.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Magicwand CLI | Scaffold Layered Backends",
    description:
      "Generate layered backends with Bun or Node, Hono, toolchain presets, and a clean starting architecture.",
    siteName: "Magicwand CLI",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Magicwand CLI - Scaffold Layered Backends",
      },
    ],
    locale: "en_US",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magicwand CLI | Scaffold Layered Backends",
    description:
      "Generate layered backends with Bun or Node, Hono, toolchain presets, and a clean starting architecture.",
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

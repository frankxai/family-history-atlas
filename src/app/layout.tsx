import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://family-history-atlas.vercel.app"),
  title: {
    default: "Family History Atlas",
    template: "%s · Family History Atlas",
  },
  description:
    "An evidence-aware, privacy-first family tree that turns people, places, sources, and open questions into a cinematic living history.",
  openGraph: {
    title: "Family History Atlas",
    description: "Every branch has a story. Every story keeps its source.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family History Atlas",
    description: "Every branch has a story. Every story keeps its source.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10130f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unser Kochbuch",
  description: "Die Rezepte von Benny und Lisa – mit Fotos und Bewertungen.",
  appleWebApp: { capable: true, title: "Kochbuch", statusBarStyle: "default" },
  // Tab-Icon: Comic aus dem Hintergrundbild, liegt in Vercel Blob (nicht im öffentlichen Repo)
  icons: process.env.FAVICON_URL ? { icon: { url: process.env.FAVICON_URL, type: "image/png" } } : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Verhindert, dass iOS beim Tippen in Felder hineinzoomt und den Zoom behält.
  // Mit zwei Fingern zoomen geht auf dem iPhone trotzdem weiter.
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}

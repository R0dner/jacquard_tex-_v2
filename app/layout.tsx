import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["italic", "normal"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Jacquard Tex",
  description: "Panel de administración",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  );
}
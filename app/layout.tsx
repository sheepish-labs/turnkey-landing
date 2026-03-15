import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TurnKey — Your move, handled.",
  description:
    "TurnKey gives real estate agents the tools to guide buyers and sellers through every step of the journey — with clarity, confidence, and care.",
  openGraph: {
    title: "TurnKey — Your move, handled.",
    description:
      "TurnKey gives real estate agents the tools to guide buyers and sellers through every step of the journey — with clarity, confidence, and care.",
    url: "https://turnkeyhomes.app",
    siteName: "TurnKey",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSerif.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

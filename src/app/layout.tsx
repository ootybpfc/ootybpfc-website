import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ooty Black Pearl FC | Official Club Website",
  description: "Official website of Ooty Black Pearl Football Club (OOTYBPFC) - Canadian Professional Football. Training programs, match fixtures, news, and more.",
  keywords: "OOTYBPFC, Ooty Black Pearl FC, football, soccer, Canadian Professional, training programs, youth football",
  openGraph: {
    title: "Ooty Black Pearl FC",
    description: "Official website of Ooty Black Pearl Football Club",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

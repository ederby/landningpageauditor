import type { Metadata } from "next";
import "./globals.css";
import logo from "@/public/relativt-logo.svg";

export const metadata: Metadata = {
  title: "Landningssidegranskning — Relativt",
  description:
    "Få en gratis rapport om varför din webbplats inte genererar leads. Analysera din sajt på 10 sekunder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="preconnect" href="https://p.typekit.net" />
        <link rel="stylesheet" href="https://use.typekit.net/vzb0tbu.css" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-white">
        <header className="h-20 flex items-center justify-center">
          <a href="https://relativt.se/" target="_blank">
            <img
              className="w-full max-w-35"
              src={logo.src}
              alt="Relativt logotyp"
            />
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}

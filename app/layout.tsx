import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Landningssidegranskning — Relativt',
  description: 'Få en gratis rapport om varför din webbplats inte genererar leads. Analysera din sajt på 10 sekunder.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-800 bg-white">{children}</body>
    </html>
  )
}

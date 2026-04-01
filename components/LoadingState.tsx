"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Hämtar din sida...",
  "Kontrollerar prestanda...",
  "Analyserar konverteringspunkter...",
  "Granskar SEO...",
  "Sammanställer rapport...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-orange" />
        <div className="absolute inset-0 rounded-full border-4 border-beige border-t-transparent animate-spin" />
      </div>
      <p className="text-beige text-base font-medium transition-all duration-500">
        {MESSAGES[index]}
      </p>
    </div>
  );
}

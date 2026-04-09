"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Hämtar din sida...",
  "Kontrollerar prestanda...",
  "Analyserar konverteringspunkter...",
  "Granskar SEO...",
  "Sammanställer rapport...",
];

const COMPETITOR_MESSAGES = [
  "Hämtar din sida...",
  "Hämtar konkurrentens sida...",
  "Kontrollerar prestanda...",
  "Analyserar konverteringspunkter...",
  "Granskar SEO...",
  "Jämför resultaten...",
  "Sammanställer rapport...",
];

interface Props {
  hasCompetitor?: boolean;
}

export default function LoadingState({ hasCompetitor = false }: Props) {
  const messages = hasCompetitor ? COMPETITOR_MESSAGES : MESSAGES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-orange" />
        <div className="absolute inset-0 rounded-full border-4 border-beige border-t-transparent animate-spin" />
      </div>
      <p className="text-orange text-base font-medium transition-all duration-500">
        {messages[index]}
      </p>
    </div>
  );
}

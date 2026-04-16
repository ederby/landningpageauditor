"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "💡 Första meningen på din sida är den viktigaste. Besökaren ska direkt förstå vad du erbjuder.",
  "⚡ En långsam sida gör att folk lämnar innan de ens sett ditt erbjudande.",
  "📱 De flesta besöker din sida på mobilen — se till att det ser bra ut på en liten skärm.",
  "✍️ 'Kontakta oss' säger ingenting. 'Få ett gratis prisförslag' får fler att klicka.",
  "🔒 Har din sida ett litet hänglås i adressfältet? Det bygger förtroende hos besökaren.",
  "🌟 Omdömen och recensioner från riktiga kunder är ofta det som tippar en tveksam besökare.",
  "🎯 Ha ett tydligt syfte med sidan — vad vill du att besökaren ska göra? Håll fokus på det.",
  "🔍 Google bestämmer om din sida är relevant utifrån det du skriver. Var konkret och tydlig.",
  "🖼️ Bilder som visar ditt riktiga arbete eller team skapar mer förtroende än stockfoton.",
  "📞 Gör det enkelt att ta kontakt — en knapp eller ett telefonnummer räcker långt.",
  "🎨 Din viktigaste knapp ska synas direkt. Om den smälter in missar du kunder.",
  "💬 Skriv som du pratar. Krånglig text skrämmer bort folk — enkelt språk vinner.",
];

const MESSAGES = TIPS;
const COMPETITOR_MESSAGES = TIPS;

interface Props {
  hasCompetitor?: boolean;
}

export default function LoadingState({ hasCompetitor = false }: Props) {
  const messages = hasCompetitor ? COMPETITOR_MESSAGES : MESSAGES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-orange" />
        <div className="absolute inset-0 rounded-full border-4 border-beige border-t-transparent animate-spin" />
      </div>
      <span className="text-orange text-base text-[14px] font-medium transition-all duration-500">
        {messages[index]}
      </span>
    </div>
  );
}

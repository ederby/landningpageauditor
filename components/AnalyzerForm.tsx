"use client";

import { useState, type FormEvent } from "react";
import { type ReportData } from "@/lib/types";
import LoadingState from "./LoadingState";

interface Props {
  onReport: (report: ReportData) => void;
}

export default function AnalyzerForm({ onReport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let normalized = url.trim();
    if (!normalized) {
      setError("Ange en URL.");
      return;
    }
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    try {
      new URL(normalized);
    } catch {
      setError("URL:en verkar inte vara giltig. Kontrollera och försök igen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel. Försök igen.");
        return;
      }
      onReport(data as ReportData);
    } catch {
      setError("Kunde inte nå servern. Kontrollera din internetanslutning.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="dittforetag.se"
          className="flex-1 px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
          autoFocus
        />
        <button
          type="submit"
          className="sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red hover:text-beige border-orange font-semibold rounded-[5px] transition-colors whitespace-nowrap text-base"
        >
          Analysera min sajt
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}

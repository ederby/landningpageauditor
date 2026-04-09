"use client";

import { useState, type FormEvent } from "react";
import { type ReportData } from "@/lib/types";
import LoadingState from "./LoadingState";

interface Props {
  onReport: (report: ReportData) => void;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : "https://" + trimmed;
  try {
    new URL(withProtocol);
    return withProtocol;
  } catch {
    return null;
  }
}

export default function AnalyzerForm({ onReport }: Props) {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showCompetitor, setShowCompetitor] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCompetitor() {
    setShowCompetitor((v) => !v);
    if (showCompetitor) setCompetitorUrl("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("URL:en verkar inte vara giltig. Kontrollera och försök igen.");
      return;
    }

    const normalizedCompetitor =
      showCompetitor && competitorUrl.trim()
        ? normalizeUrl(competitorUrl)
        : null;

    if (showCompetitor && competitorUrl.trim() && !normalizedCompetitor) {
      setError(
        "Konkurrentens URL verkar inte vara giltig. Kontrollera och försök igen."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalized,
          ...(keyword.trim() && { keyword: keyword.trim() }),
          ...(normalizedCompetitor && { competitorUrl: normalizedCompetitor }),
        }),
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

  if (loading)
    return (
      <LoadingState
        hasCompetitor={showCompetitor && Boolean(competitorUrl.trim())}
      />
    );

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto flex flex-col items-center">
      {showCompetitor ? (
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="dittforetag.se"
            className="flex-1 px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
            autoFocus
          />
          <input
            type="text"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder="konkurrenten.se"
            className="flex-1 px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
          />
          <button
            type="submit"
            className="sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red hover:text-beige font-semibold rounded-[5px] transition-colors whitespace-nowrap text-base"
          >
            Analysera båda
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col sm:flex-row gap-3">
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
            className="sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red hover:text-beige font-semibold rounded-[5px] transition-colors whitespace-nowrap text-base"
          >
            Analysera min sajt
          </button>
        </div>
      )}

      <div className="w-full mt-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Sökord ni vill ranka på, t.ex. webbyrå stockholm (valfritt)"
          className="w-full px-5 py-3 rounded-[5px] border border-beige/50 text-beige placeholder-pink/60 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
        />
      </div>

      <button
        type="button"
        onClick={toggleCompetitor}
        className="mt-3 text-sm text-beige/60 hover:text-beige underline underline-offset-2 transition-colors"
      >
        {showCompetitor
          ? "Ta bort konkurrentjämförelse"
          : "+ Jämför med en konkurrent (valfritt)"}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <p className="mt-3 text-beige/50 text-sm">
        Analysen gäller sidan du skriver in, inte hela webbplatsen.
      </p>
    </form>
  );
}

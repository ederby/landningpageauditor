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
  const [showKeyword, setShowKeyword] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showCompetitor, setShowCompetitor] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleKeyword() {
    setShowKeyword((v) => !v);
    if (showKeyword) setKeyword("");
  }

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
        "Konkurrentens URL verkar inte vara giltig. Kontrollera och försök igen.",
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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-200 mx-auto flex flex-col items-center gap-2.5"
    >
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-4.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="dittforetag.se"
            className="flex-1 px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
            autoFocus
          />
          {showCompetitor && (
            <input
              type="text"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="konkurrenten.se"
              className="flex-1 px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
            />
          )}
        </div>
        {showKeyword && (
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="t.ex. webbyrå göteborg"
            className="w-full px-5 py-3 rounded-[5px] border border-beige text-beige placeholder-pink focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
          />
        )}
        <button
          type="submit"
          className="w-full sm:w-fit sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red hover:text-beige font-semibold rounded-[5px] transition-colors whitespace-nowrap text-base self-center"
        >
          {showCompetitor ? "Analysera båda" : "Analysera min sajt"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1">
        <button
          type="button"
          onClick={toggleKeyword}
          className="text-sm text-beige/60 hover:text-beige underline underline-offset-2 transition-colors"
        >
          {showKeyword ? "Ta bort sökord" : "+ Lägg till sökord"}
        </button>
        <button
          type="button"
          onClick={toggleCompetitor}
          className="text-sm text-beige/60 hover:text-beige underline underline-offset-2 transition-colors"
        >
          {showCompetitor
            ? "Ta bort konkurrentjämförelse"
            : "+ Jämför med en konkurrent"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <span className="mt-3 text-beige/50 text-sm">
        OBS! Analysen gäller sidan du skriver in, inte övriga sidor på
        webbplatsen.
      </span>
    </form>
  );
}

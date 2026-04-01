"use client";

import { useState, type FormEvent } from "react";
import { type ReportData } from "@/lib/types";

interface Props {
  report: ReportData;
}

export default function LeadCTA({ report }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError(null);
    if (!email || !email.includes("@")) {
      setEmailError("Ange en giltig e-postadress.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, report }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        id="cta-footer"
        className="bg-red text-beige section-padding flex justify-center"
      >
        <div className="w-full max-w-240 px-5 flex flex-col sm:items-start">
          <h2 className="text-h2 font-bold mb-3">
            Vill ni ha hjälp att åtgärda detta?
          </h2>
          <p className="text-base mb-[clamp(20px,-2.5px+4.688vw,50px)] leading-relaxed text-body">
            {report.leadText}
          </p>
          <a
            href="https://relativt.se/kontakt"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red text-[clamp(16px,13px+0.625vw,20px)] text-center hover:text-beige border-3 border-orange font-semibold rounded-[5px] transition-colors whitespace-nowrap"
          >
            Boka en kostnadsfri genomgång
          </a>
        </div>
      </div>

      <div className="bg-beige text-beige section-padding flex justify-center">
        <div className="w-full max-w-240 px-5 flex flex-col sm:items-start">
          <h3 className="text-red text-h3 mb-3">Få rapporten som PDF</h3>
          <p className="text-red">
            Ange din e-post så kommer din rapport som ett mail.
          </p>
          {submitted ? (
            <p className="text-orange">Tack! Din rapport är på väg!.</p>
          ) : (
            <form
              onSubmit={handleEmailSubmit}
              className="w-full flex flex-col sm:flex-row gap-3 mt-[clamp(20px,12.5px+1.563vw,30px)]"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="flex-1 px-5 py-3 rounded-[5px] border border-red text-red placeholder-[#59091566] focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent text-base"
              />
              <button
                type="submit"
                disabled={submitting}
                className="sm:px-5 md:px-17.5 py-4 bg-orange cursor-pointer text-red text-[clamp(16px,13px+0.625vw,20px)] hover:text-beige border-orange font-semibold rounded-[5px] transition-colors whitespace-nowrap"
              >
                {submitting ? "Skickar..." : "Skicka rapport"}
              </button>
            </form>
          )}
          {emailError && (
            <p className="mt-2 text-red-400 text-xs">{emailError}</p>
          )}
        </div>
      </div>
    </>
  );
}

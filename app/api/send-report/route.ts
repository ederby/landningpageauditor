import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { Resend } from "resend";
import { ReportPdf } from "@/lib/pdf/ReportPdf";
import { type ReportData } from "@/lib/types";
import React from "react";

export async function POST(req: NextRequest) {
  let body: { email?: string; report?: ReportData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig request." }, { status: 400 });
  }

  const { email, report } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Ogiltig e-postadress." },
      { status: 400 }
    );
  }
  if (!report) {
    return NextResponse.json(
      { error: "Rapportdata saknas." },
      { status: 400 }
    );
  }

  // ── 1. Generera PDF ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(ReportPdf, { report }) as any
  );

  // ── 2. Skicka e-post med PDF-bilaga via Resend ───────────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);
  const hostname = new URL(report.url).hostname.replace(/^www\./, "");

  await resend.emails.send({
    from: "Relativt <noreply@relativt.se>",
    to: email,
    subject: `Din webbplatsrapport för ${hostname}`,
    html: `<p>Hej!</p><p>Här är din rapport för <strong>${report.url}</strong>.</p><p>Vill ni ha hjälp att åtgärda bristerna? <a href="https://relativt.se/kontakt">Boka en kostnadsfri genomgång</a></p><p>Med vänliga hälsningar,<br/>Relativt</p>`,
    attachments: [
      {
        filename: `rapport-${hostname}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  // ── 3. Pinga Zapier (Mailchimp-koppling) ─────────────────────────────────
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (zapierUrl) {
    await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, url: report.url }),
    });
  }

  return NextResponse.json({ success: true });
}

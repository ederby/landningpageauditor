import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import nodemailer from "nodemailer";
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

  // ── 2. Skicka e-post med PDF-bilaga ──────────────────────────────────────
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const hostname = new URL(report.url).hostname.replace(/^www\./, "");

  await transporter.sendMail({
    from: `"Relativt" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Din webbplatsrapport för ${hostname}`,
    text: `Hej!\n\nHär är din rapport för ${report.url}.\n\nVill ni ha hjälp att åtgärda bristerna? Boka en kostnadsfri genomgång på relativt.se/kontakt\n\nMed vänliga hälsningar,\nRelativt`,
    html: `<p>Hej!</p><p>Här är din rapport för <strong>${report.url}</strong>.</p><p>Vill ni ha hjälp att åtgärda bristerna? <a href="https://relativt.se/kontakt">Boka en kostnadsfri genomgång</a></p><p>Med vänliga hälsningar,<br/>Relativt</p>`,
    attachments: [
      {
        filename: `rapport-${hostname}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  // ── 3. Skicka e-post till Zapier (Mailchimp-koppling) ────────────────────
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

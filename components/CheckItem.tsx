"use client";

import { useState } from "react";
import { type Check } from "@/lib/types";

interface Props {
  checkKey: string;
  check: Check;
}

const PILL_CONFIG = {
  red: { label: "Åtgärda", classes: "bg-red-100 text-red-700" },
  yellow: { label: "Förbättra", classes: "bg-amber-100 text-amber-700" },
  green: { label: "OK", classes: "bg-emerald-100 text-emerald-700" },
};

export default function CheckItem({ check }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pill = PILL_CONFIG[check.status];
  const isLong = check.description.length > 100;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
      <span
        className={`shrink-0 mt-0.5 inline-flex items-center px-2.5 pt-0.5 pb-1 rounded-[5px] text-xs font-semibold ${pill.classes}`}
      >
        {pill.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red text-sm">{check.label}</p>
        <p
          className={`text-black text-sm mt-0.5 ${isLong && !expanded ? "sm:block hidden" : "block"}`}
        >
          {check.description}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="sm:hidden text-xs text-slate-400 hover:text-slate-600 mt-1 underline"
          >
            {expanded ? "Visa mindre" : "Visa mer"}
          </button>
        )}
        {isLong && !expanded && (
          <p className="sm:hidden text-slate-500 text-sm mt-0.5 line-clamp-2">
            {check.description}
          </p>
        )}
      </div>
    </div>
  );
}

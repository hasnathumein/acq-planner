import React from "react";

export function Pill({ value }) {
  const tone = value === "On track" || value === "Done"
    ? "bg-emerald-50 text-emerald-700"
    : value === "At risk"
    ? "bg-amber-50 text-amber-700"
    : value === "Behind"
    ? "bg-rose-50 text-rose-700"
    : "bg-slate-100 text-slate-600";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
}

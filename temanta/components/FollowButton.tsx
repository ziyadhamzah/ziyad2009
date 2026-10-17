"use client";
import { useState } from "react";

export default function FollowButton() {
  const [on, setOn] = useState(false);
  return (
    <button type="button" onClick={() => setOn(!on)} aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold transition ${on ? "border border-line bg-surface text-ink hover:border-brand hover:text-brand-ontint" : "bg-brand text-white hover:bg-brand-dark"}`}>
      {on ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
      )}
      {on ? "Diikuti" : "Ikuti"}
    </button>
  );
}
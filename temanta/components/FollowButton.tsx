"use client";
import { useState } from "react";

export default function FollowButton() {
  const [on, setOn] = useState(false);
  return (
    <button type="button" onClick={() => setOn(!on)} aria-pressed={on}
      className={`ml-2 rounded-sm px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${on ? "bg-surface/20 text-white ring-1 ring-white/70" : "bg-surface text-brand-ontint hover:bg-surface/90"}`}>
      {on ? "Diikuti" : "Ikuti"}
    </button>
  );
}
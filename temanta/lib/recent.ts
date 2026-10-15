const KEY = "temanta:recent";
const MAX = 24;

export function recentViews(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function markViewed(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    const next = [slug, ...recentViews().filter((s) => s !== slug)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("temanta:recent"));
  } catch {
    // abaikan bila localStorage tidak tersedia (private mode)
  }
}
export default function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  const full = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${size} ${i <= full ? "text-[#FFCE3D]" : "text-line"}`} fill="currentColor" aria-hidden>
          <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
        </svg>
      ))}
    </span>
  );
}
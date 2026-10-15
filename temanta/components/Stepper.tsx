const steps = ["Keranjang", "Alamat", "Pengiriman", "Pembayaran", "Konfirmasi"];
export default function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto text-sm sm:gap-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex shrink-0 items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                active ? "bg-brand text-white shadow-sm" : done ? "bg-brand/15 text-brand" : "border border-line text-muted"
              }`}
            >
              {done ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
              ) : (
                i + 1
              )}
            </span>
            <span className={`whitespace-nowrap ${active ? "font-semibold text-brand" : done ? "text-ink" : "text-muted"}`}>{s}</span>
            {i < steps.length - 1 && <span className={`h-px w-6 sm:w-10 ${done ? "bg-brand/40" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
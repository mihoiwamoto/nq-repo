const SPOKES = Array.from({ length: 12 }, (_, i) => i);

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <svg viewBox="0 0 40 40" className="size-[120px] animate-spin" style={{ animationDuration: "1s" }}>
        {SPOKES.map((i) => (
          <rect
            key={i}
            x="18.5"
            y="2"
            width="3"
            height="11"
            rx="1.5"
            fill="white"
            opacity={0.15 + (i / SPOKES.length) * 0.85}
            transform={`rotate(${i * 30} 20 20)`}
          />
        ))}
      </svg>
    </div>
  );
}

type MonogramVeilProps = {
  letters?: string;
};

export default function MonogramVeil({ letters = "R&P" }: MonogramVeilProps) {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden"
    >
      <span
        className="font-display italic select-none"
        style={{
          fontSize: "min(60vw, 800px)",
          lineHeight: 1,
          color: "hsl(var(--primary))",
          opacity: 0.025,
          letterSpacing: "-0.06em",
        }}
      >
        {letters}
      </span>
    </div>
  );
}

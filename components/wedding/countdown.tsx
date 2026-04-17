"use client";

import { useEffect, useState } from "react";

const TARGET = new Date("2025-11-15T16:00:00-03:00").getTime();

type TimeLeft = { d: number; h: number; m: number; s: number };

function calc(): TimeLeft {
  const diff = Math.max(0, TARGET - Date.now());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

const pad = (n: number): string => String(n).padStart(2, "0");

export default function Countdown() {
  const [t, setT] = useState<TimeLeft>(() => calc());

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const items: { v: number; l: string }[] = [
    { v: t.d, l: "Dias" },
    { v: t.h, l: "Horas" },
    { v: t.m, l: "Min" },
    { v: t.s, l: "Seg" },
  ];

  return (
    <div className="flex items-center gap-6 md:gap-10 font-mono">
      {items.map((item) => (
        <div key={item.l} className="flex flex-col items-center">
          <span className="text-3xl md:text-5xl font-light text-[hsl(var(--foreground))] tabular-nums">
            {pad(item.v)}
          </span>
          <span className="meta-label mt-2">{item.l}</span>
        </div>
      ))}
    </div>
  );
}

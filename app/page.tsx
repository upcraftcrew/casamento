"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function ThresholdPage() {
  const router = useRouter();
  const [reveal, setReveal] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const MAX = 240;

  const sealOpacity = useTransform(x, [0, MAX], [1, 0]);
  const sealScale = useTransform(x, [0, MAX], [1, 0.6]);
  const progress = useTransform(x, [0, MAX], [0, 1]);
  const progressPct = useTransform(progress, (v) => `${Math.round(v * 100)}%`);

  const handleDragEnd = () => {
    if (x.get() >= MAX * 0.85) {
      animate(x, MAX, { type: "spring", stiffness: 120, damping: 20 });
      setReveal(true);
      setTimeout(() => router.push("/home"), 1400);
    } else {
      animate(x, 0, { type: "spring", stiffness: 140, damping: 18 });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden grain-overlay">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <video
          src="/casados-igreja.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/75" />
      </div>

      <motion.div
        animate={
          reveal
            ? { scale: 3, opacity: 0, filter: "blur(20px)" }
            : { scale: 1, opacity: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-between px-[5vw] md:px-[8vw] py-10"
      >
        <div className="w-full flex items-center justify-between">
          <span className="meta-label">Convite · N° 001</span>
          <span className="meta-label hidden md:inline">
            05.09.2026 · São Paulo
          </span>
        </div>

        <div className="flex flex-col items-center text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="meta-label mb-10"
          >
            Você está convidado para
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display italic text-[hsl(var(--foreground))] leading-[0.92]"
            style={{
              fontSize: "clamp(3.5rem, 12vw, 9rem)",
              letterSpacing: "-0.04em",
            }}
          >
            O Casamento
            <br />
            <span className="not-italic text-[hsl(var(--primary))]">de</span>{" "}
            Paloma
            <span className="not-italic text-[hsl(var(--primary))] mx-4">
              &amp;
            </span>
            Rodrigo
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-10 flex items-center gap-5"
          >
            <span className="h-px w-12 bg-[hsl(var(--accent))]" />
            <span className="font-mono text-sm tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              05 · SET · 2026
            </span>
            <span className="h-px w-12 bg-[hsl(var(--accent))]" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-4">
            <span className="meta-label">Arraste para abrir o convite</span>
          </div>

          <div
            ref={constraintsRef}
            className="relative h-16 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]/50 backdrop-blur-sm overflow-hidden"
          >
            <motion.div
              style={{ width: progressPct }}
              className="absolute inset-y-0 left-0 bg-[hsl(var(--primary))]/15"
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="meta-label text-[hsl(var(--muted-foreground))]">
                Deslize →
              </span>
            </div>

            <motion.button
              drag="x"
              dragConstraints={{ left: 0, right: MAX }}
              dragElastic={0.05}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              style={{ x, opacity: sealOpacity, scale: sealScale }}
              whileTap={{ cursor: "grabbing" }}
              className="absolute top-1 left-1 h-14 w-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_30px_rgba(31,61,125,0.35)]"
              aria-label="Arraste para revelar o convite"
            >
              <span className="font-display italic text-[hsl(var(--primary-foreground))] text-xl">
                R&amp;P
              </span>
            </motion.button>
          </div>
        </motion.div>

        <div className="w-full flex items-center justify-between">
          <span className="meta-label">Lacre — Aguardando abertura</span>
          <span className="meta-label">Eternal Archive</span>
        </div>
      </motion.div>

      {reveal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, times: [0, 0.4, 1] }}
          className="fixed inset-0 z-50 bg-[hsl(var(--primary))] pointer-events-none"
        />
      )}
    </div>
  );
}

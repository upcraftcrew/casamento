"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Route = { path: string; label: string; num: string };

const routes: Route[] = [
  { path: "/home", label: "Home", num: "01" },
  { path: "/historia", label: "Nossa História", num: "02" },
  { path: "/padrinhos", label: "Padrinhos", num: "03" },
  { path: "/cha", label: "Chá de Lingerie & Bar", num: "04" },
  { path: "/cerimonia", label: "Cerimônia e Recepção", num: "05" },
  { path: "/mensagens", label: "Mensagens", num: "06" },
  { path: "/dicas", label: "Dicas", num: "07" },
  { path: "/presentes", label: "Lista de Presentes", num: "08" },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = routes.find((r) => r.path === pathname);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-[5vw] md:px-[8vw] py-6 flex items-center justify-between pointer-events-none">
        <Link href="/home" className="pointer-events-auto font-display italic text-2xl text-[hsl(var(--primary))]">
          R&amp;P
        </Link>

        <div className="pointer-events-auto flex items-center gap-6">
          <span className="meta-label hidden md:inline">
            {current?.num ?? "00"} / {current?.label ?? "Index"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="group gap-3 text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] hover:bg-transparent px-2"
          >
            <span className="meta-label group-hover:text-[hsl(var(--primary))] transition-colors">
              Menu
            </span>
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="fixed top-[72px] left-[5vw] right-[5vw] md:left-[8vw] md:right-[8vw] h-px bg-[hsl(var(--border))] z-30 opacity-40 pointer-events-none" />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[hsl(var(--background))] grain-overlay"
          >
            <div className="relative h-full w-full flex flex-col px-[5vw] md:px-[8vw] py-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/home"
                  className="font-display italic text-2xl text-[hsl(var(--primary))]"
                >
                  R&amp;P
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar menu"
                  className="gap-3 hover:bg-transparent hover:text-[hsl(var(--primary))] px-2"
                >
                  <span className="meta-label">Fechar</span>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="flex-1 flex flex-col justify-center max-w-5xl">
                <ul className="space-y-2 md:space-y-4">
                  {routes.map((r, i) => {
                    const isActive = pathname === r.path;
                    return (
                      <motion.li
                        key={r.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.1 + i * 0.06,
                          type: "spring",
                          stiffness: 80,
                          damping: 18,
                        }}
                      >
                        <Link
                          href={r.path}
                          className="group flex items-baseline gap-6 md:gap-10 py-3 border-b border-[hsl(var(--border))]"
                        >
                          <span className="meta-label pt-2">{r.num}</span>
                          <span
                            className={`font-display text-4xl md:text-6xl lg:text-7xl transition-all duration-500 ${
                              isActive
                                ? "text-[hsl(var(--primary))] italic"
                                : "text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] group-hover:italic"
                            }`}
                          >
                            {r.label}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <footer className="flex items-end justify-between pb-4">
                <span className="meta-label">
                  Paloma &amp; Rodrigo · 15 · Nov · 2025
                </span>
                <span className="meta-label">São Paulo · Brasil</span>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", num: "01" },
  { href: "/admin/presentes", label: "Presentes", num: "02" },
  { href: "/admin/mensagens", label: "Mensagens", num: "03" },
  { href: "/admin/pagamentos", label: "Pagamentos", num: "04" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-[72px] left-0 right-0 z-30 px-[5vw] md:px-[8vw] py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-sm">
      <ul className="flex items-center gap-6 md:gap-10 overflow-x-auto scrollbar-hide">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className={`group flex items-baseline gap-2 transition-colors ${
                  isActive
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
                }`}
              >
                <span className="meta-label">{link.num}</span>
                <span
                  className={`font-display text-lg md:text-xl ${
                    isActive ? "italic" : "group-hover:italic"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

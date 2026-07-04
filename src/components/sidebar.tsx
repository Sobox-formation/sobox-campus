"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

type IconProps = { className?: string };
const Ic = {
  home: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  path: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" />
    </svg>
  ),
  book: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </svg>
  ),
  check: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  ),
  spark: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
  bot: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...p}>
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 4v4M9 13h.01M15 13h.01M2 12v3M22 12v3" />
    </svg>
  ),
};

const NAV: {
  group: string;
  items: { href: string; label: string; icon: (p: IconProps) => React.ReactNode }[];
}[] = [
  {
    group: "Apprentissage",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: Ic.home },
      { href: "/parcours", label: "Mon parcours", icon: Ic.path },
      { href: "/bibliotheque", label: "Ma Box & ressources", icon: Ic.book },
    ],
  },
  {
    group: "Progression",
    items: [
      { href: "/evaluations", label: "Mes évaluations", icon: Ic.check },
      { href: "/soft-skills", label: "Tests & soft skills", icon: Ic.spark },
    ],
  },
  {
    group: "Accompagnement",
    items: [{ href: "/assistant", label: "Willy & formateurs", icon: Ic.bot }],
  },
];

function CoBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex w-fit items-center gap-3 rounded-xl bg-white px-3 py-2 shadow">
      <Image
        src="/brand/sobox-logo.png"
        alt="SOBOX"
        width={166}
        height={329}
        className={compact ? "h-7 w-auto" : "h-9 w-auto"}
        priority
      />
      <span className="h-6 w-px bg-slate-200" />
      <Image
        src="/brand/gcm-logo.png"
        alt="Groupama Centre Manche"
        width={996}
        height={244}
        className={compact ? "h-4 w-auto" : "h-5 w-auto"}
        priority
      />
    </div>
  );
}

export default function Sidebar({
  prenom,
  nom,
  email,
  parcoursNom,
}: {
  prenom: string;
  nom: string;
  email: string;
  parcoursNom: string;
}) {
  const pathname = usePathname();
  const initiales =
    `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() ||
    (email?.[0] ?? "?").toUpperCase();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ===== Rail bureau ===== */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 bg-gradient-to-b from-[#0F5B69] to-[#0C2A30] p-4 text-slate-300 lg:flex">
        <div className="px-1 pb-4 pt-1">
          <CoBrand />
          <p className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6FA0A7]">
            Espace apprenant
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="px-3 pb-1 pt-4 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5C8A91]">
                {section.group}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[#2B7A85]/50 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px] flex-none opacity-90" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-[#2B7A85] to-[#00b0f0] text-sm font-bold text-white">
              {initiales}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                {prenom} {nom}
              </p>
              <p className="truncate text-[11px] text-[#6FA0A7]">{parcoursNom}</p>
            </div>
          </div>
          <form action={signOut} className="mt-3">
            <button className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/40 hover:text-white">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* ===== Barre mobile ===== */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <CoBrand compact />
          <form action={signOut}>
            <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
              Quitter
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.flatMap((s) => s.items).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "bg-teal text-white"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

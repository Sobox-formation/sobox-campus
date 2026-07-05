"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions";

function CoBrand() {
  return (
    <div className="flex w-fit items-center gap-3 rounded-xl bg-white px-3 py-2 shadow">
      <Image src="/brand/sobox-logo.png" alt="SOBOX" width={166} height={329} className="h-9 w-auto" priority />
      <span className="h-6 w-px bg-slate-200" />
      <Image src="/brand/gcm-logo.png" alt="Groupama Centre Manche" width={996} height={244} className="h-5 w-auto" priority />
    </div>
  );
}

const NAV = [
  {
    href: "/formateur",
    label: "Ma promo",
    match: (p: string) => p === "/formateur" || p.startsWith("/formateur/apprenants"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <circle cx="9" cy="8" r="3" />
        <path d="M15 8a3 3 0 1 0 0-.01M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" />
      </svg>
    ),
  },
  {
    href: "/formateur/messages",
    label: "Messages",
    match: (p: string) => p.startsWith("/formateur/messages"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[18px] w-[18px]">
        <path d="M4 5h16v11H8l-4 4z" />
      </svg>
    ),
  },
];

export default function FormateurSidebar({
  prenom,
  nom,
  parcoursNom,
}: {
  prenom: string;
  nom: string;
  parcoursNom: string;
}) {
  const pathname = usePathname();
  const initiales = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "F";

  return (
    <>
      {/* Rail bureau */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 bg-gradient-to-b from-[#0F5B69] to-[#0C2A30] p-4 text-slate-300 lg:flex">
        <div className="px-1 pb-4 pt-1">
          <CoBrand />
          <p className="mt-3 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6FA0A7]">
            Espace formateur
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
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
                <span className="opacity-90">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-[#F49716] to-[#d97f08] text-sm font-bold text-white">
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

      {/* Barre mobile */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <CoBrand />
          <form action={signOut}>
            <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
              Quitter
            </button>
          </form>
        </div>
        <nav className="flex gap-1 px-3 pb-2">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active ? "bg-teal text-white" : "bg-slate-100 text-slate-600",
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

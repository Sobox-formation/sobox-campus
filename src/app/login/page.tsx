"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function traduire(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("email not confirmed"))
    return "E-mail non confirmé : vérifiez votre boîte mail.";
  if (m.includes("already registered"))
    return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("at least 6")) return "Le mot de passe doit faire au moins 6 caractères.";
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduire(error.message));
      else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nom, prenom } },
      });
      if (error) setError(traduire(error.message));
      else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setInfo(
          "Compte créé ! Confirmez votre e-mail, puis revenez vous connecter.",
        );
        setMode("in");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panneau de marque */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-teal to-teal-dark p-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(420px 220px at 85% 0%, rgba(244,151,22,.35), transparent 60%), radial-gradient(360px 240px at 110% 120%, rgba(0,176,240,.35), transparent 60%)",
          }}
        />
        <div className="relative flex w-fit items-center gap-4 rounded-2xl bg-white px-5 py-3.5 shadow-lg">
          <Image
            src="/brand/sobox-logo.png"
            alt="SOBOX"
            width={166}
            height={329}
            className="h-11 w-auto"
            priority
          />
          <span className="h-9 w-px bg-slate-200" />
          <Image
            src="/brand/gcm-logo.png"
            alt="Groupama Centre Manche"
            width={996}
            height={244}
            className="h-6 w-auto"
            priority
          />
        </div>
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            Ta pépinière, en ligne
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold leading-tight">
            Grandir, développer ses talents, préparer son évolution.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Retrouve ton parcours, tes supports, tes évaluations et Willy, ton
            copilote — au même endroit, à ton rythme.
          </p>
        </div>
        <p className="relative text-sm text-white/60">
          © SOBOX — Organisme de formation certifié Qualiopi
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/brand/sobox-logo.png"
              alt="SOBOX"
              width={166}
              height={329}
              className="h-10 w-auto"
            />
            <span className="h-8 w-px bg-slate-200" />
            <Image
              src="/brand/gcm-logo.png"
              alt="Groupama Centre Manche"
              width={996}
              height={244}
              className="h-5 w-auto"
            />
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">
            {mode === "in" ? "Bon retour 👋" : "Créer mon compte"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "in"
              ? "Connecte-toi pour accéder à ton parcours."
              : "Rejoins ton espace d'apprentissage SOBOX."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "up" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
                />
                <input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Nom"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
                />
              </div>
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal focus:bg-white"
            />

            {error && (
              <p className="rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-teal/10 px-3 py-2 text-sm text-teal-dark">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-dark disabled:opacity-60"
            >
              {loading
                ? "Un instant…"
                : mode === "in"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "in" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-teal hover:underline"
            >
              {mode === "in" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  getQuestionnaireDetail,
  isScoreType,
  scoreTotal,
  getScoreBand,
} from "@/lib/softskills";

const DIM_COLOR: Record<string, string> = {
  fuite: "#8A9293",
  attaque: "#E94168",
  manipulation: "#F49716",
  assertivite: "#2B7A85",
  rouge: "#E5484D",
  jaune: "#EAB308",
  vert: "#70AD47",
  bleu: "#3E9BE0",
};

const INTERPRETATION: Record<string, React.ReactNode> = {
  assertivite: (
    <>
      <p>
        Ce test évalue ta manière d’aborder les conflits à travers quatre
        attitudes. Les valeurs <strong>hautes (10 à 15)</strong> sont ancrées
        chez toi ; les valeurs <strong>basses (moins de 5)</strong> sont peu
        mobilisées. L’objectif est de développer l’assertivité.
      </p>
      <ul className="mt-3 space-y-1.5">
        <li>
          <strong>Fuite</strong> — éviter le conflit, différer, taire son
          désaccord.
        </li>
        <li>
          <strong>Attaque</strong> — s’imposer, faire entendre son point de vue
          avec force.
        </li>
        <li>
          <strong>Manipulation</strong> — obtenir par des moyens détournés,
          l’influence.
        </li>
        <li>
          <strong>Assertivité</strong> — exprimer clairement ses besoins, dans
          le respect de l’autre.
        </li>
      </ul>
    </>
  ),
  disc: (
    <p>
      Ton profil DISC met en avant tes couleurs dominantes. Le{" "}
      <strong>Bleu</strong> (consciencieux, rigueur, analyse) et le{" "}
      <strong>Vert</strong> (stable, coopératif, à l’écoute) traduisent une
      posture fiable et relationnelle. Face à un profil Rouge très direct, pense
      à aller à l’essentiel rapidement ; face à un Jaune, laisse de la place à
      l’enthousiasme.
    </p>
  ),
};

const SYNTHESE: Record<string, string> = {
  disc: "Tu privilégies la fiabilité et l’écoute. Ton axe de développement : oser davantage la prise d’initiative directe (couleur Rouge) quand la situation l’exige.",
};

// Synthèse d'assertivité, adaptée à la tendance dominante réelle.
const ASSERT_SYNTHESE: Record<string, string> = {
  fuite:
    "Ta tendance dominante est la fuite : tu évites le conflit et diffères l’expression de ton désaccord. Axe de progrès : oser exprimer tes besoins plus tôt et plus clairement, sans attendre.",
  attaque:
    "Ta tendance dominante est l’attaque : tu t’imposes et défends ton point de vue avec force. Axe de progrès : laisser davantage d’espace à l’autre et rechercher le compromis gagnant-gagnant.",
  manipulation:
    "Ta tendance dominante est la manipulation : tu obtiens par l’influence et des voies détournées. Axe de progrès : gagner en transparence pour installer une relation de confiance durable.",
  assertivite:
    "Ton profil est nettement assertif : tu exprimes tes besoins clairement, dans le respect de l’autre. Continue à cultiver cette posture, en particulier sous pression.",
};

export default async function SoftSkillDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const q = await getQuestionnaireDetail(code);

  if (!q) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Questionnaire introuvable
        </p>
        <Link
          href="/soft-skills"
          className="mt-3 inline-flex text-sm font-semibold text-teal hover:underline"
        >
          ← Retour aux soft skills
        </Link>
      </div>
    );
  }

  const r = q.result;
  const dominant =
    r && q.dimensions.length
      ? q.dimensions.reduce((a, b) =>
          (r.scores[b.code] ?? 0) > (r.scores[a.code] ?? 0) ? b : a,
        )
      : null;

  const syntheseText =
    code === "assertivite"
      ? dominant
        ? ASSERT_SYNTHESE[dominant.code]
        : null
      : SYNTHESE[code];

  // Mode « score + niveau » (auto-diags scorés, ex. confiance en soi)
  const scored = isScoreType(code);
  const total = r ? scoreTotal(r.scores) : 0;
  const maxTotal = q.dimensions.reduce((s, d) => s + d.scoreMax, 0);
  const pctScore = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  const band = r ? getScoreBand(code, total) : null;

  return (
    <div>
      <Link
        href="/soft-skills"
        className="text-sm font-semibold text-teal hover:underline"
      >
        ← Tests &amp; soft skills
      </Link>
      <h1 className="font-display mt-3 text-3xl font-bold text-ink">
        {q.titre}
      </h1>

      {!r ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-500">
            Tu n’as pas encore passé ce questionnaire.
          </p>
          {q.source === "natif" ? (
            <Link
              href={`/soft-skills/${code}/passer`}
              className="mt-4 inline-flex rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark"
            >
              Passer le questionnaire →
            </Link>
          ) : (
            q.source === "google_form" &&
            q.formUrl && (
              <a
                href={q.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark"
              >
                Répondre au questionnaire →
              </a>
            )
          )}
        </div>
      ) : scored ? (
        <>
          {/* Score global + niveau */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ton score
            </p>
            <p className="font-display mt-1 text-4xl font-bold text-ink">
              {total}
              <span className="text-xl text-slate-400"> / {maxTotal}</span>
            </p>
            <div className="mx-auto mt-4 h-3 max-w-md overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal transition-all"
                style={{ width: `${pctScore}%` }}
              />
            </div>
            {band && (
              <span className="mt-4 inline-flex rounded-full bg-teal/10 px-4 py-1.5 text-sm font-bold text-teal-dark">
                {band.label}
              </span>
            )}
          </section>
          {band && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Ce que ça dit de toi
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {band.text}
              </p>
              <p className="mt-4 rounded-xl bg-orange/5 px-4 py-3 text-xs font-medium text-slate-500">
                ⓘ Restitution synthétique — une analyse plus fine sera proposée
                prochainement.
              </p>
            </section>
          )}
        </>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-teal/10 px-3 py-1 text-sm font-bold text-teal-dark">
              Profil : {r.profilDominant ?? dominant?.libelle}
            </span>
          </div>

          {/* Graphique des dimensions */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Tes résultats par dimension
            </h3>
            <div className="mt-5 space-y-4">
              {q.dimensions.map((d) => {
                const val = r.scores[d.code] ?? 0;
                const pct = d.scoreMax > 0 ? (val / d.scoreMax) * 100 : 0;
                const color = DIM_COLOR[d.code] ?? "#2B7A85";
                const isDominant = dominant?.code === d.code;
                return (
                  <div
                    key={d.code}
                    className="grid grid-cols-[160px_1fr_auto] items-center gap-4"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {d.libelle}
                      {isDominant && (
                        <span className="ml-1.5 text-xs font-bold text-teal">
                          ★
                        </span>
                      )}
                    </span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-700">
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interprétation */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-ink">
              Comment lire ton profil ?
            </h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              {INTERPRETATION[code] ?? (
                <p>Voici la restitution de ton profil.</p>
              )}
            </div>
            {syntheseText && (
              <p className="mt-4 rounded-xl bg-teal/5 px-4 py-3 text-sm font-medium text-teal-dark">
                💡 {syntheseText}
              </p>
            )}
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            {r.pdfUrl && r.pdfUrl !== "#" ? (
              <a
                href={r.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-teal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-dark"
              >
                Télécharger le PDF détaillé
              </a>
            ) : (
              q.source === "google_form" && (
                <p className="text-sm text-slate-400">
                  Ton PDF personnalisé détaillé t’a été envoyé par e-mail après
                  la passation.
                </p>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

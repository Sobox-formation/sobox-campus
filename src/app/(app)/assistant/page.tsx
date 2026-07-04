import { getAssistantData } from "@/lib/messages";
import { getParcoursData } from "@/lib/parcours";
import AssistantChat from "@/components/assistant-chat";

export default async function AssistantPage() {
  const [assistant, parcours] = await Promise.all([
    getAssistantData(),
    getParcoursData(),
  ]);
  const prenom = parcours?.profile?.prenom ?? "";

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Ton copilote, 24/7
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Willy &amp; formateurs
      </h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Pose tes questions à Willy, ton copilote IA — ou bascule sur la
        messagerie de tes formateurs quand tu préfères un échange humain.
      </p>

      <div className="mt-8">
        <AssistantChat
          prenom={prenom}
          initialWilly={assistant?.willy ?? []}
          initialFormateur={assistant?.formateur ?? []}
        />
      </div>
    </div>
  );
}

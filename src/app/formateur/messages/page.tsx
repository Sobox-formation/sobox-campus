import { getFormateurConversations } from "@/lib/formateur";
import FormateurMessages from "@/components/formateur-messages";

export default async function FormateurMessagesPage() {
  const conversations = await getFormateurConversations();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Accompagnement
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">Messages</h1>
      <p className="mt-2 text-slate-500">
        Les messages de tes apprenants, et tes réponses.
      </p>

      <div className="mt-8">
        <FormateurMessages conversations={conversations} />
      </div>
    </div>
  );
}

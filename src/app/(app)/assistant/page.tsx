import SectionPlaceholder from "@/components/section-placeholder";

export default function AssistantPage() {
  return (
    <SectionPlaceholder
      eyebrow="Ton copilote, 24/7"
      titre="Willy & formateurs"
      description="Pose tes questions à Willy, ton copilote IA — ou bascule sur la messagerie de tes formateurs quand tu préfères un échange humain."
      bientot={[
        "Assistant IA « Willy » branché sur les contenus de ton parcours",
        "Messagerie vers tes formateurs référents avec historique",
        "Rappels d’échéances et propositions d’entraînement entre les sessions",
      ]}
    />
  );
}

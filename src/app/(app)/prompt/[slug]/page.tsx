import type { Metadata } from "next";
import PromptShareView from "@/app/components/ui/prompts/PromptShareView";
import { firstValidQuestion } from "@/lib/questionPrompt";
import { QuestionGroup } from "@/types/questionGroup";

interface PromptPageProps {
  params: Promise<{ slug: string }>;
}

// Public — both GET /api/question-groups/:id and .../by-slug/:slug require
// no auth, so this can be fetched server-side without a token. A purely
// numeric value is a legacy link (prompts were shared as /prompt/<id> before
// slugs existed) and keeps resolving via the id route forever; anything else
// is a slug. Deliberately not cached: an admin deactivating/editing a prompt
// should be reflected on the next visit to a link that's already been shared.
async function getGroup(value: string): Promise<QuestionGroup | null> {
  const isLegacyId = /^\d+$/.test(value);
  const url = isLegacyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/question-groups/${value}`
    : `${process.env.NEXT_PUBLIC_API_URL}/api/question-groups/by-slug/${encodeURIComponent(value)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.questionGroup ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: PromptPageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getGroup(slug);
  const question = group ? firstValidQuestion(group.questions) : null;

  if (!group || !question) {
    return { title: "Prompt — Cuentto" };
  }

  const title = `"${question.text}" — a Cuentto prompt`;
  const description = `${group.title}: someone shared this Cuentto writing prompt with you. Start writing your own take.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const { slug } = await params;
  const group = await getGroup(slug);
  const question = group ? firstValidQuestion(group.questions) : null;

  return (
    <PromptShareView
      groupId={group?.id ?? 0}
      groupTitle={group?.title ?? null}
      questionText={question?.text ?? null}
      groupSlug={group?.slug ?? null}
      questionId={question?.id ?? null}
    />
  );
}

import type { Metadata } from "next";
import PromptShareView from "@/app/components/ui/prompts/PromptShareView";
import { ThinkPrompt } from "@/types/think";

interface DailyPromptPageProps {
  params: Promise<{ slug: string }>;
}

// Public share link for an admin-written Today's Prompt. The API route needs
// no auth, so this is fetched server-side without a token. Not cached: an
// admin editing the prompt should show on the next visit to a shared link.
async function getThinkPrompt(slug: string): Promise<ThinkPrompt | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/think/prompts/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thinkPrompt ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: DailyPromptPageProps): Promise<Metadata> {
  const { slug } = await params;
  const thinkPrompt = await getThinkPrompt(slug);

  if (!thinkPrompt) {
    return { title: "Prompt — Cuentto" };
  }

  const title = `"${thinkPrompt.text}" — a Cuentto prompt`;
  const description =
    "Someone shared this Cuentto writing prompt with you. Start writing your own take.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function DailyPromptPage({ params }: DailyPromptPageProps) {
  const { slug } = await params;
  const thinkPrompt = await getThinkPrompt(slug);

  // No groupSlug/questionId: the mobile app can't open written prompts yet,
  // so the "Open in app" button stays hidden.
  return (
    <PromptShareView
      groupId={0}
      groupTitle={thinkPrompt ? "Today's Prompt" : null}
      questionText={thinkPrompt?.text ?? null}
      groupSlug={null}
      questionId={null}
      startWritingHref={
        thinkPrompt
          ? `/cuentto/create?dailyPrompt=${encodeURIComponent(thinkPrompt.slug)}`
          : undefined
      }
    />
  );
}

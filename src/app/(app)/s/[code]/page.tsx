import type { Metadata } from "next";
import PromptShareView from "@/app/components/ui/prompts/PromptShareView";
import ShareLinkLanding from "@/app/components/ui/prompts/ShareLinkLanding";
import { fetchShareLink } from "@/lib/api/shareLinks";
import { promptPath } from "@/lib/promptShareLink";
import MoodPromptPage, {
  generateMetadata as moodPromptMetadata,
} from "../../prompt/[slug]/page";
import DailyPromptPage, {
  generateMetadata as dailyPromptMetadata,
} from "../../prompt/daily/[slug]/page";

interface ShareLinkPageProps {
  params: Promise<{ code: string }>;
}

// A short share link (/s/<code>). It renders the prompt page it points at —
// same content and link preview — then swaps the address bar to the
// prompt's own URL. The sharer comes from the server, so there's no `?from=`
// for the recipient to remove. Not cached: a removed link should stop working.

export async function generateMetadata({
  params,
}: ShareLinkPageProps): Promise<Metadata> {
  const { code } = await params;
  const link = await fetchShareLink(code);
  if (!link) return { title: "Prompt — Cuentto" };
  const target = { params: Promise.resolve({ slug: link.slug }) };
  return link.kind === "daily"
    ? dailyPromptMetadata(target)
    : moodPromptMetadata(target);
}

export default async function ShareLinkPage({ params }: ShareLinkPageProps) {
  const { code } = await params;
  const link = await fetchShareLink(code);

  if (!link) {
    // The prompt view's own "not found" state.
    return (
      <PromptShareView
        groupId={0}
        groupTitle={null}
        questionText={null}
        groupSlug={null}
        questionId={null}
      />
    );
  }

  const target = { params: Promise.resolve({ slug: link.slug }) };
  return (
    <>
      <ShareLinkLanding
        sharer={link.sharer?.usernameSlug || link.sharer?.username || null}
        canonicalPath={promptPath(link)}
      />
      {link.kind === "daily" ? (
        <DailyPromptPage {...target} />
      ) : (
        <MoodPromptPage {...target} />
      )}
    </>
  );
}

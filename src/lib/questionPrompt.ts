import { Question } from "@/types/questionGroup";

// A question is only shown when it's answerable and has real text — the same
// rule /think and /mindfulness use, so a prompt never opens into (or gets
// carried into the Create Cuentto screen as) something with nothing to answer.
export function firstValidQuestion(
  questions?: Question[] | null,
): Question | null {
  if (!Array.isArray(questions)) return null;
  const valid = questions
    .filter(
      (q) =>
        q &&
        q.isAnswer !== false &&
        typeof q.text === "string" &&
        q.text.trim().length > 0,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return valid[0] ?? null;
}

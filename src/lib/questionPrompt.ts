import { Question } from "@/types/questionGroup";

// The answerable questions of a group, in display order. A question is included
// only when it's explicitly answerable (isAnswer === true) and has real text —
// the same rule /think and /mindfulness use, so a prompt never surfaces
// something with nothing to answer. Questions flagged isAnswer: false — or
// missing the flag entirely — are excluded. Sorted by `order` so the order
// matches what admins defined. Never mutates the input.
export function validQuestions(questions?: Question[] | null): Question[] {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter(
      (q) =>
        q &&
        q.isAnswer === true &&
        typeof q.text === "string" &&
        q.text.trim().length > 0,
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// The first answerable question (by order), or null. Used wherever a single
// representative prompt is needed (e.g. the daily pick, the Create screen).
export function firstValidQuestion(
  questions?: Question[] | null,
): Question | null {
  return validQuestions(questions)[0] ?? null;
}

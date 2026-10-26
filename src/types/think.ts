import { Question, QuestionGroup } from "./questionGroup";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  /** Composer countdown length, bounded 60..3600; null = no time limit. */
  durationSeconds: number | null;
  /** Display-window bounds. Null on either side means "no bound" there. */
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

/** An admin-written Today's Prompt (free text, not tied to any mood). */
export interface ThinkPrompt {
  id: number;
  text: string;
  /** Public share slug; never changes after create. */
  slug: string;
  /** Ready-made "/prompt/daily/{slug}" relative path. */
  shareLink: string;
  /** YYYY-MM-DD it's pinned to, or null when it's in the daily rotation. */
  scheduledFor: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodaysPrompt {
  /**
   * "scheduled" — an admin-written prompt pinned to today.
   * "rotation"  — today's turn in the rotation of undated written prompts.
   * "fallback"  — no written prompt applies, so the server made the
   *               deterministic date-based pick of a mood question.
   */
  source: "scheduled" | "rotation" | "fallback";
  /** Set for "scheduled" and "rotation"; question/questionGroup are then null. */
  thinkPrompt?: ThinkPrompt | null;
  /**
   * The single question on display today ("fallback" only), hoisted by the
   * API so nothing has to re-derive it. `questionGroup.questions` contains
   * only this same question.
   */
  question?: Question | null;
  questionGroup?: QuestionGroup | null;
}

export interface ThinkToday {
  prompt: TodaysPrompt | null;
  challenge: Challenge | null;
}

export interface ThinkPromptList {
  /** The server's idea of today — the client never derives this itself. */
  today: string;
  /** Written prompt live on Think today; null = the automatic question pick. */
  livePromptId: number | null;
  maxWords: number;
  thinkPrompts: ThinkPrompt[];
}

export interface ThinkPromptInput {
  text: string;
  /** YYYY-MM-DD pins it to that day; null puts it in the rotation. */
  scheduledFor: string | null;
  isActive?: boolean;
}

export interface ChallengeList {
  /** The challenge actually on display now; `isActive` alone doesn't say. */
  liveChallengeId: number | null;
  challenges: Challenge[];
}

/** Toggling changes which challenge is live, so the new answer ships back. */
export interface ChallengeToggleResult {
  challenge: Challenge;
  liveChallengeId: number | null;
}

export interface ChallengeInput {
  title: string;
  description: string;
  /** null = no time limit. */
  durationSeconds: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

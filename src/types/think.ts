import { QuestionGroup } from "./questionGroup";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  /** Composer countdown length. Backend bounds this to 60..3600. */
  durationSeconds: number;
  /** Display-window bounds. Null on either side means "no bound" there. */
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
}

export interface TodaysPrompt {
  /**
   * "scheduled" — an admin picked this group for today.
   * "fallback"  — nothing scheduled, so the server made the same
   *               deterministic date-based pick the client used to make.
   */
  source: "scheduled" | "fallback";
  questionGroup: QuestionGroup;
}

export interface ThinkToday {
  prompt: TodaysPrompt | null;
  challenge: Challenge | null;
}

/** One scheduled day in the admin's Today's Prompt calendar. */
export interface DailyPrompt {
  id: number;
  /** YYYY-MM-DD */
  date: string;
  questionGroupId: number;
  questionGroup?: QuestionGroup;
}

export interface DailyPromptSchedule {
  from: string;
  to: string;
  /** The server's idea of today — the client never derives this itself. */
  today: string;
  dailyPrompts: DailyPrompt[];
}

/** Minimal shape the daily-prompt picker needs. */
export interface SelectableGroup {
  id: number;
  title: string;
  isActive: boolean;
  /**
   * The question that will actually appear on Think for this group — its
   * first answerable one. This is what the picker shows, since a group title
   * like "group-1" says nothing about what a writer will read.
   */
  questionText: string;
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
  durationSeconds: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

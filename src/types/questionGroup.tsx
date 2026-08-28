export interface Question {
  id?: number;
  text: string;
  description?: string | null;
  order?: number;
  isAnswer?: boolean;
}

export interface QuestionGroup {
  id: number;
  title: string;
  description?: string | null;
  // Optional rather than required: the backend always sets it, but keeping
  // it optional here is a safety net for the narrow window where the
  // frontend could deploy before the backend migration/backfill completes.
  slug?: string;
  // Ready-made "/prompt/{slug}" relative path from the backend — prefer this
  // over building the path by hand. Optional for the same deploy-ordering
  // reason as slug above (older backend responses won't have it yet).
  shareLink?: string;
  moodId?: number | null;
  mood?: { id: number; title?: string; color?: string } | null;
  questions?: Question[];
  isActive?: boolean;
  createdBy?: number;
  _count?: { questions: number };
  createdAt?: string;
  updatedAt?: string;
}

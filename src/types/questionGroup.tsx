export interface Question {
  id?: number;
  text: string;
  description?: string | null;
  order?: number;
}

export interface QuestionGroup {
  id: number;
  title: string;
  description?: string | null;
  questions: Question[];
  createdAt?: string;
  updatedAt?: string;
}

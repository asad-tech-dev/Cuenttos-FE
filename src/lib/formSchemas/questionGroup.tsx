import { z } from "zod";

// A new group starts with this many blank question slots.
export const DEFAULT_QUESTIONS_PER_GROUP = 3;

// A group must have at least one question. There is no upper limit -- the
// backend accepts any number, so admins can add as many as they need.
export const MIN_QUESTIONS_PER_GROUP = 1;

export const QuestionGroupSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot be longer than 120 characters"),
  moodId: z.coerce
    .number({ invalid_type_error: "Please select a mood" })
    .int()
    .min(1, "Please select a mood"),
  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters")
    .optional()
    .or(z.literal("")),
  questions: z
    .array(
      z.object({
        id: z.number().optional(),
        text: z
          .string()
          .min(3, "Question must be at least 3 characters")
          .max(300, "Question cannot be longer than 300 characters"),
        description: z.string().nullable().optional(),
        isAnswer: z.boolean(),
      })
    )
    .min(
      MIN_QUESTIONS_PER_GROUP,
      `Please add at least ${MIN_QUESTIONS_PER_GROUP} question`
    ),
});

export type QuestionGroupFormData = z.infer<typeof QuestionGroupSchema>;

import { z } from "zod";

export const QUESTIONS_PER_GROUP = 3;

export const QuestionGroupSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot be longer than 120 characters"),
  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters")
    .optional()
    .or(z.literal("")),
  questions: z
    .array(
      z.object({
        text: z
          .string()
          .min(3, "Question must be at least 3 characters")
          .max(300, "Question cannot be longer than 300 characters"),
      })
    )
    .length(QUESTIONS_PER_GROUP, `Please provide ${QUESTIONS_PER_GROUP} questions`),
});

export type QuestionGroupFormData = z.infer<typeof QuestionGroupSchema>;

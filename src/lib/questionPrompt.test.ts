import { describe, it, expect } from "vitest";
import { firstValidQuestion, validQuestions } from "./questionPrompt";
import type { Question } from "@/types/questionGroup";

const q = (over: Partial<Question>): Question => ({
  id: 1,
  text: "text",
  order: 0,
  ...over,
});

// group 9 from /api/question-groups/active
const group9 = [
  q({ id: 28, text: "long test question…", isAnswer: false, order: 0 }),
  q({ id: 29, text: "Is it a real place or a magical land?", isAnswer: true, order: 1 }),
  q({ id: 30, text: "What season or time of day is it?", isAnswer: true, order: 2 }),
];
// group 10
const group10 = [
  q({ id: 31, text: "New Sony", isAnswer: true, order: 0 }),
  q({ id: 32, text: "Who or what gets in their way?", isAnswer: false, order: 1 }),
  q({ id: 33, text: "How should the story end?", isAnswer: false, order: 2 }),
];

describe("validQuestions — shows every isAnswer:true question, in order", () => {
  it("returns all isAnswer:true questions of a group, dropping isAnswer:false (group 9)", () => {
    expect(validQuestions(group9).map((x) => x.id)).toEqual([29, 30]);
  });

  it("returns only the isAnswer:true question when the rest are false (group 10)", () => {
    expect(validQuestions(group10).map((x) => x.id)).toEqual([31]);
  });

  it("sorts by `order`", () => {
    const out = validQuestions([
      q({ id: 2, isAnswer: true, order: 2 }),
      q({ id: 1, isAnswer: true, order: 1 }),
    ]);
    expect(out.map((x) => x.id)).toEqual([1, 2]);
  });

  it("excludes questions missing the isAnswer flag and empty text", () => {
    expect(validQuestions([q({ isAnswer: undefined })])).toEqual([]);
    expect(validQuestions([q({ text: "   ", isAnswer: true })])).toEqual([]);
  });

  it("returns [] for empty / invalid input", () => {
    expect(validQuestions([])).toEqual([]);
    expect(validQuestions(null)).toEqual([]);
    expect(validQuestions(undefined)).toEqual([]);
  });
});

describe("firstValidQuestion — first answerable question", () => {
  it("returns the first isAnswer:true question by order (skips a leading false one)", () => {
    expect(firstValidQuestion(group9)?.id).toBe(29);
    expect(firstValidQuestion(group10)?.id).toBe(31);
  });

  it("returns null when there is no answerable question", () => {
    expect(firstValidQuestion([q({ isAnswer: false })])).toBeNull();
    expect(firstValidQuestion(null)).toBeNull();
  });
});

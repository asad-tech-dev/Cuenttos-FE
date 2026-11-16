import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

let signedIn = false;
vi.mock("@/lib/api/auth", () => ({
  isAuthenticated: () => signedIn,
}));

const { default: PromptShareView } = await import("./PromptShareView");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const NO_APP_NOTE = "No app needed — write right here in your browser.";

let container: HTMLDivElement;
let root: Root;

const moodPrompt = {
  groupId: 7,
  groupTitle: "Creativity",
  questionText: "Pick your world",
  groupSlug: "creativity",
  questionId: 3,
};

const render = (props: Parameters<typeof PromptShareView>[0]) =>
  act(() => {
    root.render(createElement(PromptShareView, props));
  });

const button = (label: string) =>
  [...container.querySelectorAll("button")].find((b) =>
    b.textContent?.includes(label),
  );

beforeEach(() => {
  signedIn = false;
  push.mockClear();
  localStorage.clear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("PromptShareView", () => {
  it("tells a guest they can write here and get the app afterwards", () => {
    render(moodPrompt);
    expect(container.textContent).toContain(NO_APP_NOTE);
    expect(container.textContent).toContain(
      "You can download the app afterwards.",
    );
    expect(button("Start Writing")).toBeDefined();
    expect(button("Download App")).toBeDefined();
  });

  it("shows the note on a Today's Prompt link too, which has no app button", () => {
    render({
      groupId: 0,
      groupTitle: "Today's Prompt",
      questionText: "What made you smile?",
      groupSlug: null,
      questionId: null,
      startWritingHref: "/cuentto/create?dailyPrompt=smile",
    });
    expect(container.textContent).toContain(NO_APP_NOTE);
    expect(button("Download App")).toBeUndefined();
  });

  it("leaves the note and app button out for a signed-in user", () => {
    signedIn = true;
    render(moodPrompt);
    expect(container.textContent).not.toContain(NO_APP_NOTE);
    expect(button("Download App")).toBeUndefined();
    expect(button("Start Writing")).toBeDefined();
  });

  it("Start Writing still opens Create Cuentto for the prompt", () => {
    render(moodPrompt);
    act(() => button("Start Writing")!.click());
    expect(push).toHaveBeenCalledWith(
      "/cuentto/create?promptGroupId=7&fromPrompt=creativity",
    );
  });

  it("Start Writing on a Today's Prompt goes to its own href", () => {
    render({
      groupId: 0,
      groupTitle: "Today's Prompt",
      questionText: "What made you smile?",
      groupSlug: null,
      questionId: null,
      startWritingHref: "/cuentto/create?dailyPrompt=smile",
    });
    act(() => button("Start Writing")!.click());
    expect(push).toHaveBeenCalledWith("/cuentto/create?dailyPrompt=smile");
  });
});

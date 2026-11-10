import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import ShareLinkLanding from "./ShareLinkLanding";
import { readReferrer } from "@/lib/referrer";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLDivElement;
let root: Root;

const render = (sharer: string | null, canonicalPath = "/prompt/daily/today") =>
  act(() => {
    root.render(createElement(ShareLinkLanding, { sharer, canonicalPath }));
  });

const jwtFor = (payload: object) =>
  `h.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.s`;

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/s/Abc12345");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("ShareLinkLanding", () => {
  it("remembers the sharer for a guest and shows the prompt's URL", () => {
    render("haris-noman");
    expect(readReferrer()).toBe("haris-noman");
    expect(window.location.pathname).toBe("/prompt/daily/today");
    expect(window.location.search).toBe("");
    expect(container.innerHTML).toBe("");
  });

  it("doesn't record a referrer for a signed-in viewer", () => {
    localStorage.setItem(
      "authToken",
      jwtFor({ userId: 3, exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    render("haris-noman");
    expect(readReferrer()).toBeNull();
    expect(window.location.pathname).toBe("/prompt/daily/today");
  });

  it("copes with no sharer", () => {
    render(null, "/prompt/calm-mind");
    expect(readReferrer()).toBeNull();
    expect(window.location.pathname).toBe("/prompt/calm-mind");
  });

  it("never rewrites the URL to somewhere that isn't a prompt", () => {
    render("haris-noman", "//evil.test/x");
    expect(window.location.pathname).toBe("/s/Abc12345");
  });

  it("doesn't crash when storage or history are blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => render("haris-noman")).not.toThrow();
  });
});

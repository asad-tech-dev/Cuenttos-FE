import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import VioletButton from "./VioletButton";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLDivElement;
let root: Root;

const render = (props: Parameters<typeof VioletButton>[0]) =>
  act(() => root.render(createElement(VioletButton, props)));
const button = () => container.querySelector("button")!;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("VioletButton", () => {
  it("is violet and clickable by default", () => {
    const onClick = vi.fn();
    render({ text: "Share", onClick });
    expect(button().disabled).toBe(false);
    expect(button().className).toContain("bg-violet");
    act(() => button().click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("greys out and ignores clicks when disabled", () => {
    const onClick = vi.fn();
    render({ text: "Share", onClick, disabled: true });
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-disabled")).toBe("true");
    expect(button().className).toContain("bg-disabled-button");
    expect(button().className).not.toContain("bg-violet");
    act(() => button().click());
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not submit its form when disabled", () => {
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    const form = document.createElement("form");
    form.addEventListener("submit", onSubmit);
    container.remove();
    form.appendChild(container);
    document.body.appendChild(form);
    render({ text: "Share", type: "submit", disabled: true });
    act(() => button().click());
    expect(onSubmit).not.toHaveBeenCalled();
    form.remove();
  });

  it("stays disabled while loading even if disabled is false", () => {
    render({ text: "Share", loading: true, disabled: false });
    expect(button().disabled).toBe(true);
    // Loading keeps the violet look, with the spinner.
    expect(button().className).toContain("bg-violet");
    expect(button().textContent).toBe("");
  });
});

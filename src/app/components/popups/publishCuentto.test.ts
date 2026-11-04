import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { Dialog } from "@/components/ui/dialog";
import PublishCuentto, { PublishAudience } from "./publishCuentto";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const render = (props: Parameters<typeof PublishCuentto>[0]) =>
  act(() => {
    root.render(
      createElement(
        Dialog,
        { open: true },
        createElement(PublishCuentto, props),
      ),
    );
  });

const text = (selector: string) =>
  document.querySelector(selector)?.textContent ?? "";

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("PublishCuentto", () => {
  it("celebrates a new public Cuentto and links to the feed", () => {
    render({});
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.textContent).toContain("Your Cuentto is live!");
    expect(dialog.textContent).toContain("visible to everyone");
    expect(dialog.textContent).toContain("Visible to: Public");
    const link = dialog.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/share");
    expect(link.textContent).toBe("Go to share");
  });

  it("is labelled by its title and description", () => {
    render({});
    const dialog = document.querySelector('[role="dialog"]')!;
    const title = document.getElementById(
      dialog.getAttribute("aria-labelledby")!,
    );
    const desc = document.getElementById(
      dialog.getAttribute("aria-describedby")!,
    );
    expect(title?.textContent).toBe("Your Cuentto is live!");
    expect(desc?.textContent).toMatch(/live/);
    expect(document.querySelector('[aria-label="Close"]')).not.toBeNull();
  });

  it("says changes were saved after an edit", () => {
    render({ variant: "updated", audience: "circles" });
    expect(text('[role="dialog"] h2')).toBe("Changes saved");
    expect(text('[role="dialog"]')).toContain("Your circles will now see");
    expect(text('[role="dialog"] a')).toBe("Done");
  });

  it.each<[PublishAudience, string]>([
    ["public", "Public"],
    ["circles", "Your circles"],
    ["private", "Only you"],
  ])("names the %s audience", (audience, label) => {
    render({ audience });
    expect(text('[role="dialog"]')).toContain(`Visible to: ${label}`);
  });

  it("falls back to public for an unknown audience", () => {
    render({ audience: "nope" as PublishAudience });
    expect(text('[role="dialog"]')).toContain("Visible to: Public");
  });
});

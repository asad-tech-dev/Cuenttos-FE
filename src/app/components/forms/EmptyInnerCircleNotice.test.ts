import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import type { FollowUser } from "@/lib/api/profile";

const fetchGroupMemberIds = vi.fn<(groupId: number) => Promise<number[]>>();
const addGroupMembers =
  vi.fn<(groupId: number, userIds: number[]) => Promise<void>>();
vi.mock("@/lib/api/group", () => ({
  fetchGroupMemberIds: (groupId: number) => fetchGroupMemberIds(groupId),
  addGroupMembers: (groupId: number, userIds: number[]) =>
    addGroupMembers(groupId, userIds),
}));

const fetchReferrer = vi.fn<() => Promise<FollowUser | null>>();
vi.mock("@/lib/api/profile", () => ({
  fetchReferrer: () => fetchReferrer(),
}));

vi.mock("@/lib/api/auth", () => ({
  getCurrentUserId: () => 1,
}));

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({ toast: { success: (m: string) => toastSuccess(m) } }));

const { default: EmptyInnerCircleNotice } = await import(
  "./EmptyInnerCircleNotice"
);

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const circle = { id: 10, name: "Inner Circle", default: true, createdBy: 1 };
const jose: FollowUser = { id: 2, username: "jose", profileName: "Jose Arroyo" };

let container: HTMLDivElement;
let root: Root;

const render = async (selected = true) => {
  await act(async () => {
    root.render(createElement(EmptyInnerCircleNotice, { circle, selected }));
  });
};

const text = () => container.textContent ?? "";
const addButton = () =>
  [...container.querySelectorAll("button")].find((b) =>
    b.textContent?.includes("Add "),
  );

beforeEach(() => {
  fetchGroupMemberIds.mockReset();
  addGroupMembers.mockReset();
  fetchReferrer.mockReset();
  toastSuccess.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("EmptyInnerCircleNotice", () => {
  it("offers to add the sharer when the picked Inner Circle is empty", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue(jose);
    await render();
    expect(text()).toContain(
      "Your Inner Circle is empty, so no one will see this Cuentto yet.",
    );
    expect(text()).toContain("Jose Arroyo shared a prompt with you");
    expect(addButton()?.textContent).toContain(
      "Add Jose Arroyo to your Inner Circle",
    );
  });

  it("suggests Public when there's no sharer", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue(null);
    await render();
    expect(text()).toContain("Select Public as well");
    expect(addButton()).toBeUndefined();
  });

  it("still explains when the sharer lookup fails", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockRejectedValue(new Error("offline"));
    await render();
    expect(text()).toContain("Select Public as well");
  });

  it("ignores a referrer that is the user themselves", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue({ id: 1, username: "me" });
    await render();
    expect(addButton()).toBeUndefined();
  });

  it("shows nothing when the Inner Circle isn't picked", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue(jose);
    await render(false);
    expect(text()).toBe("");
  });

  it("shows nothing when the Inner Circle has people in it", async () => {
    fetchGroupMemberIds.mockResolvedValue([5]);
    fetchReferrer.mockResolvedValue(jose);
    await render();
    expect(text()).toBe("");
  });

  it("shows nothing when the circle can't be checked", async () => {
    fetchGroupMemberIds.mockRejectedValue(new Error("500"));
    fetchReferrer.mockResolvedValue(jose);
    await render();
    expect(text()).toBe("");
  });

  it("adds the sharer, confirms it, and then hides", async () => {
    fetchGroupMemberIds.mockResolvedValueOnce([]).mockResolvedValueOnce([2]);
    fetchReferrer.mockResolvedValue(jose);
    addGroupMembers.mockResolvedValue();
    await render();
    await act(async () => addButton()!.click());
    expect(addGroupMembers).toHaveBeenCalledWith(10, [2]);
    expect(toastSuccess).toHaveBeenCalledWith(
      "Jose Arroyo added to Inner Circle",
    );
    expect(text()).toBe("");
  });

  it("reports when the backend didn't actually add them", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue(jose);
    addGroupMembers.mockResolvedValue();
    await render();
    await act(async () => addButton()!.click());
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(text()).toContain("Could not add Jose Arroyo. Please try again.");
    expect(addButton()).toBeDefined();
  });

  it("shows the server's message when adding fails", async () => {
    fetchGroupMemberIds.mockResolvedValue([]);
    fetchReferrer.mockResolvedValue(jose);
    addGroupMembers.mockRejectedValue(
      Object.assign(new Error("403"), {
        isAxiosError: true,
        response: { data: { message: "Only a group admin can manage members" } },
      }),
    );
    await render();
    await act(async () => addButton()!.click());
    expect(text()).toContain("Only a group admin can manage members");
  });
});

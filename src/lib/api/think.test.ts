import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import {
  createChallenge,
  fetchChallenges,
  fetchThinkPrompts,
  fetchThinkToday,
  toggleChallengeActive,
  updateChallenge,
} from "./think";

afterEach(() => vi.restoreAllMocks());

const zone = (timeZone: string) =>
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
    timeZone,
  } as Intl.ResolvedDateTimeFormatOptions);

describe("Think requests carry the viewer's day", () => {
  it("Today's Prompt sends the timezone and local date", async () => {
    zone("Asia/Karachi");
    const get = vi
      .spyOn(axios, "get")
      .mockResolvedValue({ data: { prompt: null, challenge: null } });
    await fetchThinkToday();
    const params = get.mock.calls[0][1]?.params;
    expect(params.tz).toBe("Asia/Karachi");
    expect(params.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("the admin list sends the same, so both agree on today", async () => {
    zone("America/Puerto_Rico");
    const get = vi.spyOn(axios, "get").mockResolvedValue({ data: {} });
    await fetchThinkPrompts();
    expect(get.mock.calls[0][1]?.params.tz).toBe("America/Puerto_Rico");
  });
});

describe("Challenge admin requests carry the admin's timezone", () => {
  const input = {
    title: "Sprint",
    description: "Go.",
    durationSeconds: 300,
    startsAt: "2026-11-20T00:00",
    endsAt: null,
  };

  it("the list sends ?tz= so 'On Think now' matches the admin's clock", async () => {
    zone("Europe/Berlin");
    const get = vi.spyOn(axios, "get").mockResolvedValue({ data: {} });
    await fetchChallenges();
    expect(get.mock.calls[0][1]?.params.tz).toBe("Europe/Berlin");
  });

  it("create, update and activate send it too, and the body is unchanged", async () => {
    zone("Asia/Karachi");
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { challenge: {} } });
    const patch = vi
      .spyOn(axios, "patch")
      .mockResolvedValue({ data: { challenge: {}, liveChallengeId: null } });

    await createChallenge(input);
    expect(post.mock.calls[0][1]).toEqual(input);
    expect(post.mock.calls[0][2]?.params).toEqual({ tz: "Asia/Karachi" });

    await updateChallenge(1, input);
    expect(patch.mock.calls[0][2]?.params).toEqual({ tz: "Asia/Karachi" });

    await toggleChallengeActive(1, true);
    expect(patch.mock.calls[1][2]?.params).toEqual({ tz: "Asia/Karachi" });
  });

  it("sends no tz when the browser can't name its zone", async () => {
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(
      () => {
        throw new Error("no Intl");
      },
    );
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { challenge: {} } });
    await createChallenge(input);
    expect(post.mock.calls[0][2]?.params).toEqual({});
  });
});

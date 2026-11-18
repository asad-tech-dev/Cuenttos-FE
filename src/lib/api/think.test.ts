import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { fetchThinkPrompts, fetchThinkToday } from "./think";

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

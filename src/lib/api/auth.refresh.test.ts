import { describe, it, expect, vi, beforeEach } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("axios", () => ({ default: { post: postMock } }));

import { refreshAccessToken } from "./auth";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("refreshAccessToken", () => {
  it("posts to the refresh endpoint with cookie credentials + web client header, then stores and returns the new token", async () => {
    postMock.mockResolvedValue({ data: { token: "fresh-access" } });

    const token = await refreshAccessToken();

    expect(token).toBe("fresh-access");
    expect(localStorage.getItem("authToken")).toBe("fresh-access");

    const [url, body, config] = postMock.mock.calls[0];
    expect(url).toContain("/api/auth/refreshtoken");
    expect(body).toEqual({});
    expect(config.withCredentials).toBe(true);
    expect(config.headers["x-client-type"]).toBe("web");
  });

  it("throws and stores nothing when the response carries no token", async () => {
    postMock.mockResolvedValue({ data: {} });

    await expect(refreshAccessToken()).rejects.toThrow(/No access token/);
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("propagates a network/401 error from the refresh call", async () => {
    postMock.mockRejectedValue(new Error("Request failed with status code 401"));

    await expect(refreshAccessToken()).rejects.toThrow(/401/);
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});

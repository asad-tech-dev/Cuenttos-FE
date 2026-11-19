import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { normalizeEmail } from "./email";
import { loginUser, registerUser } from "./api/auth";

afterEach(() => vi.restoreAllMocks());

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("John.Doe@Mail.COM")).toBe("john.doe@mail.com");
    expect(normalizeEmail("  user@x.com \n")).toBe("user@x.com");
    expect(normalizeEmail("already@lower.com")).toBe("already@lower.com");
  });
});

describe("auth requests send the email lowercase", () => {
  it("login", async () => {
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { token: "t", isAdmin: false } });
    await loginUser({ email: " John@Mail.COM ", password: "secret1" });
    expect(post.mock.calls[0][1]).toEqual({
      email: "john@mail.com",
      password: "secret1",
    });
  });

  it("sign-up, so the sign-in right after it matches", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {} });
    await registerUser({
      username: "john",
      email: "John@Mail.com",
      password: "secret1",
      terms: true,
      referrer: "ana",
    });
    expect(post.mock.calls[0][1]).toEqual({
      username: "john",
      email: "john@mail.com",
      password: "secret1",
      terms: true,
      referrer: "ana",
    });
  });

  it("leaves the password exactly as typed", async () => {
    const post = vi
      .spyOn(axios, "post")
      .mockResolvedValue({ data: { token: "t" } });
    await loginUser({ email: "a@b.com", password: " PassWord " });
    expect((post.mock.calls[0][1] as { password: string }).password).toBe(
      " PassWord ",
    );
  });
});

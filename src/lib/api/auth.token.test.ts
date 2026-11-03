import { afterEach, describe, expect, it } from "vitest";
import { decodeTokenPayload, getCurrentUsername } from "./auth";

// A JWT-shaped token, encoded exactly as the backend's jsonwebtoken does:
// base64url, UTF-8, no padding.
const jwtFor = (payload: object) => {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const base64url = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `h.${base64url}.s`;
};

afterEach(() => localStorage.clear());

describe("decodeTokenPayload", () => {
  it("decodes base64url payloads that plain atob rejects", () => {
    // "~~~" encodes to "fn5-" in base64url — the "-" breaks atob.
    const token = jwtFor({ userName: "~~~", userId: 1 });
    expect(token).toContain("-");
    expect(decodeTokenPayload(token)).toMatchObject({ userName: "~~~" });
  });

  it("decodes non-ASCII names", () => {
    expect(decodeTokenPayload(jwtFor({ userName: "José Ñandú" }))).toMatchObject({
      userName: "José Ñandú",
    });
  });

  it("returns null for malformed tokens", () => {
    for (const token of ["", "nodots", "h.!!!.s", "h..s"]) {
      expect(decodeTokenPayload(token)).toBeNull();
    }
  });
});

describe("getCurrentUsername", () => {
  it("reads userName, spaces and all", () => {
    localStorage.setItem("authToken", jwtFor({ userName: "haris noman" }));
    expect(getCurrentUsername()).toBe("haris noman");
  });

  it("is null when signed out or the claim is missing", () => {
    expect(getCurrentUsername()).toBeNull();
    localStorage.setItem("authToken", jwtFor({ userId: 1 }));
    expect(getCurrentUsername()).toBeNull();
  });
});

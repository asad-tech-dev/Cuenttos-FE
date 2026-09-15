"use client";
// TEMPORARY local-only harness — seeds a client-side session so the real
// /saved page can be rendered against the mock API. Deleted after review.
import { useEffect } from "react";

export default function Preview() {
  useEffect(() => {
    const b64 = (o: object) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const token = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
      userId: 7,
      userEmail: "you@example.com",
      userName: "you",
      exp: Math.floor(Date.now() / 1000) + 86400,
    })}.sig`;
    localStorage.setItem("authToken", token);
    const target = new URLSearchParams(window.location.search).get("to") || "/saved";
    window.location.replace(target);
  }, []);
  return <p>seeding…</p>;
}

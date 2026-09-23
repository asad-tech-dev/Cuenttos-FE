"use client";

import { useEffect } from "react";
import { installAuthInterceptor } from "@/lib/api/authInterceptor";

/**
 * Installs the global axios auth interceptor exactly once on the client. Render
 * near the root so silent token refresh is active for the whole app. Renders
 * nothing.
 */
export default function AuthInterceptorProvider() {
  useEffect(() => {
    installAuthInterceptor();
  }, []);

  return null;
}

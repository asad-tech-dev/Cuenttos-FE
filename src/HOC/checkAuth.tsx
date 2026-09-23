"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { refreshAccessToken } from "@/lib/api/auth";

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 > Date.now();
    }
    return true;
  } catch {
    return false;
  }
};

const checkAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthWrapper = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      let active = true;
      // Preserve where the user was headed (e.g. a shared prompt's
      // /cuentto/create?promptGroupId=...) so login can send them back.
      const loginTarget = `/login?redirect=${encodeURIComponent(
        window.location.pathname + window.location.search,
      )}`;

      const resolve = async () => {
        const token = localStorage.getItem("authToken");
        if (isTokenValid(token)) {
          if (active) setIsAuthenticated(true);
          return;
        }
        // Access token missing or expired — try a silent refresh via the
        // httpOnly refresh cookie before sending the user to /login.
        try {
          await refreshAccessToken();
          if (active) setIsAuthenticated(true);
        } catch {
          localStorage.removeItem("authToken");
          if (active) router.replace(loginTarget);
        }
      };

      resolve();
      return () => {
        active = false;
      };
    }, [router]);

    if (isAuthenticated === null) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthWrapper.displayName = `checkAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return AuthWrapper;
};

export default checkAuth;

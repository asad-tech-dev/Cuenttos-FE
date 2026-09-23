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

const resolveIsAdmin = (token: string | null): boolean => {
  if (localStorage.getItem("isAdmin") === "true") return true;
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Boolean(payload.isAdmin);
  } catch {
    return false;
  }
};

const checkAdminAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
) => {
  const AdminAuthWrapper = (props: P) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      let active = true;

      const resolve = async () => {
        let token = localStorage.getItem("authToken");

        // Ensure we have a valid access token, silently refreshing via the
        // httpOnly cookie if the current one is missing/expired.
        if (!isTokenValid(token)) {
          try {
            token = await refreshAccessToken();
          } catch {
            localStorage.removeItem("authToken");
            localStorage.removeItem("isAdmin");
            if (active) router.replace("/login");
            return;
          }
        }

        if (!resolveIsAdmin(token)) {
          if (active) router.replace("/share");
          return;
        }

        if (active) setIsAuthorized(true);
      };

      resolve();
      return () => {
        active = false;
      };
    }, [router]);

    if (isAuthorized === null) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AdminAuthWrapper.displayName = `checkAdminAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AdminAuthWrapper;
};

export default checkAdminAuth;

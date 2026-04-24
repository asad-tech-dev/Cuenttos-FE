"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";

const checkAdminAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
) => {
  const AdminAuthWrapper = (props: P) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("isAdmin");
          router.replace("/login");
          return;
        }

        const isAdmin =
          localStorage.getItem("isAdmin") === "true" ||
          Boolean(payload.isAdmin);

        if (!isAdmin) {
          router.replace("/library");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("authToken");
        router.replace("/login");
      }
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

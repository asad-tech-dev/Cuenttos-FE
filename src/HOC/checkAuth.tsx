"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";

const checkAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthWrapper = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        router.replace("/login");
        return}
        try {
          const payloadBase64 = token.split(".")[1];
          const decodedPayload = atob(payloadBase64);
          const payload = JSON.parse(decodedPayload);
          const isExpired = payload.exp * 1000 < Date.now();
          if (isExpired) {
            localStorage.removeItem("authToken");
            router.replace("/login");
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          localStorage.removeItem("authToken");
          router.replace("/login");
        }
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

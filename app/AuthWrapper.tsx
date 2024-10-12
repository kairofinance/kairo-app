"use client";

import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";

const AuthWrapper = React.memo(({ children }: { children: ReactNode }) => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const pathname = usePathname();

  const checkAuthentication = useCallback(async () => {
    if (isConnected && address) {
      const response = await fetch(`/api/auth?address=${address}`);
      const data = await response.json();
      if (!data.isAuthenticated && pathname !== "/") {
        router.push("/");
      }
    } else if (pathname !== "/") {
      router.push("/");
    }
  }, [address, router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  return <>{children}</>;
});

AuthWrapper.displayName = "AuthWrapper";

export default AuthWrapper;

"use client";

import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { useAccount, useSignMessage, useConnect } from "wagmi";
import { usePathname } from "next/navigation";

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
);

const AuthWrapper = React.memo(({ children }: { children: ReactNode }) => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkAuthentication = useCallback(async () => {
    if (pathname === "/" || !isConnected || !address) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`/api/auth?address=${address}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Authentication check failed");
      }
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, pathname]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleAuthentication = async () => {
    setIsLoading(true);
    try {
      if (!isConnected) {
        await connect({ connector: connectors[0] });
      }

      if (address) {
        const message = `Sign this message to authenticate: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, signature, message }),
        });

        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem("authToken", token);
          setIsAuthenticated(true);
        } else {
          throw new Error("Authentication failed");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  if (pathname === "/" || isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
      <p className="mb-4">
        Please connect your wallet and sign the message to access this page.
      </p>
      <button
        onClick={handleAuthentication}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        {isConnected ? "Sign Authentication Message" : "Connect Wallet"}
      </button>
    </div>
  );
});

AuthWrapper.displayName = "AuthWrapper";

export default AuthWrapper;

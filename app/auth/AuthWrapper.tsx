"use client";

import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { z } from "zod";
import Spinner from "@/components/Spinner";
import debounce from "lodash/debounce";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const AuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAppKitAccount();
  const appKit = useAppKit();
  const pathname = usePathname();
  const { signMessageAsync } = useSignMessage();
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [isMounted, setIsMounted] = useState(false);

  // Check authentication status
  const checkAuthentication = useCallback(async () => {
    if (pathname === "/") {
      setAuthState("authenticated");
      return;
    }

    if (!isConnected || !address) {
      setAuthState("unauthenticated");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAuthState("unauthenticated");
        return;
      }

      const response = await fetch(
        `/api/auth?address=${encodeURIComponent(address)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Authentication check failed");
      }

      const data = await response.json();
      setAuthState(data.isAuthenticated ? "authenticated" : "unauthenticated");
    } catch (error) {
      console.error("Authentication check error:", error);
      localStorage.removeItem("authToken");
      setAuthState("unauthenticated");
    }
  }, [address, isConnected, pathname]);

  // Initial mount and auth check
  useEffect(() => {
    setIsMounted(true);
    checkAuthentication();
  }, [checkAuthentication]);

  // Handle authentication
  const handleAuthentication = useCallback(async () => {
    try {
      if (!isConnected) {
        await appKit.open({ view: "Connect" });
        return;
      }

      if (address) {
        const message = `Sign this message to authenticate: ${Date.now()}`;
        const signature = await signMessageAsync({ message });

        const authSchema = z.object({
          address: z.string(),
          signature: z.string(),
          message: z.string(),
        });

        const validatedData = authSchema.parse({ address, signature, message });

        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        });

        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem("authToken", token);
          setAuthState("authenticated");
        } else {
          throw new Error("Authentication failed");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      localStorage.removeItem("authToken");
      setAuthState("unauthenticated");
    }
  }, [address, isConnected, appKit, signMessageAsync]);

  // Show nothing until mounted
  if (!isMounted) {
    return null;
  }

  // Show loading state
  if (authState === "loading") {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeVariant}
        className="flex justify-center items-center min-h-screen"
      >
        <Spinner />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {authState === "authenticated" ? (
        <motion.div
          key="content"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariant}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="auth"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariant}
          className="flex flex-col justify-center items-center min-h-screen"
        >
          <h1 className="text-2xl font-bold text-kairo-white mb-4">
            Authentication Required
          </h1>
          <p className="mb-4 text-zinc-300">
            {isConnected
              ? "Please sign the message to access this page."
              : "Please connect your wallet to access this page."}
          </p>
          <button
            onClick={handleAuthentication}
            className="relative flex items-center font-semibold gap-x-4 px-4 py-2 text-sm leading-6 hover:bg-orange-600-a20/50 text-orange-600 bg-orange-600-a20 bg-opacity-30 rounded-full"
          >
            {isConnected ? "Sign Authentication Message" : "Connect Wallet"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AuthWrapper.displayName = "AuthWrapper";

export default AuthWrapper;

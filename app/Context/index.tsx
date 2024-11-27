"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  cookieToInitialState,
  Config,
  createStorage,
  cookieStorage,
  http,
} from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "viem/chains";
import { SessionProvider } from "next-auth/react";
import { getCsrfToken, signIn, signOut, getSession } from "next-auth/react";
import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
  SIWESession,
} from "@reown/appkit-siwe";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";
import { Chain } from "viem";
import { defineChain } from "viem";
import { SafeAdapter } from "../adapters/SafeAdapter";
import { SafeAppProvider } from "@safe-global/safe-apps-provider";
import Safe from "@safe-global/safe-apps-sdk";
import { TeamProvider } from "@/contexts/TeamContext";

// Configure WalletConnect metadata
const metadata = {
  name: "Kairo",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions.",
  url: "https://kairo.finance",
  icons: ["../favicon.ico"],
};

// Configure transport with proper settings
const transport = http(
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org",
  {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
  }
);

// Configure WalletConnect
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;
if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create WagmiAdapter with proper configuration
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [sepolia],
});

// Create AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter as any],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: true,
  },
});

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize Safe SDK
const safe = new Safe();
const safeAdapter = new SafeAdapter();

export default function Context({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  React.useEffect(() => {
    // Initialize Safe when the app loads
    const initSafe = async () => {
      try {
        const safeInfo = await safe.safe.getInfo();
        if (safeInfo) {
          const provider = new SafeAppProvider(safeInfo, safe);
          await safeAdapter.init(provider, safeInfo.safeAddress);
        }
      } catch (err) {
        console.log("Not running as a Safe App");
      }
    };

    initSafe();
  }, []);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <TeamProvider>{children}</TeamProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}

export { safe, safeAdapter };

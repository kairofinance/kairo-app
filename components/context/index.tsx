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
import { SafeAppProvider } from "@safe-global/safe-apps-provider";
import Safe from "@safe-global/safe-apps-sdk";
import { TeamProvider } from "@/components/context/TeamContext";
import { siweConfig } from "@/config/siwe";

// Configure WalletConnect metadata
const metadata = {
  name: "Kairo",
  description:
    "Secure Web3 billing with real-time insights and seamless transactions.",
  url: "https://kairo.finance",
  icons: ["../favicon.ico"],
};

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [sepolia];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
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
  siweConfig: siweConfig, // pass your siweConfig
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

export function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

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

export { safe };

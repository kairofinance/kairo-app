"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import {
  createConfig,
  Config,
  WagmiProvider,
  createStorage,
  cookieStorage,
  cookieToInitialState,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

// Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata: {
    name: "Kairo",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions.",
    url: "https://kairo.finance",
    icons: ["../favicon.ico"],
  },
});

// Create a new QueryClient instance
const queryClient = new QueryClient();

const config = wagmiAdapter.wagmiConfig;

export default function ClientProviders({
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
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

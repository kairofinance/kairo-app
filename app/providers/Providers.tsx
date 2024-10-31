"use client";

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WagmiProvider,
  cookieToInitialState,
  Config,
  createStorage,
  cookieStorage,
} from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [sepolia],
});

// Create the AppKit instance
const modal = createAppKit({
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
  features: {
    analytics: true,
  },
});

// Create a new QueryClient instance
const queryClient = new QueryClient();

export default function Providers({
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

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

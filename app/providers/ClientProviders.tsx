"use client";

import React from "react";
import dynamic from "next/dynamic";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { createConfig, Config, WagmiProvider } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create Wagmi config
const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Kairo",
    walletConnectProjectId: projectId,
    chains: [mainnet, sepolia],
  })
);

// Set up the Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, sepolia],
});

// Create the AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: mainnet,
  metadata: {
    name: "Kairo",
    description:
      "Secure Web3 billing with real-time insights and seamless transactions.",
    url: "https://kairo.com", // Replace with your actual domain
    icons: ["https://kairo.com/icon.png"], // Replace with your actual icon URL
  },
});

// Create a new QueryClient instance
const queryClient = new QueryClient();

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}

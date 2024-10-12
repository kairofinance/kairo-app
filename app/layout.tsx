"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, sepolia } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";

const inter = Inter({ subsets: ["latin"] });

// Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Create Wagmi config
const config = createConfig(
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

// Set up queryClient
const queryClient = new QueryClient();

/**
 * RootLayout component
 *
 * Wraps the application with global providers and layout components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement} Wrapped application layout
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Kairo</title>
        <meta
          name="description"
          content="Secure Web3 billing with real-time insights and seamless transactions."
        />
      </head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <body className={inter.className}>
            <div className="min-h-[91vh]">
              <Navbar />
              {children}
            </div>
            <Footer />
          </body>
        </QueryClientProvider>
      </WagmiProvider>
    </html>
  );
}

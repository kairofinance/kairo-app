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

// Define a properly typed Sepolia chain configuration
const sepoliaChain = defineChain({
  id: 11155111,
  name: "Sepolia",
  network: "sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia Ether",
    symbol: "SEP",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
    },
    public: {
      http: ["https://rpc.sepolia.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  },
  contracts: {},
  testnet: true,
});

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: [sepolia.id],
    statement: "Please sign with your account",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) {
      throw new Error("Failed to get nonce!");
    }
    return nonce;
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) {
      throw new Error("Failed to get session!");
    }
    const { address, chainId } = session as unknown as SIWESession;
    return { address, chainId };
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: false,
        signature,
        callbackUrl: "/protected",
      });
      return Boolean(success?.ok);
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false,
      });
      return true;
    } catch (error) {
      return false;
    }
  },
});

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up the Wagmi Adapter with proper chain configuration
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [sepoliaChain as any],
});

// Create the AppKit instance with proper typing
const appKit = createAppKit({
  adapters: [wagmiAdapter as any],
  projectId,
  networks: [sepoliaChain as any],
  defaultNetwork: sepoliaChain as any,
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
        // Check if we're running inside a Safe iframe
        const safeInfo = await safe.safe.getInfo();

        if (safeInfo) {
          // We're inside a Safe App
          const provider = new SafeAppProvider(safeInfo, safe);
          await safeAdapter.init(provider, safeInfo.safeAddress);
        }
      } catch (err) {
        // Not running as a Safe App, continue with normal wallet connection
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
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}

// Export the Safe instances for use in other components
export { safe, safeAdapter };

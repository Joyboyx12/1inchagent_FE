"use client";

// Particle imports
import { ConnectKitProvider, createConfig } from "@particle-network/connectkit";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import { evmWalletConnectors } from "@particle-network/connectkit/evm";
import { EntryPosition, wallet } from "@particle-network/connectkit/wallet";

import {
  mainnet,
  polygon,
  bsc
} from "@particle-network/connectkit/chains"; // Chains are imported here
import { defineChain } from "@particle-network/connectkit/chains";

const bitlayer = defineChain({
  id: 200901,
  name: "Bitlayer",
  nativeCurrency: {
    decimals: 18,
    name: "Bitcoin",
    symbol: "BTC",
  },
  rpcUrls: {
    default: {
      http: ["https://www.bitlayer.org"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://www.bitlayer.org" },
  },
  testnet: true,
});

const config = createConfig({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_APP_ID!,

  appearance: {
    recommendedWallets: [
      { walletId: "metaMask", label: "Recommended" },
      { walletId: "coinbaseWallet", label: "popular" },
    ],
    language: "en-US",
    mode: "light", // dark or auto.
  },

  walletConnectors: [
    evmWalletConnectors({
      // Replace this with your app metadata.
      metadata: {
        name: "Connectkit Demo",
        icon:
          typeof window !== "undefined"
            ? `${window.location.origin}/favicon.ico`
            : "",
        description: "Particle Connectkit Next.js Scaffold.",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
      walletConnectProjectId: process.env
        .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    }),

    authWalletConnectors({
      authTypes: ["email", "google", "twitter", "github"], // Optional, restricts the types of social logins supported
    }),
  ],

  plugins: [
    wallet({
      visible: true,
      entryPosition: EntryPosition.BR, // Use BR (bottom right), BL (bottom left), TR (top right), TL (top left) to move the wallet entry position
    }),
  ],

  // List the chains you want to include
  chains: [
    mainnet,
    polygon,
    bsc
  ],
});

// Wrap your application with this exported component, or ConnectKitProvider directly.
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
  return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};

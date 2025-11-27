import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia, mainnet } from 'wagmi/chains';

// Configure Hardhat chain with localhost RPC
const hardhatLocal = {
  ...hardhat,
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Moonbob Money',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [hardhatLocal, sepolia, mainnet],
  ssr: true,
});

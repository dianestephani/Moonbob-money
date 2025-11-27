import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { config } from '@/lib/wagmi';
import { BalanceCard } from '@/components/BalanceCard';
import { StakingPanel } from '@/components/StakingPanel';
import { RewardsPanel } from '@/components/RewardsPanel';

function Web3App() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🌙</div>
              <div>
                <h1 className="text-2xl font-bold">Moonbob Money</h1>
                <p className="text-sm text-muted-foreground">Stake & Earn Rewards</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Balance */}
            <div className="lg:col-span-1">
              <BalanceCard />
            </div>

            {/* Middle Column - Staking */}
            <div className="lg:col-span-1">
              <StakingPanel />
            </div>

            {/* Right Column - Rewards */}
            <div className="lg:col-span-1">
              <RewardsPanel />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-8xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Connect your wallet to start staking MOONBOB tokens and earning rewards
            </p>
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Moonbob Money © 2025 - Built with wagmi & RainbowKit</p>
        </div>
      </footer>
    </main>
  );
}

export default function Web3Content() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Web3App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

import { useAccount, useReadContract } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MOONBOB_TOKEN_ADDRESS, MOONBOB_TOKEN_ABI, STAKING_ADDRESS, STAKING_ABI } from '@/lib/contracts';
import { formatTokenAmount } from '@/lib/utils';
import { Wallet, TrendingUp } from 'lucide-react';

export function BalanceCard() {
  const { address } = useAccount();

  const { data: walletBalance } = useReadContract({
    address: MOONBOB_TOKEN_ADDRESS,
    abi: MOONBOB_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: stakerInfo } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getStakerInfo',
    args: address ? [address] : undefined,
  });

  const stakedAmount = stakerInfo?.[0] ?? 0n;
  const earnedRewards = stakerInfo?.[1] ?? 0n;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Your Balances
        </CardTitle>
        <CardDescription>MOONBOB token balances and rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
            <p className="text-2xl font-bold">
              {walletBalance !== undefined ? formatTokenAmount(walletBalance) : '0'} MOONBOB
            </p>
          </div>
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Staked Balance</p>
            <p className="text-2xl font-bold">
              {formatTokenAmount(stakedAmount)} MOONBOB
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="flex justify-between items-center p-4 bg-accent rounded-lg border-2 border-primary/20">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Rewards</p>
            <p className="text-2xl font-bold text-primary">
              {formatTokenAmount(earnedRewards)} MOONBOB
            </p>
          </div>
          <div className="text-3xl">🎁</div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STAKING_ADDRESS, STAKING_ABI } from '@/lib/contracts';
import { formatTokenAmount } from '@/lib/utils';
import { Gift, Loader2, TrendingUp } from 'lucide-react';

export function RewardsPanel() {
  const { address } = useAccount();

  const { data: stakerInfo } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getStakerInfo',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 1000, // Refresh every second to show live rewards
    },
  });

  const { data: rewardPerSecond } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardPerSecond',
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
  });

  const { writeContract: claimWrite, data: claimHash } = useWriteContract();
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash });

  const stakedAmount = stakerInfo?.[0] ?? 0n;
  const earnedRewards = stakerInfo?.[1] ?? 0n;

  const handleClaim = async () => {
    try {
      claimWrite({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'claimRewards',
      });
    } catch (error) {
      console.error('Claiming failed:', error);
    }
  };

  // Calculate user's share of rewards per second
  const userRewardRate = totalStaked && totalStaked > 0n && stakedAmount > 0n
    ? (rewardPerSecond ?? 0n) * stakedAmount / totalStaked
    : 0n;

  const rewardsPerDay = userRewardRate * 86400n; // 24 hours in seconds
  const rewardsPerWeek = userRewardRate * 604800n; // 7 days in seconds

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Rewards
        </CardTitle>
        <CardDescription>Track and claim your staking rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Rewards */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
          <p className="text-sm font-medium text-muted-foreground mb-2">Claimable Rewards</p>
          <p className="text-4xl font-bold text-primary mb-4">
            {formatTokenAmount(earnedRewards)} MOONBOB
          </p>
          <Button
            onClick={handleClaim}
            disabled={earnedRewards === 0n || isClaiming}
            className="w-full"
            size="lg"
          >
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Claim Rewards
              </>
            )}
          </Button>
        </div>

        {/* Reward Rate Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Your Earnings Rate</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground">Per Day</p>
              <p className="text-lg font-semibold">
                {formatTokenAmount(rewardsPerDay)}
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground">Per Week</p>
              <p className="text-lg font-semibold">
                {formatTokenAmount(rewardsPerWeek)}
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Pool Rate:</span>
              <span className="font-medium">
                {rewardPerSecond ? formatTokenAmount(rewardPerSecond) : '0'} MOONBOB/sec
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

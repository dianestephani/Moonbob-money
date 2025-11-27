import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MOONBOB_TOKEN_ADDRESS, MOONBOB_TOKEN_ABI, STAKING_ADDRESS, STAKING_ABI } from '@/lib/contracts';
import { formatTokenAmount } from '@/lib/utils';
import { Lock, Unlock, Loader2 } from 'lucide-react';

export function StakingPanel() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

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

  const { writeContract: approveWrite, data: approveHash } = useWriteContract();
  const { writeContract: stakeWrite, data: stakeHash } = useWriteContract();
  const { writeContract: unstakeWrite, data: unstakeHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isStaking } = useWaitForTransactionReceipt({ hash: stakeHash });
  const { isLoading: isUnstaking } = useWaitForTransactionReceipt({ hash: unstakeHash });

  const handleApprove = async () => {
    if (!stakeAmount) return;
    try {
      approveWrite({
        address: MOONBOB_TOKEN_ADDRESS,
        abi: MOONBOB_TOKEN_ABI,
        functionName: 'approve',
        args: [STAKING_ADDRESS, parseEther(stakeAmount)],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      stakeWrite({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [parseEther(stakeAmount)],
      });
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    try {
      unstakeWrite({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [parseEther(unstakeAmount)],
      });
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const handleMaxStake = () => {
    if (walletBalance) {
      setStakeAmount(formatTokenAmount(walletBalance));
    }
  };

  const handleMaxUnstake = () => {
    setUnstakeAmount(formatTokenAmount(stakedAmount));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Stake & Unstake
        </CardTitle>
        <CardDescription>Manage your staked MOONBOB tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stake Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Stake Tokens</label>
            <button
              onClick={handleMaxStake}
              className="text-xs text-primary hover:underline"
            >
              Max: {walletBalance ? formatTokenAmount(walletBalance) : '0'} MOONBOB
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleApprove}
              disabled={!stakeAmount || isApproving}
              variant="outline"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving
                </>
              ) : (
                'Approve'
              )}
            </Button>
            <Button
              onClick={handleStake}
              disabled={!stakeAmount || isStaking}
            >
              {isStaking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Staking
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Stake
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          {/* Unstake Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Unstake Tokens</label>
              <button
                onClick={handleMaxUnstake}
                className="text-xs text-primary hover:underline"
              >
                Staked: {formatTokenAmount(stakedAmount)} MOONBOB
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleUnstake}
                disabled={!unstakeAmount || isUnstaking}
                variant="secondary"
              >
                {isUnstaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unstaking
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unstake
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

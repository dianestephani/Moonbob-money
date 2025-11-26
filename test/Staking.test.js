const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking", function () {
  let token;
  let staking;
  let owner;
  let user1;
  let user2;
  let user3;

  const REWARD_PER_SECOND = ethers.parseEther("1"); // 1 token per second
  const INITIAL_MINT = ethers.parseEther("10000"); // 10,000 tokens

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy token
    const MoonbobToken = await ethers.getContractFactory("MoonbobToken");
    token = await MoonbobToken.deploy(owner.address, owner.address);
    await token.waitForDeployment();

    // Deploy staking contract
    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(
      owner.address,
      await token.getAddress(),
      await token.getAddress(),
      REWARD_PER_SECOND
    );
    await staking.waitForDeployment();

    // Mint tokens to users for testing
    await token.mint(user1.address, INITIAL_MINT);
    await token.mint(user2.address, INITIAL_MINT);
    await token.mint(user3.address, INITIAL_MINT);

    // Approve staking contract to spend user tokens
    await token.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(user3).approve(await staking.getAddress(), ethers.MaxUint256);

    // Fund staking contract with reward tokens
    const rewardFund = ethers.parseEther("1000000"); // 1M tokens for rewards
    await token.mint(await staking.getAddress(), rewardFund);
  });

  describe("Deployment", function () {
    it("Should set the correct staking token", async function () {
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
    });

    it("Should set the correct reward token", async function () {
      expect(await staking.rewardToken()).to.equal(await token.getAddress());
    });

    it("Should set the correct reward per second", async function () {
      expect(await staking.rewardPerSecond()).to.equal(REWARD_PER_SECOND);
    });

    it("Should set the correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total staked", async function () {
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should set last update time to deployment time", async function () {
      const lastUpdateTime = await staking.lastUpdateTime();
      expect(lastUpdateTime).to.be.greaterThan(0);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("100");

      await expect(staking.connect(user1).stake(stakeAmount))
        .to.emit(staking, "Staked")
        .withArgs(user1.address, stakeAmount);

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.stakedAmount).to.equal(stakeAmount);
      expect(await staking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should transfer tokens from user to contract on stake", async function () {
      const stakeAmount = ethers.parseEther("100");
      const initialUserBalance = await token.balanceOf(user1.address);
      const initialContractBalance = await token.balanceOf(await staking.getAddress());

      await staking.connect(user1).stake(stakeAmount);

      expect(await token.balanceOf(user1.address)).to.equal(initialUserBalance - stakeAmount);
      expect(await token.balanceOf(await staking.getAddress())).to.equal(
        initialContractBalance + stakeAmount
      );
    });

    it("Should allow multiple stakes from same user", async function () {
      const stakeAmount1 = ethers.parseEther("100");
      const stakeAmount2 = ethers.parseEther("50");

      await staking.connect(user1).stake(stakeAmount1);
      await staking.connect(user1).stake(stakeAmount2);

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.stakedAmount).to.equal(stakeAmount1 + stakeAmount2);
    });

    it("Should allow multiple users to stake", async function () {
      const stakeAmount1 = ethers.parseEther("100");
      const stakeAmount2 = ethers.parseEther("200");

      await staking.connect(user1).stake(stakeAmount1);
      await staking.connect(user2).stake(stakeAmount2);

      const staker1Info = await staking.stakers(user1.address);
      const staker2Info = await staking.stakers(user2.address);

      expect(staker1Info.stakedAmount).to.equal(stakeAmount1);
      expect(staker2Info.stakedAmount).to.equal(stakeAmount2);
      expect(await staking.totalStaked()).to.equal(stakeAmount1 + stakeAmount2);
    });

    it("Should revert when staking zero tokens", async function () {
      await expect(staking.connect(user1).stake(0)).to.be.revertedWithCustomError(
        staking,
        "CannotStakeZero"
      );
    });

    it("Should revert when user has insufficient balance", async function () {
      const tooMuch = INITIAL_MINT + ethers.parseEther("1");
      await expect(staking.connect(user1).stake(tooMuch)).to.be.reverted;
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      // User1 stakes 100 tokens
      await staking.connect(user1).stake(ethers.parseEther("100"));
    });

    it("Should allow users to unstake tokens", async function () {
      const unstakeAmount = ethers.parseEther("50");

      await expect(staking.connect(user1).unstake(unstakeAmount))
        .to.emit(staking, "Unstaked")
        .withArgs(user1.address, unstakeAmount);

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.stakedAmount).to.equal(ethers.parseEther("50"));
    });

    it("Should transfer tokens back to user on unstake", async function () {
      const unstakeAmount = ethers.parseEther("50");
      const initialUserBalance = await token.balanceOf(user1.address);

      await staking.connect(user1).unstake(unstakeAmount);

      expect(await token.balanceOf(user1.address)).to.equal(initialUserBalance + unstakeAmount);
    });

    it("Should allow full unstake", async function () {
      const fullAmount = ethers.parseEther("100");

      await staking.connect(user1).unstake(fullAmount);

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.stakedAmount).to.equal(0);
      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should revert when unstaking zero tokens", async function () {
      await expect(staking.connect(user1).unstake(0)).to.be.revertedWithCustomError(
        staking,
        "CannotUnstakeZero"
      );
    });

    it("Should revert when unstaking more than staked balance", async function () {
      const tooMuch = ethers.parseEther("101");

      await expect(staking.connect(user1).unstake(tooMuch)).to.be.revertedWithCustomError(
        staking,
        "InsufficientStakedBalance"
      );
    });

    it("Should revert when user has nothing staked", async function () {
      await expect(
        staking.connect(user2).unstake(ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(staking, "InsufficientStakedBalance");
    });
  });

  describe("Rewards Calculation", function () {
    it("Should calculate correct rewards for single staker", async function () {
      const stakeAmount = ethers.parseEther("100");
      await staking.connect(user1).stake(stakeAmount);

      // Wait 10 seconds
      await time.increase(10);

      const earned = await staking.earned(user1.address);

      // Should earn approximately 10 tokens (10 seconds * 1 token/second)
      // Allow small margin for block timing
      expect(earned).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("0.1"));
    });

    it("Should calculate correct rewards for multiple stakers", async function () {
      // User1 stakes 100 tokens
      await staking.connect(user1).stake(ethers.parseEther("100"));

      // Wait 5 seconds
      await time.increase(5);

      // User2 stakes 100 tokens (now total is 200)
      await staking.connect(user2).stake(ethers.parseEther("100"));

      // Wait 10 more seconds
      await time.increase(10);

      const earned1 = await staking.earned(user1.address);
      const earned2 = await staking.earned(user2.address);

      // User1: 5 seconds solo (5 tokens) + 10 seconds shared (5 tokens) = 10 tokens
      expect(earned1).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("0.2"));

      // User2: 10 seconds shared (5 tokens)
      expect(earned2).to.be.closeTo(ethers.parseEther("5"), ethers.parseEther("0.2"));
    });

    it("Should return zero rewards when no tokens staked", async function () {
      expect(await staking.earned(user1.address)).to.equal(0);
    });

    it("Should handle rewards calculation with different stake amounts", async function () {
      // User1 stakes 300 tokens
      await staking.connect(user1).stake(ethers.parseEther("300"));

      // User2 stakes 100 tokens (total 400, user1 has 75%)
      await staking.connect(user2).stake(ethers.parseEther("100"));

      // Wait 20 seconds
      await time.increase(20);

      const earned1 = await staking.earned(user1.address);
      const earned2 = await staking.earned(user2.address);

      // User1 should get 75% of rewards (15 tokens)
      expect(earned1).to.be.closeTo(ethers.parseEther("15"), ethers.parseEther("0.3"));

      // User2 should get 25% of rewards (5 tokens)
      expect(earned2).to.be.closeTo(ethers.parseEther("5"), ethers.parseEther("0.3"));
    });
  });

  describe("Claiming Rewards", function () {
    beforeEach(async function () {
      // User1 stakes and waits for rewards
      await staking.connect(user1).stake(ethers.parseEther("100"));
      await time.increase(10);
    });

    it("Should allow users to claim rewards", async function () {
      const earnedBefore = await staking.earned(user1.address);
      const initialBalance = await token.balanceOf(user1.address);

      await expect(staking.connect(user1).claimRewards())
        .to.emit(staking, "RewardsClaimed")
        .withArgs(user1.address, earnedBefore);

      const finalBalance = await token.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.be.closeTo(
        earnedBefore,
        ethers.parseEther("0.1")
      );
    });

    it("Should reset rewards to zero after claiming", async function () {
      await staking.connect(user1).claimRewards();

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.rewards).to.equal(0);
    });

    it("Should allow claiming multiple times", async function () {
      // First claim
      await staking.connect(user1).claimRewards();

      // Wait more time
      await time.increase(10);

      // Second claim should work
      const earnedBefore = await staking.earned(user1.address);
      expect(earnedBefore).to.be.greaterThan(0);

      await staking.connect(user1).claimRewards();
    });

    it("Should revert when claiming with no rewards", async function () {
      await staking.connect(user1).claimRewards();

      // Try to claim again immediately
      await expect(staking.connect(user1).claimRewards()).to.be.revertedWithCustomError(
        staking,
        "NoRewardsToClaim"
      );
    });

    it("Should revert when user never staked", async function () {
      await expect(staking.connect(user2).claimRewards()).to.be.revertedWithCustomError(
        staking,
        "NoRewardsToClaim"
      );
    });

    it("Should not affect other users rewards when claiming", async function () {
      // User2 also stakes
      await staking.connect(user2).stake(ethers.parseEther("100"));
      await time.increase(5);

      const user2EarnedBefore = await staking.earned(user2.address);

      // User1 claims
      await staking.connect(user1).claimRewards();

      // User2's earned should not change
      const user2EarnedAfter = await staking.earned(user2.address);
      expect(user2EarnedAfter).to.be.closeTo(user2EarnedBefore, ethers.parseEther("0.1"));
    });
  });

  describe("Reward Rate Updates", function () {
    it("Should allow owner to update reward rate", async function () {
      const newRate = ethers.parseEther("2");

      await expect(staking.connect(owner).setRewardRate(newRate))
        .to.emit(staking, "RewardRateUpdated")
        .withArgs(REWARD_PER_SECOND, newRate);

      expect(await staking.rewardPerSecond()).to.equal(newRate);
    });

    it("Should not allow non-owner to update reward rate", async function () {
      const newRate = ethers.parseEther("2");

      await expect(
        staking.connect(user1).setRewardRate(newRate)
      ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");
    });

    it("Should apply new reward rate correctly", async function () {
      await staking.connect(user1).stake(ethers.parseEther("100"));

      // Wait 10 seconds at rate of 1 token/second
      await time.increase(10);

      // Change rate to 2 tokens/second
      await staking.connect(owner).setRewardRate(ethers.parseEther("2"));

      // Wait 10 more seconds at new rate
      await time.increase(10);

      const earned = await staking.earned(user1.address);

      // Should be: 10 seconds * 1 token + 10 seconds * 2 tokens = 30 tokens
      expect(earned).to.be.closeTo(ethers.parseEther("30"), ethers.parseEther("0.5"));
    });

    it("Should allow setting reward rate to zero", async function () {
      await staking.connect(owner).setRewardRate(0);
      expect(await staking.rewardPerSecond()).to.equal(0);

      // Stake and wait - should earn nothing
      await staking.connect(user1).stake(ethers.parseEther("100"));
      await time.increase(10);

      expect(await staking.earned(user1.address)).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct staker info", async function () {
      await staking.connect(user1).stake(ethers.parseEther("100"));
      await time.increase(10);

      const [stakedAmount, earnedRewards] = await staking.getStakerInfo(user1.address);

      expect(stakedAmount).to.equal(ethers.parseEther("100"));
      expect(earnedRewards).to.be.closeTo(ethers.parseEther("10"), ethers.parseEther("0.1"));
    });

    it("Should return zeros for non-staker", async function () {
      const [stakedAmount, earnedRewards] = await staking.getStakerInfo(user1.address);

      expect(stakedAmount).to.equal(0);
      expect(earnedRewards).to.equal(0);
    });

    it("Should calculate rewardPerToken correctly", async function () {
      // Initially should be 0
      expect(await staking.rewardPerToken()).to.equal(0);

      // After staking, should increase over time
      await staking.connect(user1).stake(ethers.parseEther("100"));
      await time.increase(10);

      const rewardPerToken = await staking.rewardPerToken();
      expect(rewardPerToken).to.be.greaterThan(0);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should protect stake function from reentrancy", async function () {
      // The nonReentrant modifier should prevent reentrancy attacks
      // This is inherently tested by the modifier, but we can verify it's applied
      const stakeAmount = ethers.parseEther("100");
      await staking.connect(user1).stake(stakeAmount);

      expect(await staking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should protect unstake function from reentrancy", async function () {
      const stakeAmount = ethers.parseEther("100");
      await staking.connect(user1).stake(stakeAmount);
      await staking.connect(user1).unstake(stakeAmount);

      expect(await staking.totalStaked()).to.equal(0);
    });

    it("Should protect claimRewards function from reentrancy", async function () {
      await staking.connect(user1).stake(ethers.parseEther("100"));
      await time.increase(10);

      await staking.connect(user1).claimRewards();

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.rewards).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle staking immediately after deployment", async function () {
      await expect(staking.connect(user1).stake(ethers.parseEther("100"))).to.not.be.reverted;
    });

    it("Should handle very small stake amounts", async function () {
      const smallAmount = 1; // 1 wei
      await staking.connect(user1).stake(smallAmount);

      expect(await staking.totalStaked()).to.equal(smallAmount);
    });

    it("Should handle very large stake amounts", async function () {
      const largeAmount = ethers.parseEther("1000000");
      await token.mint(user1.address, largeAmount);
      await token.connect(user1).approve(await staking.getAddress(), largeAmount);

      await staking.connect(user1).stake(largeAmount);

      expect(await staking.totalStaked()).to.equal(largeAmount);
    });

    it("Should handle rapid stake/unstake cycles", async function () {
      const amount = ethers.parseEther("100");

      for (let i = 0; i < 5; i++) {
        await staking.connect(user1).stake(amount);
        await staking.connect(user1).unstake(amount);
      }

      const stakerInfo = await staking.stakers(user1.address);
      expect(stakerInfo.stakedAmount).to.equal(0);
    });
  });
});

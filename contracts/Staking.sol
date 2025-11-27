// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IMintableToken
 * @notice Interface for tokens that support minting
 */
interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title Staking
 * @author Moonbob Money Team
 * @notice A staking contract that allows users to stake tokens and earn rewards over time
 * @dev Implements a reward-per-second model with reentrancy protection and mints rewards
 */
contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The token being staked
    IERC20 public immutable stakingToken;

    /// @notice The token used for rewards (can be same as staking token)
    IMintableToken public immutable rewardToken;

    /// @notice Number of reward tokens distributed per second to all stakers
    uint256 public rewardPerSecond;

    /// @notice Timestamp of the last reward calculation update
    uint256 public lastUpdateTime;

    /// @notice Accumulated rewards per token staked (scaled by 1e18 for precision)
    uint256 public rewardPerTokenStored;

    /// @notice Total amount of tokens currently staked in the contract
    uint256 public totalStaked;

    /**
     * @notice Information about each staker
     * @param stakedAmount The amount of tokens the user has staked
     * @param rewardPerTokenPaid The rewardPerTokenStored value when user last interacted
     * @param rewards The amount of rewards earned but not yet claimed
     */
    struct StakerInfo {
        uint256 stakedAmount;
        uint256 rewardPerTokenPaid;
        uint256 rewards;
    }

    /// @notice Mapping from user address to their staking information
    mapping(address => StakerInfo) public stakers;

    /**
     * @notice Emitted when a user stakes tokens
     * @param user The address of the user who staked
     * @param amount The amount of tokens staked
     */
    event Staked(address indexed user, uint256 amount);

    /**
     * @notice Emitted when a user unstakes tokens
     * @param user The address of the user who unstaked
     * @param amount The amount of tokens unstaked
     */
    event Unstaked(address indexed user, uint256 amount);

    /**
     * @notice Emitted when a user claims their rewards
     * @param user The address of the user who claimed
     * @param amount The amount of rewards claimed
     */
    event RewardsClaimed(address indexed user, uint256 amount);

    /**
     * @notice Emitted when the reward rate is updated
     * @param oldRate The previous reward per second
     * @param newRate The new reward per second
     */
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    /**
     * @notice Thrown when attempting to stake zero tokens
     */
    error CannotStakeZero();

    /**
     * @notice Thrown when attempting to unstake zero tokens
     */
    error CannotUnstakeZero();

    /**
     * @notice Thrown when attempting to unstake more than staked balance
     */
    error InsufficientStakedBalance();

    /**
     * @notice Thrown when there are no rewards to claim
     */
    error NoRewardsToClaim();

    /**
     * @notice Initializes the staking contract
     * @param initialOwner The address that will own the contract
     * @param stakingTokenAddress The address of the token to be staked
     * @param rewardTokenAddress The address of the token used for rewards
     * @param initialRewardPerSecond The initial reward rate per second
     */
    constructor(
        address initialOwner,
        address stakingTokenAddress,
        address rewardTokenAddress,
        uint256 initialRewardPerSecond
    ) Ownable(initialOwner) {
        stakingToken = IERC20(stakingTokenAddress);
        rewardToken = IMintableToken(rewardTokenAddress);
        rewardPerSecond = initialRewardPerSecond;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @notice Calculates the current reward per token value
     * @dev This accounts for time passed and total staked amount
     * @return The current reward per token (scaled by 1e18)
     */
    function rewardPerToken() public view returns (uint256) {
        // If no tokens are staked, return the stored value
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }

        // Calculate time elapsed since last update
        uint256 timeElapsed = block.timestamp - lastUpdateTime;

        // Calculate additional rewards accumulated per token
        // Formula: (rewardPerSecond * timeElapsed * 1e18) / totalStaked
        uint256 additionalRewardPerToken = (rewardPerSecond * timeElapsed * 1e18) / totalStaked;

        // Return stored value plus new rewards
        return rewardPerTokenStored + additionalRewardPerToken;
    }

    /**
     * @notice Calculates the total rewards earned by a user
     * @param account The address of the user
     * @return The total amount of rewards earned (including already accumulated)
     */
    function earned(address account) public view returns (uint256) {
        StakerInfo memory staker = stakers[account];

        // Calculate rewards based on:
        // - Amount staked by user
        // - Difference between current rewardPerToken and what user last saw
        // Formula: (stakedAmount * (rewardPerToken - rewardPerTokenPaid)) / 1e18 + stored rewards
        uint256 newRewards = (staker.stakedAmount * (rewardPerToken() - staker.rewardPerTokenPaid)) / 1e18;

        return staker.rewards + newRewards;
    }

    /**
     * @notice Stakes tokens into the contract
     * @dev Updates rewards before modifying staked amount
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        // Validate amount
        if (amount == 0) {
            revert CannotStakeZero();
        }

        // Update state
        stakers[msg.sender].stakedAmount += amount;
        totalStaked += amount;

        // Transfer tokens from user to contract
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstakes tokens from the contract
     * @dev Updates rewards before modifying staked amount
     * @param amount The amount of tokens to unstake
     */
    function unstake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        // Validate amount
        if (amount == 0) {
            revert CannotUnstakeZero();
        }

        StakerInfo storage staker = stakers[msg.sender];

        // Check if user has enough staked
        if (staker.stakedAmount < amount) {
            revert InsufficientStakedBalance();
        }

        // Update state
        staker.stakedAmount -= amount;
        totalStaked -= amount;

        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Claims all pending rewards
     * @dev Updates rewards before processing claim, mints new tokens as rewards
     */
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        StakerInfo storage staker = stakers[msg.sender];
        uint256 reward = staker.rewards;

        // Check if there are rewards to claim
        if (reward == 0) {
            revert NoRewardsToClaim();
        }

        // Reset rewards to zero
        staker.rewards = 0;

        // Mint rewards to user
        rewardToken.mint(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @notice Updates the reward rate
     * @dev Only callable by contract owner
     * @param newRewardPerSecond The new reward rate per second
     */
    function setRewardRate(uint256 newRewardPerSecond) external onlyOwner updateReward(address(0)) {
        uint256 oldRate = rewardPerSecond;
        rewardPerSecond = newRewardPerSecond;

        emit RewardRateUpdated(oldRate, newRewardPerSecond);
    }

    /**
     * @notice Returns the staking information for a user
     * @param account The address of the user
     * @return stakedAmount The amount of tokens staked by the user
     * @return earnedRewards The total rewards earned by the user
     */
    function getStakerInfo(address account) external view returns (uint256 stakedAmount, uint256 earnedRewards) {
        StakerInfo memory staker = stakers[account];
        stakedAmount = staker.stakedAmount;
        earnedRewards = earned(account);
    }

    /**
     * @notice Modifier to update reward calculations before state changes
     * @dev Updates the global reward per token and user-specific rewards
     * @param account The address of the user (address(0) to skip user update)
     */
    modifier updateReward(address account) {
        // Update global reward per token
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        // Update user-specific rewards if account is provided
        if (account != address(0)) {
            StakerInfo storage staker = stakers[account];

            // Calculate and store earned rewards up to this point
            staker.rewards = earned(account);

            // Update the user's rewardPerTokenPaid to current value
            staker.rewardPerTokenPaid = rewardPerTokenStored;
        }

        _;
    }
}

1const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MoonbobToken
  console.log("\nDeploying MoonbobToken...");
  const MoonbobToken = await hre.ethers.getContractFactory("MoonbobToken");

  // Set deployer as both owner and initial minter
  const token = await MoonbobToken.deploy(deployer.address, deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("MoonbobToken deployed to:", tokenAddress);
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Token decimals:", await token.decimals());
  console.log("Owner:", await token.owner());
  console.log("Minter:", await token.minter());

  // Deploy Staking Contract
  console.log("\nDeploying Staking Contract...");
  const Staking = await hre.ethers.getContractFactory("Staking");

  // Configure staking parameters
  // Reward rate: 1 token per second (1e18 wei per second)
  const rewardPerSecond = hre.ethers.parseEther("1");

  // Deploy staking contract (using same token for staking and rewards)
  const staking = await Staking.deploy(
    deployer.address,      // owner
    tokenAddress,          // staking token
    tokenAddress,          // reward token (same as staking)
    rewardPerSecond        // reward per second
  );
  await staking.waitForDeployment();

  const stakingAddress = await staking.getAddress();
  console.log("Staking contract deployed to:", stakingAddress);
  console.log("Staking token:", await staking.stakingToken());
  console.log("Reward token:", await staking.rewardToken());
  console.log("Reward per second:", hre.ethers.formatEther(await staking.rewardPerSecond()), "tokens/second");
  console.log("Owner:", await staking.owner());

  // Set staking contract as minter so it can mint rewards
  console.log("\nSetting staking contract as minter...");
  const setMinterTx = await token.setMinter(stakingAddress);
  await setMinterTx.wait();
  console.log("✓ Staking contract is now the minter");
  console.log("✓ Staking contract can now mint reward tokens");

  // Verify the setup
  const currentMinter = await token.minter();
  if (currentMinter !== stakingAddress) {
    throw new Error("Minter was not set correctly!");
  }

  // Save deployment info
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:              ", hre.network.name);
  console.log("Deployer:             ", deployer.address);
  console.log("-".repeat(60));
  console.log("MoonbobToken:         ", tokenAddress);
  console.log("  - Name:             ", await token.name());
  console.log("  - Symbol:           ", await token.symbol());
  console.log("  - Owner:            ", await token.owner());
  console.log("  - Minter:           ", await token.minter());
  console.log("-".repeat(60));
  console.log("Staking Contract:     ", stakingAddress);
  console.log("  - Staking Token:    ", await staking.stakingToken());
  console.log("  - Reward Token:     ", await staking.rewardToken());
  console.log("  - Reward Rate:      ", hre.ethers.formatEther(await staking.rewardPerSecond()), "tokens/second");
  console.log("  - Owner:            ", await staking.owner());
  console.log("=".repeat(60));
  console.log("\n✓ Deployment complete!");
  console.log("✓ Staking contract can mint rewards directly");
  console.log("✓ No need to pre-fund the staking contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

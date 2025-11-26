const hre = require("hardhat");

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
  await token.setMinter(stakingAddress);
  console.log("Staking contract is now the minter");

  // Save deployment info
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Network:", hre.network.name);
  console.log("MoonbobToken:", tokenAddress);
  console.log("Staking Contract:", stakingAddress);
  console.log("Deployer/Owner:", deployer.address);
  console.log("Minter:", stakingAddress);
  console.log("\nNote: Make sure to fund the staking contract with reward tokens!");
  console.log("Or ensure the staking contract can mint rewards as needed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

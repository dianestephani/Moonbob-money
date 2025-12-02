const hre = require("hardhat");

async function main() {
  console.log("\n=== Checking Deployment Wallet Balance\n");
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const network = hre.network.name;

  console.log(`Network:  ${network}`);
  console.log(`Address:  ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} ETH`);
  console.log("=".repeat(60));

  // Check if balance is sufficient for deployment
  const minBalance = hre.ethers.parseEther("0.01");

  if (balance < minBalance) {
    console.log("\n⚠  WARNING: Balance is very low!");
    console.log("   You may not have enough ETH for deployment.\n");

    if (network === "sepolia") {
      console.log("   Get Sepolia testnet ETH from:");
      console.log("   - https://sepoliafaucet.com/");
      console.log("   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
      console.log("   - https://faucets.chain.link/sepolia\n");
    } else if (network === "mainnet") {
      console.log("   Send ETH to your deployment wallet address.\n");
    }
  } else {
    console.log("\n✓ Balance looks good for deployment!\n");
  }

  // Estimate deployment costs
  if (balance > 0n) {
    console.log("=== Estimated Deployment Costs:");
    console.log("   Token deployment:   ~0.003-0.005 ETH");
    console.log("   Staking deployment: ~0.004-0.006 ETH");
    console.log("   Configuration:      ~0.001-0.002 ETH");
    console.log("   Total estimate:     ~0.008-0.013 ETH");
    console.log("   (Actual cost depends on gas prices)\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error checking balance:");
    console.error(error);
    process.exit(1);
  });

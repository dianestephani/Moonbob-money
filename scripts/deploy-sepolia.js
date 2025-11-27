const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n=€ Starting deployment to Sepolia testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("=Í Deploying with account:", deployer.address);
  console.log("=° Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Check if we have enough ETH
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("   WARNING: Balance is very low. You may need more Sepolia ETH.");
    console.log("   Get testnet ETH from: https://sepoliafaucet.com/\n");
  }

  // Step 1: Deploy MoonbobToken
  console.log("=Ý Step 1: Deploying MoonbobToken...");
  const MoonbobToken = await hre.ethers.getContractFactory("MoonbobToken");
  const token = await MoonbobToken.deploy(
    deployer.address, // owner
    deployer.address  // initial minter (will be changed to staking contract)
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log(" MoonbobToken deployed to:", tokenAddress);
  console.log("   Transaction hash:", token.deploymentTransaction().hash);

  // Wait for a few confirmations before deploying next contract
  console.log("   Waiting for 2 confirmations...");
  await token.deploymentTransaction().wait(2);
  console.log("   Confirmed!\n");

  // Step 2: Deploy Staking contract
  console.log("=Ý Step 2: Deploying Staking contract...");
  const rewardPerSecond = hre.ethers.parseEther("1"); // 1 MOONBOB per second

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(
    deployer.address,  // owner
    tokenAddress,      // stake token (MOONBOB)
    tokenAddress,      // reward token (MOONBOB)
    rewardPerSecond
  );
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log(" Staking contract deployed to:", stakingAddress);
  console.log("   Transaction hash:", staking.deploymentTransaction().hash);
  console.log("   Reward rate: 1 MOONBOB/second");

  console.log("   Waiting for 2 confirmations...");
  await staking.deploymentTransaction().wait(2);
  console.log("   Confirmed!\n");

  // Step 3: Set staking contract as minter
  console.log("=Ý Step 3: Setting staking contract as minter...");
  const setMinterTx = await token.setMinter(stakingAddress);
  console.log("   Transaction hash:", setMinterTx.hash);
  await setMinterTx.wait(2);

  const currentMinter = await token.minter();
  if (currentMinter !== stakingAddress) {
    throw new Error("Failed to set staking contract as minter!");
  }
  console.log(" Staking contract is now the minter\n");

  // Step 4: Verify deployment
  console.log("=Ý Step 4: Verifying deployment configuration...");
  const stakingTokenAddress = await staking.stakingToken();
  const rewardTokenAddress = await staking.rewardToken();
  const stakingOwner = await staking.owner();

  console.log("   Staking token:", stakingTokenAddress === tokenAddress ? " Correct" : "L Mismatch");
  console.log("   Reward token:", rewardTokenAddress === tokenAddress ? " Correct" : "L Mismatch");
  console.log("   Staking owner:", stakingOwner === deployer.address ? " Correct" : "L Mismatch");
  console.log("   Token minter:", currentMinter === stakingAddress ? " Correct" : "L Mismatch");

  // Step 5: Save deployment info
  console.log("\n=Ý Step 5: Saving deployment information...");
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MoonbobToken: {
        address: tokenAddress,
        txHash: token.deploymentTransaction().hash,
      },
      Staking: {
        address: stakingAddress,
        txHash: staking.deploymentTransaction().hash,
        rewardPerSecond: rewardPerSecond.toString(),
      }
    },
    verification: {
      MoonbobToken: `npx hardhat verify --network sepolia ${tokenAddress} "${deployer.address}" "${deployer.address}"`,
      Staking: `npx hardhat verify --network sepolia ${stakingAddress} "${deployer.address}" "${tokenAddress}" "${tokenAddress}" "${rewardPerSecond}"`,
    }
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `sepolia-${Date.now()}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(" Deployment info saved to:", deploymentFile);

  // Step 6: Update .env file
  console.log("\n=Ý Step 6: Updating .env file...");
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update or add contract addresses
  const updateEnvVar = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return content + `\n${key}=${value}`;
    }
  };

  envContent = updateEnvVar(envContent, "MOONBOB_TOKEN_ADDRESS", tokenAddress);
  envContent = updateEnvVar(envContent, "STAKING_ADDRESS", stakingAddress);

  fs.writeFileSync(envPath, envContent);
  console.log(" .env file updated with contract addresses");

  // Step 7: Create frontend .env.local file
  console.log("\n=Ý Step 7: Creating frontend .env.local file...");
  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env.local");
  const frontendEnvContent = `# Contract Addresses (Auto-generated from deployment)
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=${tokenAddress}
NEXT_PUBLIC_STAKING_ADDRESS=${stakingAddress}

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
`;

  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log(" Frontend .env.local created");

  // Display summary
  console.log("\n" + "=".repeat(80));
  console.log("<‰ DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(80));
  console.log("\n=Ë DEPLOYMENT SUMMARY:");
  console.log("".repeat(80));
  console.log(`Network:              Sepolia Testnet`);
  console.log(`Deployer:             ${deployer.address}`);
  console.log(`MoonbobToken:         ${tokenAddress}`);
  console.log(`Staking Contract:     ${stakingAddress}`);
  console.log(`Reward Rate:          1 MOONBOB/second`);
  console.log("".repeat(80));

  console.log("\n=Í NEXT STEPS:");
  console.log("".repeat(80));
  console.log("\n1ã  Verify contracts on Etherscan:");
  console.log("\n    MoonbobToken:");
  console.log(`    npx hardhat verify --network sepolia ${tokenAddress} "${deployer.address}" "${deployer.address}"`);
  console.log("\n    Staking Contract:");
  console.log(`    npx hardhat verify --network sepolia ${stakingAddress} "${deployer.address}" "${tokenAddress}" "${tokenAddress}" "${rewardPerSecond}"`);

  console.log("\n2ã  Update frontend configuration:");
  console.log("    - Edit frontend/.env.local");
  console.log("    - Add your WalletConnect Project ID");
  console.log("    - Contract addresses are already filled in");

  console.log("\n3ã  Update frontend contract configuration:");
  console.log("    - Edit frontend/src/lib/contracts.ts");
  console.log(`    - Set MOONBOB_TOKEN_ADDRESS = '${tokenAddress}'`);
  console.log(`    - Set STAKING_ADDRESS = '${stakingAddress}'`);

  console.log("\n4ã  View on Etherscan:");
  console.log(`    Token:   https://sepolia.etherscan.io/address/${tokenAddress}`);
  console.log(`    Staking: https://sepolia.etherscan.io/address/${stakingAddress}`);

  console.log("\n5ã  Test your deployment:");
  console.log("    - Switch MetaMask to Sepolia network");
  console.log("    - Get test ETH from https://sepoliafaucet.com/");
  console.log("    - Start frontend: cd frontend && npm run dev");
  console.log("    - Visit http://localhost:3000");

  console.log("\n" + "=".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\nL Deployment failed:");
    console.error(error);
    process.exit(1);
  });

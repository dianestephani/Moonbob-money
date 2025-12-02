const hre = require("hardhat");

async function main() {
  // Get the recipient address from environment variable or command line
  const recipientAddress = process.env.RECIPIENT_ADDRESS;
  const amount = process.env.MINT_AMOUNT || "1000"; // Default 1000 tokens

  if (!recipientAddress) {
    console.error("\nUsage: RECIPIENT_ADDRESS=<address> MINT_AMOUNT=<amount> npx hardhat run scripts/mint-tokens.js --network sepolia");
    console.error("Example: RECIPIENT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e MINT_AMOUNT=1000 npx hardhat run scripts/mint-tokens.js --network sepolia\n");
    process.exit(1);
  }

  console.log("\n═══ Minting Moonbob Tokens ═══\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Minting with account:", deployer.address);

  // Load contract addresses
  const tokenAddress = process.env.MOONBOB_TOKEN_ADDRESS;
  const stakingAddress = process.env.STAKING_ADDRESS;

  if (!tokenAddress || !stakingAddress) {
    console.error("❌ Missing contract addresses in .env file");
    console.error("   Please ensure MOONBOB_TOKEN_ADDRESS and STAKING_ADDRESS are set");
    process.exit(1);
  }

  console.log("📝 Token Contract:", tokenAddress);
  console.log("📝 Staking Contract:", stakingAddress);
  console.log("👤 Recipient:", recipientAddress);
  console.log("💰 Amount:", amount, "MOONBOB\n");

  // Get the token contract
  const MoonbobToken = await hre.ethers.getContractFactory("MoonbobToken");
  const token = MoonbobToken.attach(tokenAddress);

  // Check current minter
  const currentMinter = await token.minter();
  console.log("🔍 Current minter:", currentMinter);

  // Step 1: If staking contract is minter, temporarily change to deployer
  if (currentMinter !== deployer.address) {
    console.log("\n⚙️  Step 1: Changing minter to deployer...");
    const setMinterTx = await token.setMinter(deployer.address);
    console.log("   Transaction hash:", setMinterTx.hash);
    await setMinterTx.wait();
    console.log("✅ Minter changed to:", deployer.address);
  }

  // Step 2: Mint tokens
  console.log("\n⚙️  Step 2: Minting tokens...");
  const amountInWei = hre.ethers.parseEther(amount);
  const mintTx = await token.mint(recipientAddress, amountInWei);
  console.log("   Transaction hash:", mintTx.hash);
  await mintTx.wait();
  console.log("✅ Minted", amount, "MOONBOB to", recipientAddress);

  // Step 3: Restore staking contract as minter
  if (stakingAddress !== deployer.address) {
    console.log("\n⚙️  Step 3: Restoring staking contract as minter...");
    const restoreMinterTx = await token.setMinter(stakingAddress);
    console.log("   Transaction hash:", restoreMinterTx.hash);
    await restoreMinterTx.wait();
    console.log("✅ Minter restored to:", stakingAddress);
  }

  // Step 4: Verify balance
  console.log("\n⚙️  Step 4: Verifying balance...");
  const balance = await token.balanceOf(recipientAddress);
  console.log("✅ Recipient balance:", hre.ethers.formatEther(balance), "MOONBOB");

  console.log("\n" + "═".repeat(80));
  console.log("🎉 MINTING SUCCESSFUL!");
  console.log("═".repeat(80));
  console.log(`\n📊 View transaction on Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/tx/${mintTx.hash}`);
  console.log(`\n👤 View recipient balance on Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/token/${tokenAddress}?a=${recipientAddress}`);
  console.log("\n" + "═".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Minting failed:");
    console.error(error);
    process.exit(1);
  });

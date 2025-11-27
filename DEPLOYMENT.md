# Deployment Guide - Moonbob Money

This guide covers deploying the Moonbob Money staking contracts to Sepolia testnet and Ethereum mainnet, including Etherscan verification and frontend configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development Deployment](#local-development-deployment)
- [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
- [Etherscan Verification](#etherscan-verification)
- [Frontend Configuration](#frontend-configuration)
- [Mainnet Deployment](#mainnet-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- Node.js v18.17.0+ or v20+ (check with `node --version`)
- npm or yarn
- MetaMask wallet
- Git

### Required Accounts & API Keys

1. **Alchemy Account** (for RPC endpoints)
   - Sign up at https://www.alchemy.com/
   - Create a new app for Sepolia testnet
   - Copy your API key

2. **Etherscan Account** (for contract verification)
   - Sign up at https://etherscan.io/
   - Generate API key at https://etherscan.io/myapikey
   - Copy your API key

3. **WalletConnect Project** (for frontend wallet connection)
   - Sign up at https://cloud.walletconnect.com/
   - Create a new project
   - Copy your Project ID

4. **MetaMask Wallet**
   - Install from https://metamask.io/
   - Create or import a wallet
   - **IMPORTANT**: Use a dedicated deployment wallet, NOT your main wallet

### Testnet ETH

For Sepolia deployment, you'll need test ETH:
- Alchemy Sepolia Faucet: https://sepoliafaucet.com/
- Google Cloud Sepolia Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Chainlink Faucet: https://faucets.chain.link/sepolia

Recommended: Get at least 0.5 Sepolia ETH for deployment and testing.

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project
cd Moonbob-money

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Private key for deployment (DO NOT commit actual private key)
# Get this from MetaMask: Account Details > Export Private Key
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Etherscan API key for contract verification
# Get this from https://etherscan.io/myapikey
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Gas reporting
REPORT_GAS=false
```

**  SECURITY WARNING:**
- NEVER commit your `.env` file to Git
- NEVER share your private key
- Use a dedicated deployment wallet with only the funds needed for deployment
- The `.env` file is already in `.gitignore`

### 3. Export Private Key from MetaMask

1. Open MetaMask
2. Click on account icon ’ Account Details
3. Click "Show Private Key"
4. Enter your MetaMask password
5. Copy the private key (without the `0x` prefix)
6. Paste into `.env` file

### 4. Fund Your Deployment Wallet

- **Sepolia**: Get testnet ETH from faucets (see Prerequisites)
- **Mainnet**: Send real ETH to your deployment wallet (recommended: 0.5-1 ETH for gas)

---

## Local Development Deployment

For local testing with Hardhat network:

### 1. Start Local Hardhat Node

In one terminal:

```bash
npx hardhat node
```

This will:
- Start a local Ethereum node on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys

### 2. Deploy to Local Network

In another terminal:

```bash
npm run deploy
```

Or manually:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Connect MetaMask to Local Network

1. Open MetaMask
2. Click network dropdown ’ Add Network ’ Add a network manually
3. Fill in:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
4. Import one of the test accounts using the private key shown by `npx hardhat node`

### 4. Update Frontend Configuration

Edit `frontend/src/lib/contracts.ts` with deployed addresses from the deployment output.

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 to test the application.

---

## Sepolia Testnet Deployment

### Step-by-Step Deployment Process

#### 1. Verify Configuration

```bash
# Check that .env is properly configured
cat .env | grep -v "^#" | grep -v "^$"

# Verify you have Sepolia ETH
npx hardhat run scripts/check-balance.js --network sepolia
```

Create `scripts/check-balance.js` if needed:

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

#### 2. Run Deployment Script

```bash
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

The script will:
1.  Deploy MoonbobToken contract
2.  Deploy Staking contract
3.  Set staking contract as token minter
4.  Verify deployment configuration
5.  Save deployment info to `deployments/sepolia-*.json`
6.  Update `.env` with contract addresses
7.  Create `frontend/.env.local` with contract addresses
8.  Display verification commands

**Expected Output:**

```
=€ Starting deployment to Sepolia testnet...

=Í Deploying with account: 0x...
=° Account balance: 0.5 ETH

=Ý Step 1: Deploying MoonbobToken...
 MoonbobToken deployed to: 0x...
   Transaction hash: 0x...
   Confirmed!

=Ý Step 2: Deploying Staking contract...
 Staking contract deployed to: 0x...
   Transaction hash: 0x...
   Confirmed!

=Ý Step 3: Setting staking contract as minter...
 Staking contract is now the minter

=Ý Step 4: Verifying deployment configuration...
   Staking token:  Correct
   Reward token:  Correct
   Staking owner:  Correct
   Token minter:  Correct

=Ý Step 5: Saving deployment information...
 Deployment info saved to: deployments/sepolia-*.json

=Ý Step 6: Updating .env file...
 .env file updated with contract addresses

=Ý Step 7: Creating frontend .env.local file...
 Frontend .env.local created

<‰ DEPLOYMENT SUCCESSFUL!
```

#### 3. Save Deployment Information

The deployment script automatically saves all deployment information. You can find:

- Deployment details: `deployments/sepolia-[timestamp].json`
- Contract addresses in: `.env`
- Frontend environment: `frontend/.env.local`

**Important**: Commit the deployment JSON file to Git for record-keeping:

```bash
git add deployments/sepolia-*.json
git commit -m "Add Sepolia deployment information"
```

---

## Etherscan Verification

Verifying your contracts on Etherscan makes them publicly viewable and verifiable.

### Automatic Verification

The deployment script provides you with the exact commands to run. Look for the output:

```bash
1ã  Verify contracts on Etherscan:

    MoonbobToken:
    npx hardhat verify --network sepolia 0x... "0x..." "0x..."

    Staking Contract:
    npx hardhat verify --network sepolia 0x... "0x..." "0x..." "0x..." "1000000000000000000"
```

Copy and run these commands.

### Manual Verification

If you need to verify manually:

#### Verify MoonbobToken

```bash
npx hardhat verify --network sepolia \
  <TOKEN_ADDRESS> \
  "<DEPLOYER_ADDRESS>" \
  "<INITIAL_MINTER_ADDRESS>"
```

Example:
```bash
npx hardhat verify --network sepolia \
  0x1234567890123456789012345678901234567890 \
  "0xYourDeployerAddress" \
  "0xYourDeployerAddress"
```

#### Verify Staking Contract

```bash
npx hardhat verify --network sepolia \
  <STAKING_ADDRESS> \
  "<OWNER_ADDRESS>" \
  "<STAKING_TOKEN_ADDRESS>" \
  "<REWARD_TOKEN_ADDRESS>" \
  "<REWARD_PER_SECOND>"
```

Example:
```bash
npx hardhat verify --network sepolia \
  0x0987654321098765432109876543210987654321 \
  "0xYourOwnerAddress" \
  "0xTokenAddress" \
  "0xTokenAddress" \
  "1000000000000000000"
```

Note: `1000000000000000000` = 1 token/second (in wei)

### Verification Success

You should see:

```
Successfully submitted source code for contract
<contract_name> at <address>
for verification on the block explorer. Waiting for verification result...

Successfully verified contract <contract_name> on Etherscan.
https://sepolia.etherscan.io/address/<address>#code
```

### View Verified Contracts

- Token: https://sepolia.etherscan.io/address/YOUR_TOKEN_ADDRESS
- Staking: https://sepolia.etherscan.io/address/YOUR_STAKING_ADDRESS

---

## Frontend Configuration

### 1. Update Environment Variables

Edit `frontend/.env.local` (created automatically by deployment script):

```bash
# Contract Addresses (Auto-generated from deployment)
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_ADDRESS=0x...

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**Update the WalletConnect Project ID** with your actual ID from https://cloud.walletconnect.com/

### 2. Update Contract Configuration

Edit `frontend/src/lib/contracts.ts`:

```typescript
// Contract addresses
export const MOONBOB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS as `0x${string}`;
export const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`;
```

The addresses will be loaded from environment variables automatically.

### 3. Update Chain Configuration (if needed)

Edit `frontend/src/lib/wagmi.ts` to ensure Sepolia is in the chains array:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Moonbob Money',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [sepolia, hardhat, mainnet], // Sepolia first for testnet
  ssr: true,
});
```

### 4. Test Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 and:

1. Switch MetaMask to Sepolia network
2. Connect your wallet
3. You should see the contract interface
4. Test staking/unstaking with test tokens

### 5. Get Test Tokens

If you want to distribute test tokens to users:

```bash
npx hardhat console --network sepolia
```

Then in the console:
```javascript
const token = await ethers.getContractAt("MoonbobToken", "YOUR_TOKEN_ADDRESS");
await token.mint("RECIPIENT_ADDRESS", ethers.parseEther("1000"));
```

---

## Mainnet Deployment

**  WARNING: Mainnet deployment uses real ETH. Double-check everything!**

### Pre-Deployment Checklist

- [ ] All contracts thoroughly tested on Sepolia
- [ ] Frontend tested with Sepolia contracts
- [ ] Security audit completed (recommended for production)
- [ ] Deployment wallet funded with sufficient ETH (estimate: 0.5-1 ETH for gas)
- [ ] `.env` file configured with mainnet RPC URL
- [ ] Team ready to monitor deployment
- [ ] Have a rollback plan

### Deployment Steps

1. **Update Environment for Mainnet**

```bash
# In .env, ensure MAINNET_RPC_URL is set
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

2. **Create Mainnet Deployment Script**

Copy and modify the Sepolia script:

```bash
cp scripts/deploy-sepolia.js scripts/deploy-mainnet.js
```

Edit `scripts/deploy-mainnet.js` and change:
- Network references from "sepolia" to "mainnet"
- Consider adjusting reward rates for production
- Update deployment file paths

3. **Dry Run (Estimate Gas)**

```bash
npx hardhat run scripts/deploy-mainnet.js --network mainnet
```

Cancel before confirming to see estimated gas costs.

4. **Deploy to Mainnet**

```bash
npx hardhat run scripts/deploy-mainnet.js --network mainnet
```

5. **Verify on Etherscan**

Use the commands provided by the deployment script.

6. **Update Frontend for Mainnet**

```bash
# Update frontend/.env.local
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=<mainnet_token_address>
NEXT_PUBLIC_STAKING_ADDRESS=<mainnet_staking_address>
```

7. **Update wagmi config to prioritize mainnet**

```typescript
chains: [mainnet, sepolia, hardhat]
```

8. **Deploy Frontend**

Deploy to Vercel, Netlify, or your hosting provider.

---

## Troubleshooting

### Common Issues

#### "Insufficient funds for gas"

**Solution:**
- Check wallet balance: `npx hardhat run scripts/check-balance.js --network sepolia`
- Get more testnet ETH from faucets
- For mainnet, ensure you have at least 0.5 ETH

#### "Nonce too high" or "Nonce too low"

**Solution:**
- Reset MetaMask account: Settings ’ Advanced ’ Clear activity tab data
- Or specify nonce manually in deployment script

#### "Contract verification failed"

**Solution:**
- Ensure constructor arguments match exactly
- Check that ETHERSCAN_API_KEY is set correctly
- Wait a few minutes and try again
- Use `--force` flag: `npx hardhat verify --force --network sepolia ...`

#### "Private key error"

**Solution:**
- Ensure private key is in `.env` without `0x` prefix
- Check that `.env` file is in project root
- Verify `.env` is not committed to Git

#### Frontend shows "Wrong Network"

**Solution:**
- Ensure MetaMask is on the correct network (Sepolia/Mainnet)
- Check that chain is configured in `frontend/src/lib/wagmi.ts`
- Clear browser cache and reconnect wallet

#### "RPC URL not responding"

**Solution:**
- Verify Alchemy API key is correct
- Check Alchemy dashboard for rate limits
- Try alternative RPC provider (Infura, QuickNode)

#### Frontend localStorage errors

**Solution:**
- Ensure you've updated Node.js to v18.17.0+ or v20+
- Clear browser cache
- Check that Web3Content is dynamically imported with `ssr: false`

### Getting Help

If you encounter issues:

1. Check the [Hardhat documentation](https://hardhat.org/docs)
2. Review [wagmi documentation](https://wagmi.sh/)
3. Search [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
4. Open an issue on the GitHub repository

---

## Deployment Checklist

### Pre-Deployment
- [ ] Node.js v18.17.0+ or v20+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file configured with all required values
- [ ] Deployment wallet funded with sufficient ETH/test ETH
- [ ] All tests passing (`npm test`)
- [ ] Contract compilation successful (`npx hardhat compile`)

### Deployment
- [ ] Contracts deployed successfully
- [ ] Deployment transaction confirmed on blockchain
- [ ] Contract addresses saved
- [ ] Staking contract set as token minter
- [ ] Deployment configuration verified

### Post-Deployment
- [ ] Contracts verified on Etherscan
- [ ] Frontend `.env.local` updated
- [ ] Frontend contract addresses updated
- [ ] WalletConnect Project ID configured
- [ ] Frontend tested with deployed contracts
- [ ] Deployment information committed to Git
- [ ] Team notified of deployment

### Production Only
- [ ] Security audit completed
- [ ] Multisig wallet configured (if applicable)
- [ ] Ownership transferred to multisig (if applicable)
- [ ] Monitoring and alerting set up
- [ ] Documentation updated
- [ ] Community announcement prepared

---

## Quick Reference

### Useful Commands

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia
npx hardhat run scripts/deploy-sepolia.js --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <address> <constructor-args>

# Check deployment wallet balance
npx hardhat run scripts/check-balance.js --network sepolia

# Start Hardhat console
npx hardhat console --network sepolia

# Clean build artifacts
npx hardhat clean
```

### Important Links

- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Etherscan API Keys**: https://etherscan.io/myapikey
- **WalletConnect Cloud**: https://cloud.walletconnect.com/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Mainnet Etherscan**: https://etherscan.io/

---

## Security Best Practices

1. **Never commit private keys or sensitive data**
2. **Use a dedicated deployment wallet**
3. **Keep private keys in `.env` file only**
4. **Regularly update dependencies**
5. **Use hardware wallets for mainnet deployments**
6. **Implement multi-signature wallets for production**
7. **Conduct security audits before mainnet deployment**
8. **Monitor deployed contracts for suspicious activity**
9. **Have an emergency response plan**
10. **Keep backups of all deployment information**

---

**Last Updated**: November 2025
**Version**: 1.0.0

# Quick Start Guide - Sepolia Deployment

This is a condensed guide for deploying to Sepolia testnet. For complete documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites Checklist

- [ ] Node.js v18.17.0+ or v20+ installed
- [ ] MetaMask wallet installed
- [ ] Alchemy account created (free tier is fine)
- [ ] Etherscan API key obtained
- [ ] WalletConnect Project ID obtained
- [ ] Sepolia ETH in deployment wallet (minimum 0.1 ETH recommended)

## 5-Minute Deployment

### 1. Get API Keys

**Alchemy** (RPC provider):
1. Go to <https://www.alchemy.com/>
2. Create account ’ Create New App ’ Select Sepolia
3. Copy API key

**Etherscan** (contract verification):
1. Go to <https://etherscan.io/myapikey>
2. Create account ’ Add new API key
3. Copy API key

**WalletConnect** (wallet connection):
1. Go to <https://cloud.walletconnect.com/>
2. Create account ’ Create new project
3. Copy Project ID

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your preferred editor
```

Fill in these values in `.env`:

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_metamask_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Get Sepolia ETH

Visit any of these faucets:
- <https://sepoliafaucet.com/> (Alchemy)
- <https://cloud.google.com/application/web3/faucet/ethereum/sepolia> (Google)
- <https://faucets.chain.link/sepolia> (Chainlink)

Send to your deployment wallet address.

### 4. Verify Balance

```bash
npm run check:balance:sepolia
```

Should show at least 0.01 ETH (0.1 ETH recommended).

### 5. Deploy Contracts

```bash
npm install
npm run deploy:sepolia
```

Wait for deployment to complete (~2-3 minutes). The script will:
- Deploy MoonbobToken
- Deploy Staking contract
- Configure permissions
- Save deployment info
- Update .env files

### 6. Verify on Etherscan

Copy the verification commands from the deployment output and run them:

```bash
# Example output will give you exact commands like:
npx hardhat verify --network sepolia 0x... "0x..." "0x..."
```

### 7. Configure Frontend

Edit `frontend/.env.local` (auto-created by deployment):

```bash
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=0x...  # Already filled
NEXT_PUBLIC_STAKING_ADDRESS=0x...        # Already filled
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID  # Add this
```

### 8. Update Frontend Contract Addresses

Edit `frontend/src/lib/contracts.ts`:

```typescript
export const MOONBOB_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS as `0x${string}`;
export const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`;
```

Or hardcode them:

```typescript
export const MOONBOB_TOKEN_ADDRESS = '0xYourTokenAddress' as `0x${string}`;
export const STAKING_ADDRESS = '0xYourStakingAddress' as `0x${string}`;
```

### 9. Test Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit <http://localhost:3000>:
1. Connect MetaMask (switch to Sepolia network)
2. You should see the staking interface

## Common Issues & Quick Fixes

### "Insufficient funds for gas"
```bash
# Check balance
npm run check:balance:sepolia

# Get more Sepolia ETH from faucets listed above
```

### "Private key error"
```bash
# Make sure private key is in .env without 0x prefix
# Get from MetaMask: Account Details ’ Export Private Key
```

### "Contract verification failed"
```bash
# Wait 1-2 minutes after deployment, then retry
# Make sure ETHERSCAN_API_KEY is correct in .env
```

### "Frontend shows wrong network"
```bash
# Switch MetaMask to Sepolia network
# Clear browser cache and reconnect wallet
```

### "Node.js version error"
```bash
# Upgrade Node.js:
nvm install 20
nvm use 20

# Or download from nodejs.org
```

## Deployment Checklist

- [ ] `.env` file configured with API keys
- [ ] Deployment wallet has Sepolia ETH (0.01+ ETH)
- [ ] Contracts deployed successfully
- [ ] Contracts verified on Etherscan
- [ ] Deployment info saved to `deployments/` folder
- [ ] Frontend `.env.local` updated with WalletConnect ID
- [ ] Frontend contract addresses updated
- [ ] Frontend tested with MetaMask on Sepolia

## Next Steps

After successful deployment:

1. **Test the Application**
   - Connect wallet to frontend
   - Mint test tokens for testing
   - Test stake/unstake/claim functionality

2. **Distribute Test Tokens** (optional)

   ```bash
   npx hardhat console --network sepolia
   ```

   Then in console:
   ```javascript
   const token = await ethers.getContractAt("MoonbobToken", "TOKEN_ADDRESS");
   await token.mint("RECIPIENT_ADDRESS", ethers.parseEther("1000"));
   ```

3. **Share Your DApp**
   - Deploy frontend to Vercel/Netlify
   - Share the URL
   - Users can test on Sepolia

4. **Monitor Contracts**
   - View on Etherscan: `https://sepolia.etherscan.io/address/YOUR_ADDRESS`
   - Check transactions and interactions
   - Monitor for issues

## Useful Commands

```bash
# Check balance
npm run check:balance:sepolia

# Deploy to Sepolia
npm run deploy:sepolia

# Verify contract (example)
npx hardhat verify --network sepolia <address> <args>

# Run tests
npm test

# Compile contracts
npm run compile

# Start frontend
npm run frontend

# Hardhat console
npx hardhat console --network sepolia
```

## Support

- Full documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Hardhat docs: <https://hardhat.org/docs>
- Wagmi docs: <https://wagmi.sh/>
- Etherscan: <https://sepolia.etherscan.io/>

---

**Estimated Time**: 15-20 minutes (excluding faucet wait times)

**Estimated Cost**: 0.008-0.015 Sepolia ETH (FREE - testnet only)

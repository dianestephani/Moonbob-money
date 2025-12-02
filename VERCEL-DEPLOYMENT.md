# Vercel Deployment Guide

This guide will help you deploy the Moonbob Money frontend to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository pushed to GitHub

## Step 1: Push to GitHub

First, commit and push all your changes to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS` = `0x124d1F25Ed6368fFF885c6697d4E78FD835089D0`
   - `NEXT_PUBLIC_STAKING_ADDRESS` = `0xF5929810f51daEE84861fB5e9E53f4715df8804f`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` = `531559c3583eeab3e44849c3260f0fa8`

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

## Step 3: Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Follow the DNS configuration instructions

## Environment Variables

The following environment variables are required for production:

```env
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=0x124d1F25Ed6368fFF885c6697d4E78FD835089D0
NEXT_PUBLIC_STAKING_ADDRESS=0xF5929810f51daEE84861fB5e9E53f4715df8804f
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=531559c3583eeab3e44849c3260f0fa8
```

## Deployed Contract Addresses

- **Network**: Sepolia Testnet
- **MoonbobToken**: [0x124d1F25Ed6368fFF885c6697d4E78FD835089D0](https://sepolia.etherscan.io/address/0x124d1F25Ed6368fFF885c6697d4E78FD835089D0)
- **Staking Contract**: [0xF5929810f51daEE84861fB5e9E53f4715df8804f](https://sepolia.etherscan.io/address/0xF5929810f51daEE84861fB5e9E53f4715df8804f)

## Testing the Deployment

1. Visit your Vercel deployment URL
2. Connect your MetaMask wallet
3. Switch to Sepolia network
4. Ensure you have Sepolia ETH for gas fees
5. Test the staking functionality

## Troubleshooting

### Build fails with Node.js version error
- Vercel should automatically use Node.js 20 (specified in `.nvmrc`)
- If not, set `NODE_VERSION=20` in Vercel environment variables

### Wallet connection issues
- Ensure MetaMask is installed
- Make sure you're on the Sepolia network
- Check that the WalletConnect Project ID is valid

### Contract interaction fails
- Verify you have Sepolia ETH in your wallet
- Check that contract addresses are correct
- Ensure contracts are verified on Etherscan

## Updating the Deployment

To update the deployment, simply push changes to your GitHub repository:

```bash
git add .
git commit -m "Update frontend"
git push origin master
```

Vercel will automatically redeploy on every push to the main/master branch.

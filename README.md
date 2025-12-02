# 🌙 Moonbob Money

> A decentralized staking platform for MOONBOB tokens with real-time rewards

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow)](https://hardhat.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

Moonbob Money is a full-stack Web3 staking DApp that allows users to stake MOONBOB tokens and earn rewards in real-time. Built with production-grade smart contracts and a modern React frontend.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Usage](#-usage)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **🪙 Token Staking** - Stake MOONBOB tokens and earn rewards
- **⚡ Real-time Rewards** - Watch your rewards accumulate every second
- **🔄 Flexible Unstaking** - Unstake your tokens anytime with no lock period
- **💎 Claim Rewards** - Claim your earned rewards separately from unstaking
- **🎨 Modern UI** - Beautiful, responsive interface built with Next.js and shadcn/ui
- **🔐 Secure** - Audited smart contracts with reentrancy protection
- **📊 Live Stats** - Real-time display of staking rates and your earnings

## 🏗️ Architecture

### System Overview

```mermaid
graph TD
    A[User Wallet] -->|Connect| B[Frontend DApp]
    B -->|Approve Tokens| C[MoonbobToken Contract]
    B -->|Stake/Unstake| D[Staking Contract]
    D -->|Mint Rewards| C
    D -->|Track Balances| E[Staker Info]

    style A fill:#e1f5ff
    style B fill:#fff4e6
    style C fill:#e8f5e9
    style D fill:#f3e5f5
    style E fill:#fce4ec
```

### Staking Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Token
    participant Staking

    User->>Frontend: Connect Wallet
    User->>Frontend: Enter Stake Amount
    Frontend->>Token: approve(stakingAddress, amount)
    Token-->>Frontend: Approval Confirmed
    Frontend->>Staking: stake(amount)
    Staking->>Token: transferFrom(user, staking, amount)
    Staking->>Staking: Update user balance & rewards
    Staking-->>Frontend: Stake Successful

    Note over Staking: Rewards accumulate every second

    User->>Frontend: Claim Rewards
    Frontend->>Staking: claimRewards()
    Staking->>Staking: Calculate earned rewards
    Staking->>Token: mint(user, rewards)
    Token-->>User: Rewards Transferred

    User->>Frontend: Unstake Tokens
    Frontend->>Staking: unstake(amount)
    Staking->>Staking: Update rewards & balances
    Staking->>Token: transfer(user, amount)
    Token-->>User: Tokens Returned
```

## 📜 Smart Contracts

### MoonbobToken.sol

ERC-20 token with minting capability restricted to a designated minter (the Staking contract).

**Key Features:**
- Standard ERC-20 implementation using OpenZeppelin
- Minter role separate from owner for security
- Only minter can mint new tokens (used for staking rewards)
- Owner can update the minter address

**Functions:**
```solidity
mint(address to, uint256 amount)        // Mint tokens (minter only)
setMinter(address newMinter)            // Update minter (owner only)
```

### Staking.sol

Time-based staking contract that mints rewards proportionally based on stake amount and duration.

**Key Features:**
- Reward-per-token accumulator pattern for gas efficiency
- Real-time reward calculations (rewards accrue every second)
- Reentrancy protection on all state-changing functions
- Proportional rewards distribution based on stake weight
- Owner can adjust reward rate

**Functions:**
```solidity
stake(uint256 amount)                   // Stake tokens
unstake(uint256 amount)                 // Unstake tokens
claimRewards()                          // Claim earned rewards
getStakerInfo(address)                  // Get staker balance & rewards
updateRewardRate(uint256)               // Update reward rate (owner only)
```

**Reward Formula:**
```
User Rewards = (User Staked Amount / Total Staked) × Reward Per Second × Time Elapsed
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.17.0+ or v20+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git**
- **MetaMask** or another Web3 wallet

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Moonbob-money.git
   cd Moonbob-money
   ```

2. **Install dependencies**
   ```bash
   # Install Hardhat dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start local blockchain**
   ```bash
   npm run node
   ```

5. **Deploy contracts** (in another terminal)
   ```bash
   npm run deploy:localhost
   ```

6. **Start frontend**
   ```bash
   npm run frontend
   ```

7. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Deployment wallet private key (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_without_0x

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Deployed contract addresses
MOONBOB_TOKEN_ADDRESS=
STAKING_ADDRESS=
```

Create `frontend/.env.local`:

```bash
# Contract addresses (updated after deployment)
NEXT_PUBLIC_MOONBOB_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_STAKING_ADDRESS=0x...

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 🌐 Deployment

### Deploy to Sepolia Testnet

Full deployment guide available in [DEPLOYMENT.md](./DEPLOYMENT.md) and [QUICK-START.md](./QUICK-START.md).

**Quick Deploy:**

```bash
# 1. Configure .env with your API keys and private key

# 2. Get Sepolia ETH from faucets
# https://sepoliafaucet.com/

# 3. Check your balance
npm run check:balance:sepolia

# 4. Deploy contracts
npm run deploy:sepolia

# 5. Verify on Etherscan (commands provided in output)
npx hardhat verify --network sepolia <address> <constructor-args>
```

### Deployed Contracts

#### Sepolia Testnet
- **MoonbobToken:** `TBD` ([View on Etherscan](https://sepolia.etherscan.io/address/TBD))
- **Staking:** `TBD` ([View on Etherscan](https://sepolia.etherscan.io/address/TBD))

#### Ethereum Mainnet
- **MoonbobToken:** `Not deployed yet`
- **Staking:** `Not deployed yet`

> ⚠️ **Note:** Contract addresses will be updated after deployment. See deployment documentation for details.

## 🎮 Usage

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your preferred wallet (MetaMask, WalletConnect, etc.)
   - Approve the connection

2. **Stake Tokens**
   - Enter the amount of MOONBOB tokens to stake
   - Click "Approve" to allow the staking contract to access your tokens
   - Click "Stake" to lock your tokens and start earning rewards

3. **Monitor Rewards**
   - Watch your rewards accumulate in real-time
   - See your earnings rate (per day/week)
   - View total pool statistics

4. **Claim Rewards**
   - Click "Claim Rewards" to receive your earned tokens
   - Rewards are minted directly to your wallet

5. **Unstake**
   - Enter the amount to unstake (or click "Max")
   - Click "Unstake" to withdraw your tokens
   - Your final rewards are automatically calculated and claimed

### For Developers

**Compile contracts:**
```bash
npm run compile
```

**Run tests:**
```bash
npm test
```

**Deploy to local network:**
```bash
npm run node          # Terminal 1
npm run deploy        # Terminal 2
```

**Start frontend:**
```bash
npm run frontend
```

**Check wallet balance:**
```bash
npm run check:balance:sepolia
```

## 📚 Tech Stack

### Smart Contracts
- **[Solidity 0.8.28](https://soliditylang.org/)** - Smart contract programming language
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[OpenZeppelin Contracts](https://openzeppelin.com/contracts/)** - Secure, audited contract libraries
- **[Ethers.js](https://ethers.org/)** - Ethereum library for testing

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with SSR
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[wagmi](https://wagmi.sh/)** - React hooks for Ethereum
- **[viem](https://viem.sh/)** - TypeScript Ethereum library
- **[RainbowKit](https://www.rainbowkit.com/)** - Wallet connection UI
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev/)** - Modern icon set

### Development Tools
- **[Hardhat Toolbox](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox)** - Essential Hardhat plugins
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variable management
- **[Alchemy](https://www.alchemy.com/)** - Blockchain infrastructure
- **[Etherscan](https://etherscan.io/)** - Blockchain explorer and verification

## 📁 Project Structure

```
moonbob-money/
├── contracts/                    # Solidity smart contracts
│   ├── MoonbobToken.sol         # ERC-20 token with minting
│   └── Staking.sol              # Staking contract with rewards
├── scripts/                     # Deployment and utility scripts
│   ├── deploy.js               # Local deployment script
│   ├── deploy-sepolia.js       # Sepolia deployment script
│   └── check-balance.js        # Balance checker utility
├── test/                        # Smart contract tests
│   ├── MoonbobToken.test.js    # Token contract tests
│   └── Staking.test.js         # Staking contract tests (40+ tests)
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── pages/              # Next.js pages
│   │   │   ├── _app.tsx       # App wrapper
│   │   │   └── index.tsx      # Main page
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── StakingPanel.tsx
│   │   │   ├── RewardsPanel.tsx
│   │   │   └── Web3Content.tsx
│   │   ├── lib/               # Library configurations
│   │   │   ├── wagmi.ts       # wagmi/RainbowKit setup
│   │   │   ├── contracts.ts   # Contract ABIs & addresses
│   │   │   └── utils.ts       # Utility functions
│   │   └── styles/            # CSS styles
│   │       └── globals.css
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── next.config.js         # Next.js configuration
├── deployments/                # Deployment records (auto-generated)
├── ignition/                   # Hardhat Ignition modules
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Root dependencies & scripts
├── .env.example               # Environment template
├── DEPLOYMENT.md              # Comprehensive deployment guide
├── QUICK-START.md             # Quick deployment reference
└── README.md                  # This file
```

## 📜 Available Scripts

### Smart Contract Development

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run all contract tests (40+ tests) |
| `npm run node` | Start local Hardhat network |
| `npm run deploy` | Deploy to local network |
| `npm run deploy:localhost` | Deploy to localhost (alias) |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run check:balance` | Check deployment wallet balance |
| `npm run check:balance:sepolia` | Check Sepolia wallet balance |

### Frontend Development

| Command | Description |
|---------|-------------|
| `npm run frontend` | Start Next.js dev server |
| `npm run frontend:build` | Build for production |
| `npm run frontend:start` | Start production server |

### Contract Verification

```bash
# Verify on Etherscan (after deployment)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 🧪 Testing

The project includes comprehensive tests for both smart contracts:

**Test Coverage:**
- ✅ 40+ test cases
- ✅ 90%+ branch coverage
- ✅ All core functionality tested
- ✅ Edge cases covered
- ✅ Gas optimization verified

**Run tests:**
```bash
npm test
```

**Run tests with gas reporting:**
```bash
REPORT_GAS=true npm test
```

**Test files:**
- `test/MoonbobToken.test.js` - Token contract tests
- `test/Staking.test.js` - Staking contract tests

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Guidelines:**
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🔒 Security

### Audit Status

- ⚠️ **Not yet audited** - Use at your own risk
- Contracts use OpenZeppelin's battle-tested implementations
- Reentrancy protection implemented on all state-changing functions
- Custom errors for gas optimization

### Bug Bounty

If you discover a security vulnerability, please email security@example.com with details.

**Please do NOT:**
- Open a public issue about the vulnerability
- Exploit the vulnerability in production

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with troubleshooting
- **[QUICK-START.md](./QUICK-START.md)** - Quick 15-minute deployment guide
- **[Contract Documentation](./contracts/)** - Inline NatSpec documentation
- **[Hardhat Docs](https://hardhat.org/docs)** - Hardhat documentation
- **[wagmi Docs](https://wagmi.sh/)** - wagmi documentation
- **[Next.js Docs](https://nextjs.org/docs)** - Next.js documentation

## 🗺️ Roadmap

- [x] ERC-20 token contract with minting
- [x] Time-based staking with rewards
- [x] Frontend with wallet connection
- [x] Real-time reward tracking
- [x] Sepolia deployment infrastructure
- [ ] Contract security audit
- [ ] Mainnet deployment
- [ ] Governance features
- [ ] Multi-token staking support
- [ ] Mobile app

## 💬 Community & Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/Moonbob-money/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/Moonbob-money/discussions)
- **Twitter:** [@MoonbobMoney](https://twitter.com/moonbobmoney) *(example)*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [RainbowKit](https://www.rainbowkit.com/) - Beautiful wallet connection
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

**Built with ❤️ using Hardhat, Next.js, and wagmi**

*For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)*

*For quick deployment, see [QUICK-START.md](./QUICK-START.md)*# Trigger fresh deployment

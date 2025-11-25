# Moonbob Money

A full-stack Web3 application built with Hardhat and Next.js.

## Project Structure

```
moonbob-money/
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── test/                   # Contract tests
├── ignition/               # Hardhat Ignition deployment modules
│   └── modules/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── pages/         # Next.js pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── lib/           # Library configurations
│   │   └── styles/        # CSS styles
│   └── public/            # Static assets
├── hardhat.config.js      # Hardhat configuration
├── package.json           # Root package.json for Hardhat
└── .env.example           # Environment variables template
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. Install Hardhat dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

3. Create environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration values.

## Development

### Smart Contracts

Compile contracts:
```bash
npm run compile
```

Run tests:
```bash
npm test
```

Start local Hardhat node:
```bash
npm run node
```

Deploy contracts to local network:
```bash
npm run deploy:localhost
```

### Frontend

Run development server:
```bash
npm run frontend
```

Build for production:
```bash
npm run frontend:build
```

Start production server:
```bash
npm run frontend:start
```

## Available Scripts

### Root Directory (Hardhat)
- `npm run node` - Start local Hardhat network
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy contracts
- `npm run deploy:localhost` - Deploy to local network

### Frontend
- `npm run frontend` - Start Next.js dev server
- `npm run frontend:build` - Build Next.js for production
- `npm run frontend:start` - Start Next.js production server

## Tech Stack

### Smart Contracts
- Hardhat - Ethereum development environment
- Solidity - Smart contract language
- Hardhat Toolbox - Essential Hardhat plugins

### Frontend
- Next.js 15 - React framework
- TypeScript - Type safety
- ethers.js - Ethereum library
- wagmi - React hooks for Ethereum
- RainbowKit - Wallet connection UI
- viem - TypeScript Ethereum library

## License

MIT
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Structure

This repository contains two main components:

- **client/**: A Next.js 14 (App Router) web application built with OnchainKit, wagmi, viem, and Tailwind CSS. This frontend interacts with smart contracts on Base Sepolia to manage and display sessions. Users can connect their wallet, view sessions, and mark attendance via sponsored onchain transactions.

- **contract/**: Foundry-based Solidity project containing:
  - `MerchantPunchCard.sol`: A contract for tracking customer purchases with a product catalog and purchase history queue (last 10 items per customer)
  - `Deploy.s.sol`: Deployment script for MerchantPunchCard
  - Note: The client currently references a separate `Attendance` contract (ABI and address defined in `client/app/lib/Attendance.ts`) that's not in this repo but deployed at `0x51d4704F0B6c1277C86084B50842DfC42e7d4D96` on Base Sepolia

## Commands

### Client (Next.js App)

All commands should be run from the `client/` directory after installing dependencies.

```bash
# Install dependencies
npm install

# Development server (localhost:3000)
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

**Note**: There is no test script configured. To work with a specific page or component during development, use the dev server and navigate to the appropriate route (e.g., `/` for homepage, `/session/0` for session detail page).

### Contract (Foundry)

All commands should be run from the `contract/` directory.

```bash
# Build contracts
forge build

# Run all tests
forge test

# Run a specific test
forge test --match-test <TestName>

# Deploy contract (requires OWNER env var and Base Sepolia ETH)
# See contract/README.md for full deployment command with verification
forge script Deploy \
    --account dev \
    --rpc-url "https://sepolia.base.org" \
    --broadcast
```

**Foundry Installation**: If forge/cast commands are not available, follow the installation steps in `contract/README.md`.

## Environment Variables

### Client

Create a `.env.local` file in the `client/` directory with:

```bash
# OnchainKit configuration
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME="Your Project Name"
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-onchainkit-api-key"

# Server-side wallet for creating sessions via POST /sessions
# This should be a test wallet funded with Base Sepolia ETH
# Generate a fresh keypair with: cast wallet new
PRIVATE_KEY="0x..."
```

### Contract

For deployment via `Deploy.s.sol`:

```bash
# Owner address for the deployed contract
OWNER="0x..."

# For contract verification (optional)
ETHERSCAN_API_KEY="your-etherscan-api-key"
```

Get Base Sepolia testnet ETH from https://p2p-faucet.vercel.app/

## Architecture and Data Flow

### Session Management (Client ↔ Attendance Contract)

The client interacts with an `Attendance` contract on Base Sepolia through three main flows:

**1. Session Listing** (`/` homepage)
- Next.js API route `GET /sessions` uses viem's `createPublicClient` to read `totalSessions()` and batch-fetch session data via `multicall`
- Each session is parsed through `parseSession` utility (extracts start, end, totalAttended)
- Homepage fetches via React Query and displays links to individual sessions

**2. Session Creation** (Server-side)
- `POST /sessions` route accepts `{start, end}` timestamps
- Uses viem's `createWalletClient` with the `PRIVATE_KEY` account to send a transaction calling `Attendance.createSession(start, end)`
- Returns transaction hash

**3. Session Attendance** (`/session/[sessionId]`)
- Client-side page uses wagmi hooks (`useReadContract`) to fetch:
  - Total sessions count
  - Specific session data (start, end, totalAttended)
  - Whether current user has attended (`hasAttended`)
- Enforces Base Sepolia network via `useSwitchChain`
- Wraps `attendSession(sessionId)` call in OnchainKit `Transaction` component for sponsored transactions
- Uses `encodeFunctionData` from viem to construct the call data

**Wallet Integration**
- `Providers` component wraps the app in `OnchainKitProvider` configured for `baseSepolia`
- Layout applies dark theme and OnchainKit styles
- Wallet components from OnchainKit handle connect/disconnect/identity display

### Contract Architecture (MerchantPunchCard)

This is a separate contract from the Attendance contract used by the client:

- **Product Catalog**: Mapping of `itemId => CatalogItem{name}`
- **Purchase History**: Each customer has a fixed-size queue (array of 10 uint256s) storing the last 10 purchased item IDs
  - New purchases shift the queue right (oldest dropped, newest at index 0)
- **Access Control**: Owner-only `registerProduct` function
- **Events**: `ProductRegistered` and `PurchaseProcessed` for offchain indexing
- **Errors**: Custom errors `NotOwner`, `InvalidItemName` with named arguments

**Deployment**
- `Deploy.s.sol` reads `OWNER` from environment and deploys MerchantPunchCard
- Uses Foundry's `vm.startBroadcast()` pattern for transaction broadcast

### Key Files and Patterns

- **Contract ABIs**: Defined as const arrays in `client/app/lib/` (e.g., `Attendance.ts` exports `AttendanceAbi` and contract address)
- **viem Client Creation**: 
  - `createPublicClient` for read-only operations
  - `createWalletClient` for sending transactions (requires account)
- **OnchainKit Transaction Flow**: Wrap call data in `<Transaction>` with `TransactionButton`, `TransactionSponsor`, and `TransactionStatus` components
- **Multicall Pattern**: Batch multiple contract reads in a single RPC call via `publicClient.multicall()`

## Extending the System

**Adding New Onchain Features**
- For read operations: Follow the pattern in `GET /sessions` (viem publicClient + ABI + multicall)
- For write operations: Server-side uses walletClient (see `POST /sessions`), client-side uses OnchainKit Transaction components (see session attendance page)
- Store contract ABIs as const arrays in `client/app/lib/` with TypeScript `as const` assertion

**Adding New Contracts**
- Create `.sol` files in `contract/src/`
- Add deployment logic to `Deploy.s.sol` or create a new script
- Export ABI and address in `client/app/lib/` for frontend integration
- Follow MerchantPunchCard's pattern: custom errors with named args, events for state changes, explicit access control

**TypeScript Path Aliases**
- `@/*` maps to `client/*` (configured in `tsconfig.json`)
- Use `@/app/lib/Attendance` instead of relative paths for library imports

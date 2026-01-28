# 🌾 Blockchain-Based Farmer Trade Platform — Phase 1 Progress Report

This repository contains the **current development progress** of a blockchain-based agricultural trade platform aimed at improving **farmer profitability, transparency, and trust** using **decentralized auctions and smart contracts**.

> ✅ This README reflects the **actual completed work till now**, including **full backend + frontend + smart contract + local blockchain deployment + working UI**.

---

## 🎯 Project Objective

To build a **decentralized trade platform** that enables:

- Transparent **crop auctions**
- Fair **price discovery**
- Trustless **farmer-to-buyer transactions**
- (Future phases) Forward trading and agricultural credit

---

## 🧩 Phase 1 — Current Status (Updated)

### ✅ Completed

- Full **system architecture design**
- Blockchain environment setup using **Hardhat**
- **Auction smart contract** implemented in Solidity
- Smart contract **compiled & tested successfully**
- Deployment pipeline configured for:
  - Ethereum Sepolia Testnet
  - Local Hardhat Blockchain (Fake Chain)
- Local blockchain node running with **10,000 ETH test accounts**
- **Smart contract deployed locally**
- Wallet integration using **MetaMask**
- **Full frontend integration using Next.js + ethers.js**
- **Farmer dashboard** for crop listing
- **Buyer dashboard** for live bidding
- **Auction settlement system** (End Auction)
- **Live blockchain data reading** (display crop ID, price, status, highest bid, farmer & winner address)
- **Role-based UI using tabs (Farmer / Buyer)**
- **Professional error handling & UX improvements**

### ⏳ Pending

- Public testnet deployment (Sepolia)
- Production deployment
- Mobile UI optimization

---

## 🏗️ System Architecture (Implemented)

```
Frontend (Next.js + Tailwind CSS)
        ↓
Ethers.js (Web3 Interface)
        ↓
Smart Contracts (Solidity)
        ↓
Hardhat Local Blockchain 
```

---

## 🛠️ Technology Stack

| Layer        | Technology                      |
|-------------|----------------------------------|
| Frontend     | Next.js, Tailwind CSS           |
| Blockchain   | Solidity                        |
| Framework    | Hardhat                         |
| Wallet       | MetaMask                        |
| Web3 Library | ethers.js                       |
| Network      | Hardhat Local  

---

## 📂 Project Structure

```
farmer-trade-dapp/
│
├── frontend/        # Next.js frontend (FULLY IMPLEMENTED)
│   ├── app/
│   ├── components/
│   └── lib/
│
└── blockchain/      # Smart contracts & deployment
    ├── contracts/
    │     └── Auction.sol
    ├── scripts/
    │     └── deploy.js
    └── hardhat.config.cjs
```

---

## 📜 Smart Contract Summary (Auction.sol)

### Core Functionalities Implemented

- Crop listing by farmers
- Open auction system
- Buyer bidding using ETH
- Automatic tracking of highest bid
- Secure payment settlement
- Farmer-only auction termination

### Key Functions

- `listCrop(name, quantity, basePrice)`
- `bid(cropId)`
- `endAuction(cropId)`

---

## 🔄 Live Transaction Flow (Implemented)

```
User → MetaMask Login
        ↓
Farmer → List Crop on Blockchain
        ↓
Buyer → Place Bid using ETH
        ↓
Smart Contract → Track Highest Bid
        ↓
Farmer → End Auction
        ↓
Blockchain → Auto Transfer ETH to Farmer
```

---

## ⚙️ Current Development Status

| Module | Status |
|----------|----------|
| Smart Contract | ✅ Completed |
| Blockchain Setup | ✅ Completed |
| Local Deployment | ✅ Completed |
| MetaMask Integration | ✅ Completed |
| Crop Listing UI | ✅ Completed |
| Auction Bidding UI | ✅ Completed |
| End Auction Flow | ✅ Completed |
| Live Crop Display | ✅ Completed |
| Error Handling & UX | ✅ Completed |

---

## 🏆 Phase 1 Achievements

- Fully working **blockchain-based crop auction system**
- End-to-end **farmer → buyer → settlement flow**
- Real-time blockchain **read & write integration**
- Professional **role-based UI**
- Production-quality **Web3 UX handling**

---

## 🛣️ Future Roadmap

### Phase 2 — Forward Trading

- Future crop contracts
- Escrow-based trade settlement

### Phase 3 — Credit & Financial Services

- Agricultural loan system
- Credit scoring
- Bank integration

### Phase 4 — Analytics & AI

- Farmer profit dashboard
- Market trend analysis
- Price prediction

---
## 📌 Final Note

This project demonstrates a **real-world blockchain application in agriculture**, enabling **trustless, transparent, and fair trading for farmers**.

---

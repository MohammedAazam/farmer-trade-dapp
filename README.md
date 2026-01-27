# 🌾 Blockchain-Based Farmer Trade Platform — Phase 1 Progress Report

This repository contains the **current development progress** of a blockchain-based agricultural trade platform aimed at improving **farmer profitability, transparency, and trust** using **decentralized auctions and smart contracts**.

> ⚠️ This README reflects **work completed till now** (architecture + smart contract + deployment setup). Frontend integration and live deployment will be completed in the next phase.

---

## 🎯 Project Objective

To build a **decentralized trade platform** that enables:

* Transparent **crop auctions**
* Fair **price discovery**
* Trustless **farmer-to-buyer transactions**
* (Future phases) Forward trading and agricultural credit

---

## 🧩 Phase 1 — Current Status (Completed Till Now)

### ✅ Completed

* Full **project architecture design**
* Blockchain environment setup using **Hardhat**
* **Auction smart contract** written in Solidity
* Smart contract **compiled successfully**
* Deployment pipeline configured for:

  * Ethereum Sepolia Testnet
  * Local Hardhat Network
* RPC configuration using **Alchemy**
* Wallet integration planning using **MetaMask**

### ⏳ Pending (Next Step)

* Testnet funding (Sepolia faucet ETH)
* Smart contract live deployment
* Frontend (Next.js) integration
* MetaMask connection
* Auction UI

---

## 🏗️ System Architecture (Designed)

```
Frontend (Next.js + Tailwind CSS)
        ↓
Ethers.js (Web3 Interface)
        ↓
Smart Contracts (Solidity)
        ↓
Ethereum Blockchain (Sepolia / Local Hardhat)
```

---

## 🛠️ Technology Stack

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Frontend     | Next.js, Tailwind CSS           |
| Blockchain   | Solidity                        |
| Framework    | Hardhat                         |
| Wallet       | MetaMask                        |
| Web3 Library | ethers.js                       |
| Network      | Sepolia Testnet / Hardhat Local |

---

## 📂 Project Structure

```
farmer-trade-dapp/
│
├── frontend/        # Next.js frontend (setup done)
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

* Crop listing by farmers
* Open auction system
* Buyer bidding using ETH
* Automatic tracking of highest bid
* Secure payment transfer to farmer

### Key Functions

* `listCrop(name, quantity, basePrice)`
* `bid(cropId)`
* `endAuction(cropId)`

---

## 🔄 Designed Transaction Flow

```
User → MetaMask Login
        ↓
Farmer → List Crop
        ↓
Buyer → Place Bid
        ↓
Smart Contract → Track Highest Bid
        ↓
Farmer → End Auction
        ↓
Blockchain → Transfer ETH to Farmer
```

---

## ⚙️ Development Status

* Blockchain logic: **Completed**
* Smart contract: **Completed & compiled**
* Deployment setup: **Configured**
* Frontend UI: **Pending (Next Phase)**

---

## 🛣️ Upcoming Work

### Phase 1 Completion

* Deploy contract (Local + Testnet)
* Build auction UI
* Integrate MetaMask

### Phase 2

* Forward trading contracts
* Escrow-based settlement

### Phase 3

* Agricultural credit & loan system
* Analytics dashboard


---

## 📌 Note

This README documents **current progress** and **technical groundwork** completed toward building a full-scale blockchain-based agricultural trade platform.

---

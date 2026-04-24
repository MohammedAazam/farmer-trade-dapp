const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// ⚙️ Path to your contract.js file — adjust if your folder structure is different
const CONTRACT_FILE = path.resolve(__dirname, "../../frontend/lib/contract.js");

async function main() {
  console.log("Deploying contracts...\n");

  // Phase 1 - Auction
  const Auction = await ethers.getContractFactory("FarmerAuction");
  const auction = await Auction.deploy();
  await auction.waitForDeployment();
  const auctionAddr = await auction.getAddress();
  console.log("✅ FarmerAuction deployed to:", auctionAddr);

  // Phase 2 - Forward Trading
  const Forward = await ethers.getContractFactory("ForwardTrade");
  const forward = await Forward.deploy();
  await forward.waitForDeployment();
  const forwardAddr = await forward.getAddress();
  console.log("✅ ForwardTrade deployed to:", forwardAddr);

  // Phase 3 - Credit System
  const Credit = await ethers.getContractFactory("AgriCredit");
  const credit = await Credit.deploy();
  await credit.waitForDeployment();
  const creditAddr = await credit.getAddress();
  console.log("✅ AgriCredit deployed to:", creditAddr);

  console.log("\n🚀 Deployment Complete!");
  console.log("─────────────────────────────────────────");
  console.log("FarmerAuction :", auctionAddr);
  console.log("ForwardTrade  :", forwardAddr);
  console.log("AgriCredit    :", creditAddr);
  console.log("─────────────────────────────────────────\n");

  // Auto-update contract.js with new addresses
  updateContractAddresses(auctionAddr, forwardAddr, creditAddr);
}

function updateContractAddresses(auctionAddr, forwardAddr, creditAddr) {
  if (!fs.existsSync(CONTRACT_FILE)) {
    console.warn("⚠️  contract.js not found at:", CONTRACT_FILE);
    console.warn("   Skipping auto-update. Please update addresses manually:");
    console.warn(`   AUCTION_ADDRESS = "${auctionAddr}"`);
    console.warn(`   FORWARD_ADDRESS = "${forwardAddr}"`);
    console.warn(`   CREDIT_ADDRESS  = "${creditAddr}"`);
    return;
  }

  let content = fs.readFileSync(CONTRACT_FILE, "utf8");

  content = content
    .replace(
      /export const AUCTION_ADDRESS\s*=\s*".*?"/,
      `export const AUCTION_ADDRESS = "${auctionAddr}"`
    )
    .replace(
      /export const FORWARD_ADDRESS\s*=\s*".*?"/,
      `export const FORWARD_ADDRESS = "${forwardAddr}"`
    )
    .replace(
      /export const CREDIT_ADDRESS\s*=\s*".*?"/,
      `export const CREDIT_ADDRESS = "${creditAddr}"`
    );

  fs.writeFileSync(CONTRACT_FILE, content, "utf8");
  console.log("📝 contract.js addresses updated automatically!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
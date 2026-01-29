const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Phase 1 - Auction
  const Auction = await ethers.getContractFactory("FarmerAuction");
  const auction = await Auction.deploy();
  await auction.waitForDeployment();
  const auctionAddr = await auction.getAddress();
  console.log("Auction deployed to:", auctionAddr);

  // Phase 2 - Forward Trading
  const Forward = await ethers.getContractFactory("ForwardTrade");
  const forward = await Forward.deploy();
  await forward.waitForDeployment();
  const forwardAddr = await forward.getAddress();
  console.log("ForwardTrade deployed to:", forwardAddr);

  // Phase 3 - Credit System
  const Credit = await ethers.getContractFactory("AgriCredit");
  const credit = await Credit.deploy();
  await credit.waitForDeployment();
  const creditAddr = await credit.getAddress();
  console.log("AgriCredit deployed to:", creditAddr);

  console.log("\nDeployment Complete 🚀");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

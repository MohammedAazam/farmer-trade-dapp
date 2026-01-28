const { ethers } = require("hardhat");

async function main() {
  const Auction = await ethers.getContractFactory("FarmerAuction");
  const auction = await Auction.deploy();

  await auction.waitForDeployment();

  console.log("Auction deployed to:", await auction.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

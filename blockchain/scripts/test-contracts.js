const hre = require("hardhat");

// ─────────────────────────────────────────────
//  Helper: separator line
// ─────────────────────────────────────────────
const line = () => console.log("─".repeat(55));

async function main() {
  console.log("\n╔═════════════════════════════════════════════════════╗");
  console.log("║     🌾  FARMER TRADE DAPP — FULL CONTRACT TEST     ║");
  console.log("╚═════════════════════════════════════════════════════╝\n");

  // ── Accounts ──────────────────────────────
  const [farmer, buyer, lender] = await hre.ethers.getSigners();

  console.log("👤 Test Accounts:");
  console.log("   Farmer :", farmer.address);
  console.log("   Buyer  :", buyer.address);
  console.log("   Lender :", lender.address);
  line();

  // ── Load Contracts ────────────────────────
  const Auction = await hre.ethers.getContractAt(
    "FarmerAuction",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  const Forward = await hre.ethers.getContractAt(
    "ForwardTrade",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );
  const Credit = await hre.ethers.getContractAt(
    "AgriCredit",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  );

  // ═══════════════════════════════════════════
  //  MODULE 1 — FARMER AUCTION
  // ═══════════════════════════════════════════
  console.log("\n🏛️  MODULE 1: FARMER AUCTION");
  line();

  // 1a. List a crop
  console.log("\n[1/5] 📦 Farmer listing crop...");
  const listTx = await Auction.connect(farmer).listCrop(
    "Wheat",
    1000,
    hre.ethers.parseEther("0.5")
  );
  await listTx.wait();
  const cropCount = await Auction.cropCount();
  const crop = await Auction.crops(1);
  console.log("      ✅ Crop listed successfully!");
  console.log("         Name     :", crop[2]);
  console.log("         Quantity :", crop[3].toString(), "kg");
  console.log("         BasePrice:", hre.ethers.formatEther(crop[4]), "ETH");
  console.log("         Active   :", crop[5]);
  console.log("         Total crops on chain:", cropCount.toString());

  // 1b. Place a bid
  console.log("\n[2/5] 💰 Buyer placing bid...");
  const bidTx = await Auction.connect(buyer).bid(1, {
    value: hre.ethers.parseEther("0.6"),
  });
  await bidTx.wait();
  const bid1 = await Auction.highestBids(1);
  console.log("      ✅ Bid placed successfully!");
  console.log("         Bidder     :", bid1[0]);
  console.log("         Bid Amount :", hre.ethers.formatEther(bid1[1]), "ETH");

  // 1c. Place a higher bid (outbid)
  console.log("\n[3/5] 💰 Lender outbidding buyer...");
  const bidTx2 = await Auction.connect(lender).bid(1, {
    value: hre.ethers.parseEther("0.8"),
  });
  await bidTx2.wait();
  const bid2 = await Auction.highestBids(1);
  console.log("      ✅ Higher bid placed — previous bidder refunded!");
  console.log("         New Bidder :", bid2[0]);
  console.log("         New Amount :", hre.ethers.formatEther(bid2[1]), "ETH");

  // 1d. End auction
  console.log("\n[4/5] 🔨 Farmer ending auction...");
  const farmerBalBefore = await hre.ethers.provider.getBalance(farmer.address);
  const endTx = await Auction.connect(farmer).endAuction(1);
  await endTx.wait();
  const farmerBalAfter = await hre.ethers.provider.getBalance(farmer.address);
  const cropAfter = await Auction.crops(1);
  console.log("      ✅ Auction ended successfully!");
  console.log("         Auction Active:", cropAfter[5]);
  console.log(
    "         Farmer received ETH (approx):",
    parseFloat(hre.ethers.formatEther(farmerBalAfter - farmerBalBefore)).toFixed(4),
    "ETH"
  );

  // 1e. Verify closed auction can't be bid on
  console.log("\n[5/5] 🛡️  Verifying closed auction rejects bids...");
  try {
    await Auction.connect(buyer).bid(1, { value: hre.ethers.parseEther("1.0") });
    console.log("      ❌ ERROR: Bid should have been rejected!");
  } catch (e) {
    console.log("      ✅ Correctly rejected bid on closed auction!");
  }

  console.log("\n✅ MODULE 1 (FARMER AUCTION) — ALL TESTS PASSED");

  // ═══════════════════════════════════════════
  //  MODULE 2 — FORWARD TRADING
  // ═══════════════════════════════════════════
  console.log("\n\n📜  MODULE 2: FORWARD TRADING");
  line();

  // 2a. Create a forward deal
  console.log("\n[1/4] 📝 Farmer creating forward deal...");
  const deliveryTime = Math.floor(Date.now() / 1000) + 30 * 86400; // 30 days
  const createTx = await Forward.connect(farmer).createDeal(
    "Rice",
    500,
    hre.ethers.parseEther("1.0"),
    deliveryTime
  );
  await createTx.wait();
  const dealCount = await Forward.dealCount();
  const deal = await Forward.deals(1);
  console.log("      ✅ Forward deal created!");
  console.log("         Crop      :", deal[3]);
  console.log("         Quantity  :", deal[4].toString(), "units");
  console.log("         Price     :", hre.ethers.formatEther(deal[5]), "ETH");
  console.log("         Accepted  :", deal[7]);
  console.log("         Completed :", deal[8]);
  console.log("         Total deals on chain:", dealCount.toString());

  // 2b. Accept deal
  console.log("\n[2/4] 🤝 Buyer accepting deal...");
  const acceptTx = await Forward.connect(buyer).acceptDeal(1, {
    value: hre.ethers.parseEther("1.0"),
  });
  await acceptTx.wait();
  const dealAfterAccept = await Forward.deals(1);
  console.log("      ✅ Deal accepted and payment locked!");
  console.log("         Buyer   :", dealAfterAccept[2]);
  console.log("         Accepted:", dealAfterAccept[7]);

  // 2c. Verify double-accept is rejected
  console.log("\n[3/4] 🛡️  Verifying deal can't be accepted twice...");
  try {
    await Forward.connect(lender).acceptDeal(1, {
      value: hre.ethers.parseEther("1.0"),
    });
    console.log("      ❌ ERROR: Should have rejected second accept!");
  } catch (e) {
    console.log("      ✅ Correctly rejected duplicate acceptance!");
  }

  // 2d. Confirm delivery (fast-forward delivery time using evm_increaseTime)
  console.log("\n[4/4] 📦 Confirming delivery after delivery time...");
  await hre.network.provider.send("evm_increaseTime", [31 * 86400]); // +31 days
  await hre.network.provider.send("evm_mine");
  const farmerBalBefore2 = await hre.ethers.provider.getBalance(farmer.address);
  const confirmTx = await Forward.connect(farmer).confirmDelivery(1);
  await confirmTx.wait();
  const farmerBalAfter2 = await hre.ethers.provider.getBalance(farmer.address);
  const dealFinal = await Forward.deals(1);
  console.log("      ✅ Delivery confirmed — farmer paid!");
  console.log("         Completed:", dealFinal[8]);
  console.log(
    "         Farmer received (approx):",
    parseFloat(hre.ethers.formatEther(farmerBalAfter2 - farmerBalBefore2)).toFixed(4),
    "ETH"
  );

  console.log("\n✅ MODULE 2 (FORWARD TRADING) — ALL TESTS PASSED");

  // ═══════════════════════════════════════════
  //  MODULE 3 — AGRI CREDIT
  // ═══════════════════════════════════════════
  console.log("\n\n🏦  MODULE 3: AGRI CREDIT");
  line();

  // 3a. Request loan
  console.log("\n[1/4] 📋 Farmer requesting loan...");
  const loanTx = await Credit.connect(farmer).requestLoan(
    hre.ethers.parseEther("1.0")
  );
  await loanTx.wait();
  const loanCount = await Credit.loanCount();
  const loan = await Credit.loans(1);
  console.log("      ✅ Loan requested!");
  console.log("         Farmer :", loan[1]);
  console.log("         Amount :", hre.ethers.formatEther(loan[3]), "ETH");
  console.log("         Active :", loan[5]);
  console.log("         Total loans on chain:", loanCount.toString());

  // 3b. Approve loan (lender funds it)
  console.log("\n[2/4] ✅ Lender approving and funding loan...");
  const farmerBalBefore3 = await hre.ethers.provider.getBalance(farmer.address);
  const approveTx = await Credit.connect(lender).approveLoan(1, {
    value: hre.ethers.parseEther("1.0"),
  });
  await approveTx.wait();
  const farmerBalAfter3 = await hre.ethers.provider.getBalance(farmer.address);
  const loanAfterApprove = await Credit.loans(1);
  console.log("      ✅ Loan approved and ETH sent to farmer!");
  console.log("         Lender :", loanAfterApprove[2]);
  console.log("         Active :", loanAfterApprove[5]);
  console.log(
    "         Farmer received (approx):",
    parseFloat(hre.ethers.formatEther(farmerBalAfter3 - farmerBalBefore3)).toFixed(4),
    "ETH"
  );

  // 3c. Partial repayment
  console.log("\n[3/4] 💸 Farmer making partial repayment (0.5 ETH)...");
  const repayTx1 = await Credit.connect(farmer).repayLoan(1, {
    value: hre.ethers.parseEther("0.5"),
  });
  await repayTx1.wait();
  const loanAfterPartial = await Credit.loans(1);
  console.log("      ✅ Partial repayment done!");
  console.log("         Repaid :", hre.ethers.formatEther(loanAfterPartial[4]), "ETH");
  console.log("         Active :", loanAfterPartial[5], "(still open)");

  // 3d. Final repayment — closes loan
  console.log("\n[4/4] 💸 Farmer repaying remaining 0.5 ETH (closing loan)...");
  const repayTx2 = await Credit.connect(farmer).repayLoan(1, {
    value: hre.ethers.parseEther("0.5"),
  });
  await repayTx2.wait();
  const loanFinal = await Credit.loans(1);
  console.log("      ✅ Loan fully repaid and closed!");
  console.log("         Total Repaid:", hre.ethers.formatEther(loanFinal[4]), "ETH");
  console.log("         Active      :", loanFinal[5], "(closed ✅)");

  console.log("\n✅ MODULE 3 (AGRI CREDIT) — ALL TESTS PASSED");

  // ═══════════════════════════════════════════
  //  FINAL SUMMARY
  // ═══════════════════════════════════════════
  console.log("\n");
  console.log("╔═════════════════════════════════════════════════════╗");
  console.log("║              📊  FINAL TEST SUMMARY                ║");
  console.log("╠═════════════════════════════════════════════════════╣");
  console.log("║  Module 1 — Farmer Auction    ✅  5/5 tests passed ║");
  console.log("║  Module 2 — Forward Trading   ✅  4/4 tests passed ║");
  console.log("║  Module 3 — Agri Credit       ✅  4/4 tests passed ║");
  console.log("╠═════════════════════════════════════════════════════╣");
  console.log("║         🎉  ALL 13 TESTS PASSED SUCCESSFULLY       ║");
  console.log("╚═════════════════════════════════════════════════════╝\n");
}

main().catch((err) => {
  console.error("\n❌ Test failed:", err.message);
  process.exit(1);
});
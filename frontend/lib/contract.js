export const AUCTION_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const FORWARD_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const CREDIT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const AUCTION_ABI = [
  "function listCrop(string,uint256,uint256)",
  "function bid(uint256) payable",
  "function endAuction(uint256)",
  "function cropCount() view returns(uint256)",
  "function crops(uint256) view returns(uint256,address,string,uint256,uint256,bool)",
  "function highestBids(uint256) view returns(address,uint256)"
];

export const FORWARD_ABI = [
  "function createDeal(string,uint256,uint256,uint256)",
  "function acceptDeal(uint256) payable",
  "function confirmDelivery(uint256)",
  "function dealCount() view returns(uint256)",
  "function deals(uint256) view returns(uint256,address,address,string,uint256,uint256,uint256,bool,bool)"
];

export const CREDIT_ABI = [
  "function requestLoan(uint256)",
  "function approveLoan(uint256) payable",
  "function repayLoan(uint256) payable",
  "function loanCount() view returns(uint256)",
  "function loans(uint256) view returns(uint256,address,address,uint256,uint256,bool)"
];

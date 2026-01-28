export const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const ABI = [
  "function listCrop(string memory,uint256,uint256) public",
  "function bid(uint256) public payable",
  "function endAuction(uint256) public",
  "function cropCount() view returns (uint256)",
  "function crops(uint256) view returns (uint256,address,string,uint256,uint256,bool)",
  "function highestBids(uint256) view returns (address,uint256)"
];

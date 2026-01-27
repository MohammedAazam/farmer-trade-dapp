// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FarmerAuction {

    struct Crop {
        uint256 id;
        address farmer;
        string name;
        uint256 quantity;
        uint256 basePrice;
        bool active;
    }

    struct Bid {
        address bidder;
        uint256 amount;
    }

    uint256 public cropCount;
    mapping(uint256 => Crop) public crops;
    mapping(uint256 => Bid) public highestBids;

    event CropListed(uint256 cropId, string name, uint256 basePrice);
    event NewBid(uint256 cropId, address bidder, uint256 amount);
    event AuctionEnded(uint256 cropId, address winner, uint256 amount);

    function listCrop(
        string memory _name,
        uint256 _quantity,
        uint256 _basePrice
    ) public {
        cropCount++;
        crops[cropCount] = Crop(
            cropCount,
            msg.sender,
            _name,
            _quantity,
            _basePrice,
            true
        );

        emit CropListed(cropCount, _name, _basePrice);
    }

    function bid(uint256 _cropId) public payable {
        require(crops[_cropId].active, "Auction not active");
        require(msg.value > highestBids[_cropId].amount, "Bid too low");

        if (highestBids[_cropId].amount > 0) {
            payable(highestBids[_cropId].bidder).transfer(
                highestBids[_cropId].amount
            );
        }

        highestBids[_cropId] = Bid(msg.sender, msg.value);

        emit NewBid(_cropId, msg.sender, msg.value);
    }

    function endAuction(uint256 _cropId) public {
        Crop storage crop = crops[_cropId];

        require(msg.sender == crop.farmer, "Only farmer can end auction");
        require(crop.active, "Auction already ended");

        crop.active = false;

        if (highestBids[_cropId].amount > 0) {
            payable(crop.farmer).transfer(highestBids[_cropId].amount);
        }

        emit AuctionEnded(
            _cropId,
            highestBids[_cropId].bidder,
            highestBids[_cropId].amount
        );
    }
}

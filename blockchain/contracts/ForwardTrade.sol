// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ForwardTrade {
    struct Deal {
        uint256 id;
        address farmer;
        address buyer;
        string crop;
        uint256 quantity;
        uint256 price;
        uint256 deliveryTime;
        bool accepted;
        bool completed;
    }

    uint256 public dealCount;
    mapping(uint256 => Deal) public deals;

    event DealCreated(uint256 id, address farmer, string crop, uint256 price, uint256 deliveryTime);
    event DealAccepted(uint256 id, address buyer);
    event DealCompleted(uint256 id);

    function createDeal(
        string memory _crop,
        uint256 _quantity,
        uint256 _price,
        uint256 _deliveryTime
    ) public {
        require(_deliveryTime > block.timestamp, "Invalid delivery time");

        dealCount++;

        deals[dealCount] = Deal(
            dealCount,
            msg.sender,
            address(0),
            _crop,
            _quantity,
            _price,
            _deliveryTime,
            false,
            false
        );

        emit DealCreated(dealCount, msg.sender, _crop, _price, _deliveryTime);
    }

    function acceptDeal(uint256 _id) public payable {
        Deal storage d = deals[_id];

        require(!d.accepted, "Deal already accepted");
        require(msg.value == d.price, "Incorrect payment amount");

        d.buyer = msg.sender;
        d.accepted = true;

        emit DealAccepted(_id, msg.sender);
    }

    function confirmDelivery(uint256 _id) public {
        Deal storage d = deals[_id];

        require(msg.sender == d.farmer, "Only farmer can confirm");
        require(d.accepted, "Deal not accepted");
        require(block.timestamp >= d.deliveryTime, "Delivery time not reached");
        require(!d.completed, "Already completed");

        d.completed = true;
        payable(d.farmer).transfer(d.price);

        emit DealCompleted(_id);
    }

    function getDeal(uint256 _id) public view returns (Deal memory) {
        return deals[_id];
    }
}

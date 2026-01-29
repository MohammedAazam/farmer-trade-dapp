// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriCredit {
    struct Loan {
        uint256 id;
        address farmer;
        address lender;
        uint256 amount;
        uint256 repaid;
        bool active;
    }

    uint256 public loanCount;
    mapping(uint256 => Loan) public loans;

    event LoanRequested(uint256 id, address farmer, uint256 amount);
    event LoanApproved(uint256 id, address lender, uint256 amount);
    event LoanRepaid(uint256 id, uint256 amount);
    event LoanClosed(uint256 id);

    function requestLoan(uint256 _amount) public {
        require(_amount > 0, "Invalid loan amount");

        loanCount++;

        loans[loanCount] = Loan(
            loanCount,
            msg.sender,
            address(0),
            _amount,
            0,
            false
        );

        emit LoanRequested(loanCount, msg.sender, _amount);
    }

    function approveLoan(uint256 _id) public payable {
        Loan storage l = loans[_id];

        require(l.lender == address(0), "Already approved");
        require(msg.value == l.amount, "Incorrect loan amount");

        l.lender = msg.sender;
        l.active = true;

        payable(l.farmer).transfer(msg.value);

        emit LoanApproved(_id, msg.sender, msg.value);
    }

    function repayLoan(uint256 _id) public payable {
        Loan storage l = loans[_id];

        require(msg.sender == l.farmer, "Only farmer can repay");
        require(l.active, "Loan not active");
        require(msg.value > 0, "Invalid repayment");

        l.repaid += msg.value;
        payable(l.lender).transfer(msg.value);

        emit LoanRepaid(_id, msg.value);

        if (l.repaid >= l.amount) {
            l.active = false;
            emit LoanClosed(_id);
        }
    }

    function getLoan(uint256 _id) public view returns (Loan memory) {
        return loans[_id];
    }
}

// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Stocks {
    address public director;
    int32 public stocksCount;

    constructor(int32 _stocksCount) {
        director = msg.sender;
        stocksCount = _stocksCount;
    }

    // modifier to check if caller is owner
    modifier isDirector() {
        // If the first argument of 'require' evaluates to 'false', execution terminates and all
        // changes to the state and to Ether balances are reverted.
        // This used to consume all gas in old EVM versions, but not anymore.
        // It is often a good idea to use 'require' to check if functions are called correctly.
        // As a second argument, you can also provide an explanation about what went wrong.
        require(msg.sender == director, "Caller is not director");
        _;
    }

    modifier notLargerThanBalance(uint256 amount) {
        require(address(this).balance >= amount);
        _;
    }

    // Anyone can send money to company because why not
    function deposit() public payable {}

    function withdraw(address payable targetAddress) public isDirector {
        targetAddress.transfer(address(this).balance);
    }

    function withdraw(address payable targetAddress, uint256 amount) public isDirector notLargerThanBalance(amount) {
        targetAddress.transfer(amount);
    }

}
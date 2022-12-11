// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Stocks {

    struct Stockholder {
        uint32 stocksCount;
        uint256 sellPrice;
        uint32 sellCount;
    }


    address public director;
    uint32 public stocksCount;

    mapping(address => Stockholder) public stockholders;

    constructor(uint32 _stocksCount) {
        director = msg.sender;
        stocksCount = _stocksCount;
        stockholders[address(this)].stocksCount = _stocksCount;
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

    modifier isStockholder(address addr) {
        require(stockholders[addr].stocksCount != 0, "Caller is not stockholder");
        _;
    }

    modifier notLargerThanBalance(uint256 amount) {
        require(address(this).balance >= amount);
        _;
    }

    modifier notLessThan(uint256 a, uint256 b) {
        require(a >= b);
        _;
    }

    modifier hasEnoughStocks(address addr, uint32 amount) {
        require(stockholders[addr].stocksCount >= amount);
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

    function sellOrder(uint256 sellPrice, uint32 sellCount) public hasEnoughStocks(msg.sender, sellCount) {
        stockholders[msg.sender].sellPrice = sellPrice;
        stockholders[msg.sender].sellCount = sellCount;
    }

    function buyStocks(address payable sellerStockholder, uint32 buyCount) public payable 
                                                                                hasEnoughStocks(sellerStockholder, buyCount) 
                                                                                notLessThan(msg.value, stockholders[sellerStockholder].sellPrice * buyCount) {
        uint256 transactionValue = stockholders[sellerStockholder].sellPrice * buyCount;
        stockholders[sellerStockholder].sellCount -= buyCount;
        stockholders[sellerStockholder].stocksCount -= buyCount;
        stockholders[msg.sender].stocksCount += buyCount;
        sellerStockholder.transfer(transactionValue);
        payable(msg.sender).transfer(msg.value - transactionValue);
    }

}
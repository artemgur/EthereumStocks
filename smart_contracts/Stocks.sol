// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Stocks {

    struct Stockholder {
        uint32 stocksCount;
        uint256 sellPrice;
        uint32 sellCount;
        bool voted;
    }


    uint public constant timeBetweenMeetings = 10 minutes;
    uint public constant minTimeToMakeProposals = 1 minutes;
    uint public constant timeToVote = 1 minutes;


    address public director;
    uint32 public stocksCount;
    uint lastMeetingTime;
    bool isMeeting;
    //bool isProposalTime;
    //bool isVotingTime;

    mapping(address => Stockholder) public stockholders;
    address[] stockholderList;

    mapping(uint256 => uint32) public dividendProposals;
    uint256[] proposedDividendSizes;

    constructor(uint32 _stocksCount) {
        director = msg.sender;
        stocksCount = _stocksCount;
        stockholders[address(this)].stocksCount = _stocksCount;
        lastMeetingTime = block.timestamp;
        //isProposalTime = false;
        //isVotingTime = false;
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

    modifier isStockholder() {
        require(stockholders[msg.sender].stocksCount != 0, "Caller is not stockholder");
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
        require(!isMeeting);
        targetAddress.transfer(address(this).balance);
    }

    function withdraw(address payable targetAddress, uint256 amount) public isDirector notLargerThanBalance(amount) {
        require(!isMeeting);
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
        if (stockholders[sellerStockholder].stocksCount == 0) {
            // Deletes stockholder from stockholders array
            uint stockholderIndex = 0;
            for (uint i = 0; i < stockholderList.length; i++)
                if (stockholderList[i] == sellerStockholder) {
                    stockholderIndex = i;
                    break;
                }
            stockholderList[stockholderIndex] = stockholderList[stockholderList.length - 1];
            delete stockholderList[stockholderList.length - 1];
            stockholderList.pop();
        }
        if (stockholders[msg.sender].stocksCount == 0)
            stockholderList.push(msg.sender);
        stockholders[msg.sender].stocksCount += buyCount;
        sellerStockholder.transfer(transactionValue);
        payable(msg.sender).transfer(msg.value - transactionValue);
    }

    /*function startMeeting() public isStockholder {
        require(!isProposalTime && !isVotingTime && (lastMeetingTime + timeBetweenMeetings > block.timestamp));
        isProposalTime = true;
        lastMeetingTime = block.timestamp;
    }*/

    

    function makeDividendsProposal(uint256 dividendSize) public isStockholder {
        require((lastMeetingTime + timeBetweenMeetings > block.timestamp)
             && dividendSize * stocksCount <= address(this).balance
             && (lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals <= block.timestamp));
        isMeeting = true;
        //dividendProposals.push(DividendProposal({
        //        dividendSize: dividendSize,
        //        voteCount: 0
        //    }));
        dividendProposals[dividendSize] = 1;
        proposedDividendSizes.push(dividendSize);
    }

    function vote(uint256 dividendSize) public isStockholder {
        require(!stockholders[msg.sender].voted && dividendProposals[dividendSize] > 0
            && (lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals > block.timestamp
            && (lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals + timeToVote <= block.timestamp)));
        stockholders[msg.sender].voted = true;
        dividendProposals[dividendSize] += stockholders[msg.sender].stocksCount;
    }

    function payDividends() public isStockholder {
        require(lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals + timeToVote > block.timestamp);
        uint32 max_votes = 0;
        uint256 most_voted_dividends = 0;
        for (uint i = 0; i < proposedDividendSizes.length; i++) {
            if (dividendProposals[proposedDividendSizes[i]] > max_votes) {
                max_votes = dividendProposals[proposedDividendSizes[i]];
                most_voted_dividends = proposedDividendSizes[i];
            }
            delete dividendProposals[proposedDividendSizes[i]];
        } 
        delete proposedDividendSizes;
        for (uint i = 0; i < stockholderList.length; i++) {
            payable(stockholderList[i]).transfer(most_voted_dividends);
        }
        isMeeting = false;
    }

}
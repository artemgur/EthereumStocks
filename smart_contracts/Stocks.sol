// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

/*
Торговля акциями происходит так.
Акционер, который хочет продать акции, выставляет ордер на продажу с помощью функции sellOrder(). 
Для акции компании ордер создает директор с помощью функции companySellOrder().
В ордере указывается цена и количество акций.
Каждый акционер может выставить только 1 ордер на продажу. Это – ограничение реализации, а не бизнес-логики.
Акционер, который хочет купить акции, находит акционера, который выставил ордер на продажу, и покупает акции по его ордеру.
*/


/*
Собрание акционеров работает так.
Есть следующие фазы работы компании, они сменяют друг друга по времени:
1. Время между собраниями акционеров timeBetweenMeetings
2. Время на внесение предложений по размеру дивидендов minTimeToMakeProposals
3. Время на голосование timeToVote
4. Выплата дивидендов. Ее может запустить любой акционер после завершения фазы голосования. Выплата дивидендов перезапускает "цикл работы компании"
*/


contract Stocks {

    struct Stockholder {
        // Количество акций у акционера
        uint32 stocksCount;
        // Цена, по которой акционер готов продовать свои акции
        uint256 sellPrice;
        // Количество акций, которое акционер готов продать
        uint32 sellCount;
        // Проголосовал ли акционер на идущем собрании акционеров
        bool voted;
    }

    // Время между собраниями акционеров
    uint public constant timeBetweenMeetings = 3 minutes;
    // Время на внесение предложений по размерам дивидендов
    uint public constant minTimeToMakeProposals = 2 minutes;
    // Время на голосование
    uint public constant timeToVote = 2 minutes;

    // Директор компании
    address public director;
    // Общее количество акций
    uint32 public stocksCount;
    // Время предыдущего собрания акционеров
    uint public lastMeetingTime;
    // Идет ли сейчас собрание акционеров
    bool public isMeeting;

    // Адрес акционера => данные об акционере
    mapping(address => Stockholder) public stockholders;
    // Список акционеров компании. Нужен, так как не существует способа получить список ключей mapping
    address[] public stockholderList;

    // Предлагаемый размер дивиденда (на 1 акцию) => количество голосов за это предложение + 1 (так как единицей помечаются предложенные размеры дивиденда)
    mapping(uint256 => uint32) public dividendProposals;
    // Список предложенных размеров дивиденда. Нужен, так как не существует способа получить список ключей mapping
    uint256[] public proposedDividendSizes;

    // Тот, кто создал смарт-контракт, становится директором компании
    // _stocksCount – количество акций, которое будет выпущено
    // После конструктора нужно использовать функцию companySellOrder(), чтобы начать продажу акций
    constructor(uint32 _stocksCount) {
        director = msg.sender;
        stocksCount = _stocksCount;
        stockholders[address(this)].stocksCount = _stocksCount;
        lastMeetingTime = block.timestamp;
        stockholderList.push(address(this));
    }

    // modifier to check if caller is director
    modifier isDirector() {
        require(msg.sender == director, "Caller is not director");
        _;
    }

    modifier isStockholder() {
        require(stockholders[msg.sender].stocksCount != 0, "Caller is not stockholder");
        _;
    }

    modifier notLargerThanBalance(uint256 amount) {
        require(address(this).balance >= amount, "Amount is larger than balance");
        _;
    }


    // Отправить деньги на счет компании
    // Кто угодно может отправить деньги компании
    function deposit() public payable {}

    // Перевести все деньги компании на счет targetAddress. Только директор может выводить деньги компании
    // Во время собрания акционеров нельзя выводить деньги, так как это может сделать невозможной выплату дивидендов
    function withdraw(address payable targetAddress) public isDirector {
        require(!isMeeting, "You can't withdraw funds during the meeting, because it can make dividends impossible to pay");
        targetAddress.transfer(address(this).balance);
    }

    // Перевести сумму amount на счет targetAddress со счета компании. Только директор может выводить деньги компании
    // Во время собрания акционеров нельзя выводить деньги, так как это может сделать невозможной выплату дивидендов
    function withdraw(address payable targetAddress, uint256 amount) public isDirector notLargerThanBalance(amount) {
        require(!isMeeting, "You can't withdraw funds during the meeting, because it can make dividends impossible to pay");
        targetAddress.transfer(amount);
    }

    // Выставить ордер на продажу
    function sellOrder(uint256 sellPrice, uint32 sellCount) public {
        require(stockholders[msg.sender].stocksCount >= sellCount, "You are trying to create sell order for more stocks than you have");
        stockholders[msg.sender].sellPrice = sellPrice;
        stockholders[msg.sender].sellCount = sellCount;
    }

    // Выставить ордер на продажу акций, принадлежащих компании. Только директор может делать это
    function companySellOrder(uint256 sellPrice, uint32 sellCount) public isDirector {
        require(stockholders[address(this)].stocksCount >= sellCount, "You are trying to create sell order for more stocks than the company has");
        stockholders[address(this)].sellPrice = sellPrice;
        stockholders[address(this)].sellCount = sellCount;
    }

    // Купить акции по существующему ордеру на продажу
    // На эту функцию нужно отправить сумму денег, достаточную для покупки акций. При необходимости покупателю выплачивается сдача
    function buyStocks(address payable sellerStockholder, uint32 buyCount) public payable {
        require(stockholders[sellerStockholder].sellCount >= buyCount, "Attempted to buy more stocks than seller is willing to sell");
        require(msg.value >= stockholders[sellerStockholder].sellPrice * buyCount, "You didn't send enough money to buy stocks");
        uint256 transactionValue = stockholders[sellerStockholder].sellPrice * buyCount;
        stockholders[sellerStockholder].sellCount -= buyCount;
        stockholders[sellerStockholder].stocksCount -= buyCount;
        // Если акционер продал все свои акции, удаляем данные о нем
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
            delete stockholders[sellerStockholder];
        }
        if (stockholders[msg.sender].stocksCount == 0)
            stockholderList.push(msg.sender);
        stockholders[msg.sender].stocksCount += buyCount;
        if (sellerStockholder != address(this))
            sellerStockholder.transfer(transactionValue);
        // Сдача
        if (msg.sender != address(this))
            payable(msg.sender).transfer(msg.value - transactionValue);
    }
    
    // Выдвинуть предложение о размере дивидендов
    function makeDividendsProposal(uint256 dividendSize) public isStockholder {
        // Если время выдвижения предложений прошло, а предложений нет, начинаем встречу прямо сейчас
        if (lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals >= block.timestamp && proposedDividendSizes.length == 0)
            lastMeetingTime = block.timestamp - timeBetweenMeetings;
        require(lastMeetingTime + timeBetweenMeetings < block.timestamp, "Meeting time hasn't come");
        require(lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals >= block.timestamp, "Proposal time for this meeting has ended");
        require(dividendSize * stocksCount <= address(this).balance, "Company doesn't have enough money to pay that large dividends");
        isMeeting = true;
        // Пометка того, что этот размер дивидендов был предложен. На результаты голосования не влияет
        dividendProposals[dividendSize] = 1;
        proposedDividendSizes.push(dividendSize);
    }

    // Проголосовать за размер дивидендов
    // Этот размер дивидендов должен быть предложен в фазе предложений
    function vote(uint256 dividendSize) public isStockholder {
        require(!stockholders[msg.sender].voted, "You have already voted");
        require(dividendProposals[dividendSize] > 0, "This dividend amount hasn't been proposed");
        require(lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals < block.timestamp, "Voting time hasn't come");
        require(lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals + timeToVote >= block.timestamp, "Voting time for this meeting has ended");
        stockholders[msg.sender].voted = true;
        dividendProposals[dividendSize] += stockholders[msg.sender].stocksCount;
    }

    // Выплатить дивиденды в размере, выигравшем голосование
    // Также проводит очистку данных голосования
    function payDividends() public isStockholder {
        require(lastMeetingTime + timeBetweenMeetings + minTimeToMakeProposals + timeToVote < block.timestamp, "Dividends paying time hasn't come");
        require(isMeeting, "Dividends can only be paid at the end of a meeting");
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
            stockholders[stockholderList[i]].voted = false;
            if (stockholderList[i] != address(this))
                payable(stockholderList[i]).transfer(most_voted_dividends * stockholders[stockholderList[i]].stocksCount);
        }
        lastMeetingTime = block.timestamp;
        isMeeting = false;
    }

}
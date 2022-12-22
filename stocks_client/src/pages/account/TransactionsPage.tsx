import {useContext, useMemo} from "react";
import {TransactionsContext} from "../../contexts/TransactionsContext";
import {EthereumContext} from "../../contexts/EthereumContext";
import EthLogo from "../../assets/eth-logo.png";
import {Col, Collapse, Row, Typography} from 'antd';
import {TransactionReceipt} from "web3-core";
const { Panel } = Collapse;

const { Text } = Typography;

enum TransactionType {
    CONTRACT_CREATION = "Выпуск акций",
    WITHDRAWAL = "Withdrawal",
    BID = "Прочие действия",
}

const getTransactionType = (transaction: TransactionReceipt, account: string): TransactionType => {
    if (transaction.contractAddress) {
        return TransactionType.CONTRACT_CREATION;
    } else if (transaction.from === account) {
        return TransactionType.BID;
    } else if (transaction.to === account) {
        return TransactionType.WITHDRAWAL;
    }

    return TransactionType.BID;
}

const TransactionsPage = () => {
    const { web3, gasPrice, account } = useContext(EthereumContext);
    const { accountTransactions } = useContext(TransactionsContext);

    const transactionTable = useMemo(() => {
        if (accountTransactions && accountTransactions.length > 0) {
            return (
                <Collapse accordion>
                    {accountTransactions.map((transaction) => {
                        const transactionFee = web3 && web3.utils.fromWei((transaction.cumulativeGasUsed * +gasPrice).toString());
                        const type = getTransactionType(transaction, account);
                        const isWriteOff = [TransactionType.BID, TransactionType.CONTRACT_CREATION].includes(type);
                        return (
                            <Panel
                                key={transaction.transactionHash}
                                header={`${type} (${transactionFee} ETH)`}
                                showArrow={false}
                            >
                                <Col>
                                    <Row justify="space-between">
                                        <Col>
                                            <Text>
                                                Хэщ:
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Text strong>
                                                {transaction.transactionHash}
                                            </Text>
                                        </Col>
                                    </Row>
                                    <Row justify="space-between">
                                        <Col>
                                            <Text>
                                                Газа использовано:
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Text strong>
                                                {transaction.cumulativeGasUsed}
                                            </Text>
                                        </Col>
                                    </Row>
                                    <Row justify="space-between">
                                        <Col>
                                            <Text>
                                                Цена газа:
                                            </Text>
                                        </Col>
                                        <Col>
                                            <Text strong>
                                                {gasPrice} Wei
                                            </Text>
                                        </Col>
                                    </Row>
                                    <Row justify="space-between">
                                        <Col>
                                            Цена транзакции:
                                        </Col>
                                        <Row align="middle">
                                            <Col style={{
                                                marginRight: "4px",
                                            }}>
                                                <Text strong type={isWriteOff ? "danger" : "success"}>
                                                    {isWriteOff ? `-` : `+`} {transactionFee} ETH
                                                </Text>
                                            </Col>
                                            <img src={EthLogo} height="24" alt="Ethereum logo"/>
                                        </Row>
                                    </Row>
                                </Col>
                            </Panel>
                        )
                    })}
                </Collapse>
            )
        }

        return (
            <>Нет транзакций</>
        )
    }, [accountTransactions]);

    return (
        <>
            <h2>
                Транзакции
            </h2>
            {transactionTable}
        </>
    )
}

export default TransactionsPage;

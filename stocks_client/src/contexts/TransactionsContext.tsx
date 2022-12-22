import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import { TransactionReceipt } from "web3-core";
import {EthereumContext} from "./EthereumContext";

type TransactionsContextType = {
    transactions: TransactionReceipt[];
    accountTransactions: TransactionReceipt[];
    getTransactions: () => void,
}

export const TransactionsContext = createContext<TransactionsContextType>({
    transactions: [],
    accountTransactions: [],
    getTransactions: () => {},
})
TransactionsContext.displayName = "TransactionsContext";

const TransactionsContextProvider = ({ children }: any) => {
    const [transactions, setTransactions] = useState<TransactionReceipt[]>([]);

    const { web3, isAuth, account } = useContext(EthereumContext);

    const getTransactions = useCallback(() => {
        if (isAuth && web3) {
            web3.eth.getBlock(`latest`).then(async (block) => {
                const totalBlocks = block.number;
                const blockNums = [];
                for (let i = 0; i <= totalBlocks; i++) {
                    blockNums.push(i);
                }
                let rawTransactions = await Promise.all(
                    blockNums.map(
                        async (blockNum) => {
                            const block = await web3.eth.getBlock(blockNum)

                            return block.transactions;
                        }
                    )
                )

                rawTransactions = rawTransactions.filter((arr) => arr.length > 0);

                setTransactions(
                    await Promise.all(
                        rawTransactions.map(
                            async (arr) => {
                                return await web3.eth.getTransactionReceipt(arr[0]);
                            }
                        )
                    )
                )
            })
        }
    }, [isAuth])

    useEffect(() => {
        if (isAuth && web3 && account) {
            getTransactions();
        }
    }, [isAuth, web3, account]);

    const accountTransactions = useMemo(() => transactions.filter((transaction) => transaction.from === account), [account, transactions]);

    const value = {
        getTransactions,
        transactions,
        accountTransactions
    }
    return (
        <TransactionsContext.Provider value={value}>
            {children}
        </TransactionsContext.Provider>
    )
}

export default TransactionsContextProvider;

import {createContext, useContext, useEffect, useState} from "react";
import {Contract} from 'web3-eth-contract';
import {EthereumContext} from "./EthereumContext";
import contractCode from '../truffle/build/contracts/Stocks.json';
import {TransactionsContext} from "./TransactionsContext";

export type Stock = {
    readonly address: string;
    readonly name: string;
}

export type StockContextType = {
    readonly getStock: (address?: string) => Contract | null,
    readonly createStock: (stockAmount: number, stockName: string) => Promise<Contract> | null,
    readonly stocks: Stock[],
}

export type Stockholder = {
    stocksCount: number,
    sellPrice: number,
    sellCount: number,
    voted: boolean,
}

export const StockContext = createContext<StockContextType>({
    getStock: () => null,
    createStock: () => null,
    stocks: [],
});
StockContext.displayName = "StockContext";

const StockContextProvider = ({ children }: any) => {
    const { web3, account } = useContext(EthereumContext);
    const { transactions } = useContext(TransactionsContext);

    const [stocks, setStocks] = useState<Stock[]>([]);

    const getStock = (address?: string) => {
        if (web3) {
            return new web3.eth.Contract(contractCode.abi as any, address);
        }
        return null;
    }

    const getStocks = async () => {
        const addresses = transactions.map((transaction) => transaction.contractAddress).filter(c => !!c).map((c) => c ? c.toString() : ``);

        const arr = await Promise.all(addresses.map((address) => {
            const contract = getStock(address);
            if (contract) {
                return contract.methods.name().call().then((name: string) => ({
                    address,
                    name,
                }))
            }

            return null;
        }));

        setStocks(arr);
    }

    const createStock = (stockAmount: number, stockName: string): Promise<Contract> | null => {
        const contract = getStock();
        if (contract) {
            return contract.deploy({
                data: contractCode.bytecode,
                arguments: [stockAmount, stockName]
            }).send({
                from: account,
                gas: 6721975,
            });
        }

        return null;
    }

    useEffect(() => {
        getStocks();
    }, [transactions]);

    const value = {
        getStock,
        createStock,
        stocks,
    };

    return (
        <StockContext.Provider value={value}>
            {children}
        </StockContext.Provider>
    )
}

export default StockContextProvider;

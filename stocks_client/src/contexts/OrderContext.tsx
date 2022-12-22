import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {StockContext, Stockholder} from "./StockContext";
import {EthereumContext} from "./EthereumContext";

export type OrderProps = {
    readonly address: string,
    readonly sellPrice: number,
    readonly sellCount: number,
}

export type StockholderWithAddress = Stockholder & {
    readonly address: string,
    readonly name: string,
}

type OrderContextType = {
    readonly createOrder: (props: OrderProps) => Promise<any> | null;
    readonly createCompanyOrder: (props: OrderProps) => Promise<any> | null;
    readonly availableStocksToSell: StockholderWithAddress[];
    readonly availableCompanyStocksToSell: StockholderWithAddress[];
    readonly stockholderInfo: Promise<any[]>;
    readonly companyStockholderInfo: Promise<any[]>;
    readonly fetchOrders: () => void;

}

export const OrderContext = createContext<OrderContextType>({
    createOrder: () => null,
    createCompanyOrder: () => null,
    availableStocksToSell: [],
    availableCompanyStocksToSell: [],
    stockholderInfo: new Promise<any[]>(() => {}),
    companyStockholderInfo: new Promise<any[]>(() => {}),
    fetchOrders: () => {},
});

const OrderContextProvider = ({ children }: any) => {
    const { account, web3 } = useContext(EthereumContext);
    const { getStock, stocks } = useContext(StockContext);

    const encode = (value: number, type: string) => {
        if (web3) {
            return web3.eth.abi.encodeParameter(type, value)
        }

        return null;
    }

    const createOrder = (props: OrderProps) => {
        const contract = getStock(props.address);
        if (contract) {
            return contract.methods.sellOrder(encode(props.sellPrice, "uint256"), encode(props.sellCount, "uint32")).send({from: account});
        }

        return null;
    }

    const createCompanyOrder = (props: OrderProps) => {
        const contract = getStock(props.address);
        if (contract) {
            return contract.methods.companySellOrder(encode(props.sellPrice, "uint256"), encode(props.sellCount, "uint32")).send({from: account});
        }

        return null;
    }

    const [availableStocksToSell, setAvailableStocks] = useState<StockholderWithAddress[]>([]);
    const [availableCompanyStocksToSell, setAvailableCompanyStocks] = useState<StockholderWithAddress[]>([]);

    const getStockholderInfo = useCallback(async (withAccount = true) => {
        return Promise.all(stocks.map((s) => {
            const contract = getStock(s.address);
            if (contract) {
                const stockholders = contract.methods.stockholders;
                const variable = withAccount ? stockholders(account) : stockholders(s.address);
                return variable.call().then((obj: any) => {
                    return ({
                        stocksCount: +obj.stocksCount,
                        sellPrice: +obj.sellPrice,
                        sellCount: +obj.sellCount,
                        voted: obj.voted,
                        address: s.address,
                        name: s.name,
                    })
                });
            }

            return null;
        }))
    }, [stocks, account]);

    const processStockholderInfo = (stockholders: Promise<any[]>, setFunc: any) => {
        stockholders.then((awaitedStockholders) => {
            setFunc(
                awaitedStockholders
                    .filter(s => !!s)
                    .filter(
                        (stockholder) => stockholder.stocksCount > 0 && stockholder.sellCount === 0
                    )
            );
        });
    }

    const stockholderInfo = getStockholderInfo();

    const companyStockholderInfo = getStockholderInfo(false);

    const fetchOrders = () => {
        processStockholderInfo(stockholderInfo, setAvailableStocks);
        processStockholderInfo(companyStockholderInfo, setAvailableCompanyStocks);
    }

    useEffect(() => {
        fetchOrders();
    }, [stocks]);

    const value: OrderContextType = {
        stockholderInfo,
        companyStockholderInfo,
        createOrder,
        createCompanyOrder,
        availableStocksToSell,
        availableCompanyStocksToSell,
        fetchOrders,
    }

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    )
}

export default OrderContextProvider;

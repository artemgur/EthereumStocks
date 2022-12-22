import {Col, List, Row, Typography} from "antd";
import {useContext, useEffect, useState} from "react";
import {StockContext} from "../../contexts/StockContext";
import {EthereumContext} from "../../contexts/EthereumContext";
import {NavLink} from "react-router-dom";

const { Title } = Typography;

const MyStocksPage = () => {
    const { stocks, getStock } = useContext(StockContext);
    const { account } = useContext(EthereumContext);

    const [stockList, setStockList] = useState<any[]>([]);

    const getDetailedStocks = async () => {
        const array = (await Promise.all(stocks.map((stock) => {
            const contract = getStock(stock.address);
            if (contract) {
                return contract.methods.stockholders(account).call().then((obj: any) => ({
                    stocksCount: +obj.stocksCount,
                    address: stock.address,
                    name: stock.name,
                })).catch(() => null)
            }
            return null;
        }))).filter((s) => !!s).filter((s) => s.stocksCount > 0);

        setStockList(array);
    }

    useEffect(() => {
        getDetailedStocks();
    }, [stocks]);

    return (
        <Col>
            <Row>
               <Title level={1}>
                   Мои акции
               </Title>
            </Row>
            <Row>
                <List
                    bordered
                    dataSource={stockList}
                    renderItem={(item) => (
                        <List.Item>
                            <NavLink to={`/stocks/${item.address}`}>
                                {item.name} ({item.stocksCount})
                            </NavLink>
                        </List.Item>
                    )}
                />
            </Row>
        </Col>
    );
}

export default MyStocksPage;

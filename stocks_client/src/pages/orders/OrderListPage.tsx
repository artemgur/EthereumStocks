import {useContext, useEffect, useState} from "react";
import {OrderContext, StockholderWithAddress} from "../../contexts/OrderContext";
import {Button, Col, Collapse, Divider, List, Row, Typography} from "antd";
import {EthereumContext} from "../../contexts/EthereumContext";
import {useNavigate} from "react-router-dom";

const { Text, Title } = Typography;

const { Panel } = Collapse;

const OrderListPage = () => {
    const { stockholderInfo, companyStockholderInfo } = useContext(OrderContext);

    const { status } = useContext(EthereumContext);

    const [commonOrders, setCommonOrders] = useState<StockholderWithAddress[]>([]);
    const [companyOrders, setCompanyOrders] = useState<StockholderWithAddress[]>([]);

    const extractOrders = (stockholders: StockholderWithAddress[]): StockholderWithAddress[] => {
        return stockholders.filter(s => !!s).filter(s => s.sellCount > 0);
    }

    useEffect(() => {
        if (commonOrders.length === 0) {
            companyStockholderInfo.then((stockholders) => setCompanyOrders(extractOrders(stockholders)));
        }
    }, [commonOrders, companyStockholderInfo]);

    useEffect(() => {
        if (companyOrders.length === 0) {
            stockholderInfo.then((stockholders) => setCommonOrders(extractOrders(stockholders)));
        }
    }, [stockholderInfo]);

    const navigate = useNavigate();

    const redirect = (address: string) => {
        navigate(`/stocks/${address}`)
    }

    return (
        <Col>
            <Row>
                <Title>
                    Список ордеров
                </Title>
            </Row>
            {status === "director" && companyOrders.length > 0 && (
                <Row>
                    <Divider orientation="left">
                        Ордеры компании
                    </Divider>
                    <Collapse>
                        {companyOrders.map((order) => (
                            <Panel key={order.address} header={order.name}>
                                <Row>
                                    Кол-во: {order.sellCount}
                                </Row>
                                <Row>
                                    Цена: {order.sellPrice}
                                </Row>
                                <Row>
                                    <Button onClick={() => redirect(order.address)}>
                                        Перейти к акции
                                    </Button>
                                </Row>
                            </Panel>
                        ))}
                    </Collapse>
                </Row>
            )}
            {companyOrders.length === 0 && commonOrders.length === 0 && (
                <Row>
                    Ордеров пока нет
                </Row>
            )}
            {commonOrders && commonOrders.length > 0 && (
                <Row>
                    <Divider orientation="left">
                        Личные ордеры
                    </Divider>
                    <Collapse>
                        {commonOrders.map((order) => (
                            <Panel key={order.address} header={order.name}>
                                <Row>
                                    Кол-во: {order.sellCount}
                                </Row>
                                <Row>
                                    Цена: {order.sellPrice}
                                </Row>
                                <Row>
                                    <Button onClick={() => redirect(order.address)}>
                                        Перейти к акции
                                    </Button>
                                </Row>
                            </Panel>
                        ))}
                    </Collapse>
                </Row>
            )}
        </Col>
    )
}

export default OrderListPage;

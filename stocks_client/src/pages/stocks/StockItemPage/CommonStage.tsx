import {Button, Col, Collapse, Divider, Form, InputNumber, Row} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {EthereumContext} from "../../../contexts/EthereumContext";
import {StockholderWithAddress} from "../../../contexts/OrderContext";

const { Panel } = Collapse;

type CommonStageProps = {
    readonly isMeetingAvailable: boolean;
    readonly methods: any,
    readonly fetchInfo: () => void,
    readonly time: number,
    readonly isStockholder: boolean,
}

const CommonStage = ({ methods, fetchInfo, isMeetingAvailable, time, isStockholder }: CommonStageProps) => {
    const navigate = useNavigate();
    const { account } = useContext(EthereumContext);
    const params = useParams();
    const id = params.id;
    const [orders, setOrders] = useState<StockholderWithAddress[]>([]);

    const getStockholderList = async () => {
        const arr: string[] = [];
        try {
            let i = 0;
            while (true) {
                const s = await methods.stockholderList(i).call();
                arr.push(s);
                i++;
            }
        } catch (e) {}

        const stockholders = await Promise.all(arr.map((stockholder) => methods.stockholders(stockholder).call().then((obj: any) => {
            return ({
                stocksCount: +obj.stocksCount,
                sellPrice: +obj.sellPrice,
                sellCount: +obj.sellCount,
                voted: obj.voted,
                address: stockholder,
            })
        })));

        setOrders(stockholders.filter((s) => s.sellCount > 0));
    }

    useEffect(() => {
        getStockholderList()
    }, []);

    const handleMakeProposal = (values: any) => {
        methods.makeDividendsProposal(values.dividendSize).send({from: account, gas: 1500000}).then(() => {
            fetchInfo();
        });
    }

    return (
        <Col>
            {isStockholder && !!time && time > 0 && (
                <Row>
                    Следующее собрание аукционеров можно провести через {Math.floor(time / 1000)} секунд
                </Row>
            )}
            {isMeetingAvailable && (
                <Row>
                    <Divider orientation="left">
                        Собрание аукционеров
                    </Divider>
                    <Form onFinish={handleMakeProposal}>
                        <Form.Item>
                            <Form.Item
                                name="dividendSize"
                                label="Размер дивидендов"
                                rules={[{required: true}]}
                            >
                                <InputNumber min={0}/>
                            </Form.Item>
                            <Button type="primary" htmlType="submit">
                                Внести предложение
                            </Button>
                        </Form.Item>
                    </Form>
                </Row>
            )}
            {orders && orders.length > 0 && (
                <Row>
                    <Divider orientation="left">
                        Ордеры
                    </Divider>
                    <Collapse>
                        {orders.map((order) => {
                            const handleFinish = (values: any) => {
                                const amount = values.amount;
                                methods.buyStocks(order.address, values.amount).send({
                                    from: account,
                                    value: amount * order.sellPrice,
                                    gas: 1000000,
                                }).then(() => {
                                    navigate(`/stocks/my`);
                                });
                            }
                            return (
                                <Panel key={order.address} header={order.address === id ? `Компания` : order.address}>
                                    <Row>
                                        Кол-во: {order.sellCount}
                                    </Row>
                                    <Row>
                                        Цена: {order.sellPrice}
                                    </Row>
                                    {order.address.toString().toLowerCase() !== account && (
                                        <Form onFinish={handleFinish}>
                                            <Form.Item
                                                name="amount"
                                                label="Количество акций"
                                                rules={[{required: true}]}
                                                help={`Максимум: ${order.sellCount}`}
                                            >
                                                <InputNumber min={0} max={order.sellCount}/>
                                            </Form.Item>
                                            <Form.Item>
                                                <Button type="primary" htmlType="submit">
                                                    Купить
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    )}
                                </Panel>
                            )
                        })}
                    </Collapse>
                </Row>
            )}
        </Col>
    )
}

export default CommonStage;

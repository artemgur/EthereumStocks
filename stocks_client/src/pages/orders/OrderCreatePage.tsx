import {createRef, useContext, useState} from "react";
import {OrderContext, OrderProps, StockholderWithAddress} from "../../contexts/OrderContext";
import {EthereumContext} from "../../contexts/EthereumContext";
import {Button, Col, Form, FormInstance, InputNumber, Row, Typography, Select, Switch} from "antd";
import {useNavigate} from "react-router-dom";

const { Text, Title } = Typography;

const OrderCreatePage = () => {
    const { status } = useContext(EthereumContext);
    const {
        createOrder,
        createCompanyOrder,
        availableCompanyStocksToSell,
        availableStocksToSell,
        fetchOrders,
    } = useContext(OrderContext);

    const navigate = useNavigate();

    const [creating, setCreating] = useState<boolean>(false);

    const [isCompanyOrder, setCompanyOrder] = useState<boolean>(false);

    const ref = createRef<FormInstance>();

    const [selectedStock, setSelectedStock] = useState<StockholderWithAddress | null>(null);

    const stocksToSell = isCompanyOrder ? availableCompanyStocksToSell : availableStocksToSell;

    const handleSelect = (item: any) => {
        setSelectedStock(stocksToSell.find(s => s.address === item) || null);
    }

    const onFinish = (values: any) => {
        const orderProps: OrderProps = {
            address: values.stock,
            sellPrice: +values.price,
            sellCount: +values.amount,
        }

        const createFunc = values.switch ? createCompanyOrder : createOrder;

        setCreating(true);
        createFunc(orderProps)?.then(() => {
            fetchOrders();
            navigate(`/orders`);
        }).finally(() => {
            setCreating(false);
        });
    }

    const options = stocksToSell.map((stock) => ({
        value: stock.address,
        label: stock.name,
    }))

    return (
        <Col>
            <Row>
                <Title level={1}>
                    Создание ордера
                </Title>
            </Row>
            <Row>
                <Form ref={ref} name="create-form" onFinish={onFinish}>
                    {status === "director" && (
                        <Form.Item
                            name="switch"
                            label="От имени компании"
                        >
                            <Switch onChange={setCompanyOrder}/>
                        </Form.Item>
                    )}
                    <Form.Item
                        name="stock"
                        label="Акция"
                        rules={[{ required: true }]}
                        help="Обязательное поле"
                    >
                        <Select
                            options={options}
                            onChange={handleSelect}
                        />
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        label="Количество акций"
                        rules={[{ required: true }]}
                        help={selectedStock && `Максимум: ${selectedStock?.stocksCount}`}
                    >
                        <InputNumber
                            min={1}
                            max={selectedStock?.stocksCount}
                        />
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Цена"
                        rules={[{ required: true }]}
                        help="Обязательное поле"
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item>
                        <Button loading={creating} type="primary" htmlType="submit">
                            Создать
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </Col>
    )
}

export default OrderCreatePage;

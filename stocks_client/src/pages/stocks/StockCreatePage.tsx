import {createRef, useContext, useEffect, useState} from "react";
import {EthereumContext} from "../../contexts/EthereumContext";
import {useNavigate} from "react-router-dom";
import {StockContext} from "../../contexts/StockContext";
import {Button, Col, Form, FormInstance, Input, InputNumber, Row, Typography} from "antd";
import {TransactionsContext} from "../../contexts/TransactionsContext";
const { Title } = Typography;

const StockCreatePage = () => {
    const { status } = useContext(EthereumContext);
    const { createStock } = useContext(StockContext);
    const { getTransactions } = useContext(TransactionsContext);
    const [creating, setCreating] = useState<boolean>(false);
    const navigate = useNavigate();

    const ref = createRef<FormInstance>();

    useEffect(() => {
        if (status && status !== "director") {
            navigate("/");
        }
    }, [status]);

    const onFinish = (val: any) => {
        setCreating(true);
        const amount = +val.amount;
        const promise = createStock(amount, val.name);
        if (promise) {
            promise.then((contract) => {
                const address = contract.options.address;
                getTransactions();
                navigate(`/stocks/${address}`);
            }).finally(() => {
                setCreating(false);
            })
        }
        setCreating(false);
    }

    return (
        <Col>
            <Row>
                <Title level={1}>
                    Выпуск акций
                </Title>
            </Row>
            <Row>
                <Form ref={ref} name="create-form" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Название акции"
                        rules={[{ required: true }]}
                        help="Обязательное поле"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        label="Кол-во акций"
                        rules={[{ required: true }]}
                        help="Обязательное поле"
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item>
                        <Button loading={creating} type="primary" htmlType="submit">
                            Выпуск
                        </Button>
                    </Form.Item>
                </Form>
            </Row>
        </Col>
    );
}

export default StockCreatePage;

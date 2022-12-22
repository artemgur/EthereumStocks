import {useContext} from "react";
import {StockContext} from "../../contexts/StockContext";
import {Button, Col, List, Row, Typography} from "antd";
import {NavLink, useNavigate} from "react-router-dom";
import {EthereumContext} from "../../contexts/EthereumContext";

const { Title } = Typography;

const StockListPage = () => {
    const { stocks } = useContext(StockContext);
    const { status } = useContext(EthereumContext);
    const navigate = useNavigate();

    const handleCreate = () => {
        navigate(`/stocks/create`);
    }

    return (
        <Col>
            <Row>
                <Title level={1}>
                    Список акций
                </Title>
            </Row>
            {status && status === "director" && (
                <Row>
                    <Button onClick={handleCreate}>
                        Выпустить акцию
                    </Button>
                </Row>
            )}
            <Row>
                <List
                    bordered
                    dataSource={stocks}
                    renderItem={(item) => (
                        <List.Item>
                            <NavLink to={`/stocks/${item.address}`}>
                                {item.name}
                            </NavLink>
                        </List.Item>
                    )}
                />
            </Row>
        </Col>
    );
}

export default StockListPage;

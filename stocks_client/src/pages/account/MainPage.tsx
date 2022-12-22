import {useContext} from "react";
import {AccountStatus, EthereumContext} from "../../contexts/EthereumContext";
//@ts-ignore
import contractCode from '../truffle/build/contracts/Storage.json';
import {Button, Col} from "antd";
import Typography from "antd/lib/typography";

const { Title } = Typography;

export const MainPage = () => {
    const { account, status, balance } = useContext(EthereumContext);

    const statusMapping: Record<AccountStatus, string> = {
        common: "Пользователь",
        director: "Директор",
    }

    return (
        <Col>
            <Title level={2}>
                {account}
            </Title>
            <Title level={3}>
                Баланс: {balance} ETH
            </Title>
            {status && (
                <Title level={3}>
                    Cтатус: {statusMapping[status]}
                </Title>
            )}
        </Col>
    )
}

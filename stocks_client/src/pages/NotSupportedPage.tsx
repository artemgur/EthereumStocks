import {Col, Row, Typography} from "antd";
import MetamaskLogo from '../assets/MetaMask.png';

const { Text, Link } = Typography;

const NotSupportedPage = () => {
    return (
        <Col>
            <Row justify="center">
                <img src={MetamaskLogo} height={200} alt="Metamask logo"/>
            </Row>
            <Row justify="center">
                <Text>
                    Мы заметили, что в Вашем браузере не установлен Metamask
                </Text>
            </Row>
            <Row justify="center">
                <Text>
                    Чтобы использовать наше приложение Вам нужно установить <Link href="https://metamask.io/download/" target="_blank">расширение Metamask</Link>
                </Text>
            </Row>
        </Col>
    )
}

export default NotSupportedPage;

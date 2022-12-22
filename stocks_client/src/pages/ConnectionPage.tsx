import {Button, Col, Row} from "antd";
import React, {useContext} from "react";
import {EthereumContext} from "../contexts/EthereumContext";
import MetamaskLogo from "../assets/MetaMask.png";

const ConnectionPage = () => {
    const { connect } = useContext(EthereumContext);

    return (
        <Col>
            <Row justify="center">
                <img src={MetamaskLogo} height={200} alt="Metamask logo"/>
            </Row>
            <Row justify="center" align="middle" style={{
                marginBottom: "10px"
            }}>
                Чтобы использовать приложение, Вам нужно авторизоваться в Metamask
            </Row>
            <Row justify="center" align="middle">
                <Button onClick={connect}>
                    Подключиться к Metamask
                </Button>
            </Row>
        </Col>
    );
}

export default ConnectionPage;

import {Router} from "../Router";
import React, {useContext, useEffect, useState} from "react";
import {EthereumContext} from "../contexts/EthereumContext";
import {Row} from "antd";
import {
    Loading3QuartersOutlined,
} from '@ant-design/icons';
import ConnectionPage from "./ConnectionPage";

const LoadingPage = () => {
    const [isLoading, setLoading] = useState(true);

    const { isAuth } = useContext(EthereumContext);

    useEffect(() => {
        if (isAuth) {
            setLoading(false);
        }
    }, [isAuth]);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }, []);


    if (isLoading) {
        return (
            <Row align="middle" justify="center">
                <Loading3QuartersOutlined style={{
                    color: "#4096ff",
                    fontSize: "50px",
                    marginTop: "20px",
                }} spin/>
            </Row>
        )
    }

    if (!isAuth) {
        return (<ConnectionPage/>)
    }

    return (
        <Router/>
    )
}

export default LoadingPage;

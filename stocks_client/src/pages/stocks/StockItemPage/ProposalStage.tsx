import {Button, Col, Divider, Form, InputNumber, List, Row} from "antd";
import {useContext} from "react";
import {EthereumContext} from "../../../contexts/EthereumContext";

type ProposalStageProps = {
    readonly methods: any,
    readonly proposals: string[],
    readonly fetchInfo: () => void,
    readonly time: number,
}

const ProposalStage = ({ methods, fetchInfo, proposals, time }: ProposalStageProps) => {
    const { account } = useContext(EthereumContext);
    const handleMakeProposal = (values: any) => {
        methods.makeDividendsProposal(values.dividendSize).send({from: account, gas: 1500000}).then(() => {
            fetchInfo();
        });
    }
    return (
        <Col>
            <Divider orientation="left">
                Период предложений
            </Divider>
            <Row>
                Вносить предложения можно еще {Math.floor(time / 1000)} секунд
            </Row>
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
            <List
                bordered
                dataSource={proposals}
                renderItem={(item) => (
                    <List.Item>
                        {item}
                    </List.Item>
                )}
            />
        </Col>
    )
}

export default ProposalStage;

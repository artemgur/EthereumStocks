import {Button, Col, Divider, List, Row} from "antd";
import {useContext} from "react";
import {EthereumContext} from "../../../contexts/EthereumContext";

type VoteStageProps = {
    readonly methods: any,
    readonly proposals: string[],
    readonly fetchInfo: () => void,
    readonly voted: boolean,
    readonly time: number,
}

const VoteStage = ({ methods, fetchInfo, proposals, voted, time }: VoteStageProps) => {
    const { account } = useContext(EthereumContext);
    return (
        <Col>
            <Divider orientation="left">
                Период голосования
            </Divider>
            <Row>
                Голосовать будет идти еще {Math.floor(time / 1000)} секунд
            </Row>
            {voted ? (
                <Row>
                    Вы уже проголосовали
                </Row>
            ) : (
                <List
                    bordered
                    dataSource={proposals}
                    renderItem={(item) => {
                        const vote = () => {
                            methods.vote(item).send({
                                from: account,
                                gas: 1500000
                            }).then(() => {
                                fetchInfo();
                            });
                        }
                        return (
                            <List.Item>
                                <Row>
                                    <Col style={{
                                        margin: "0 10px 0 0"
                                    }}>
                                        {item}
                                    </Col>
                                    <Col>
                                        <Button type="primary" onClick={vote}>
                                            Голосовать
                                        </Button>
                                    </Col>
                                </Row>
                            </List.Item>
                        )
                    }}
                />
            )}
        </Col>
    );
}

export default VoteStage;

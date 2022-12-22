import {Button, Col, Divider, Row} from "antd";
import {useContext, useEffect, useState} from "react";
import {EthereumContext} from "../../../contexts/EthereumContext";
import {StockholderWithAddress} from "../../../contexts/OrderContext";

type DividendStageProps = {
    readonly methods: any,
    readonly fetchInfo: () => void,
    readonly proposals: string[],
}

const DividendStage = ({ methods, fetchInfo, proposals }: DividendStageProps) => {
    const { account } = useContext(EthereumContext);
    const handleGetDividends = () => {
        methods.payDividends().send({from: account, gas: 1500000}).then(() => {
            fetchInfo();
        });
    }

    const [chosenProposal, setChosenProposal] = useState<string | undefined>();

    const getChosenProposal = async () => {
        let records = await Promise.all(proposals.map(async (proposal) => ({
            votes: await methods.dividendProposals(proposal).call().then((a: string) => +a),
            proposal,
        })));

        records = records.sort((a, b) => b.votes - a.votes);

        if (records.length > 0) {
            setChosenProposal(records[0].proposal);
        }
    }

    useEffect(() => {
        if (!chosenProposal) {
            getChosenProposal();
        }
    }, [proposals, chosenProposal]);


    return (
        <Col>
            <Divider orientation="left">
                Стадия дивидендов
            </Divider>
            {!!chosenProposal && (
                <Row style={{
                    margin: "10px 0",
                }}>
                    Выбранное предложение: {chosenProposal}
                </Row>
            )}
            <Button type="primary" onClick={handleGetDividends}>
                Получить дивиденды
            </Button>
        </Col>
    )
}

export default DividendStage;

import {useParams} from "react-router-dom";
import {Col, Row, Typography} from "antd";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {StockContext, Stockholder} from "../../../contexts/StockContext";
import {EthereumContext} from "../../../contexts/EthereumContext";
import CommonStage from "./CommonStage";
import DividendStage from "./DividendStage";
import ProposalStage from "./ProposalStage";
import VoteStage from "./VoteStage";

const { Text, Title } = Typography;

const StockItemPage = () => {
    const params = useParams();
    const id = params.id;

    const [error, setError] = useState<Error | null>(null);

    const [stocksCount, setStockCount] = useState<number | undefined>();
    const [lastMeetingDate, setLastMeetingDate] = useState<Date | undefined>();
    const [isMeeting, setMeeting] = useState<boolean | undefined>();
    const [name, setName] = useState<string | undefined>();

    const [timeBetweenMeetings, setTimeBetweenMeetings] = useState<number | undefined>();
    const [minTimeToMakeProposals, setProposalTime] = useState<number | undefined>();
    const [timeToVote, setVoteTime] = useState<number | undefined>();

    const [stockholder, setStockholder] = useState<Stockholder | null>();

    const { getStock } = useContext(StockContext);

    const { account, web3 } = useContext(EthereumContext);

    const callback = (func: (value: any) => void) => {
        return (err: Error, res: any) => {
            if (err) setError(err);
            func(res);
        }
    }

    const contract = useMemo(() => {
        return getStock(id);
    }, [id]);

    const methods = useMemo(() => contract?.methods, [contract]);

    const getVariable = useCallback((varName: string, arg?: any) => {
        const variable = methods[varName];
        if (arg) {
            return variable(arg)
        }

        return methods[varName]()
    }, [methods]);

    const [proposals, setProposals] = useState<string[]>([]);

    const getProposals = async () => {
        const arr: string[] = [];
        try {
            let i = 0;
            while (true) {
                const s = await methods.proposedDividendSizes(i).call();
                arr.push(s);
                i++;
            }
        } catch (e) {}

        setProposals(arr);
    }

    const fetchInfo = () => {
        if (contract) {
            getVariable("stocksCount").call(callback((count) => setStockCount(+count)));
            getVariable("lastMeetingTime").call(callback((time) => {
                setLastMeetingDate(new Date(time * 1000));
            }));
            getVariable("isMeeting").call(callback(setMeeting));
            getVariable("timeBetweenMeetings").call(callback((time) => setTimeBetweenMeetings(time * 1000)));
            getVariable("minTimeToMakeProposals").call(callback((time) => setProposalTime(time * 1000)));
            getVariable("timeToVote").call(callback((time) => setVoteTime(time * 1000)));
            getVariable("stockholders", account).call(callback((obj) => {
                setStockholder({
                    stocksCount: +obj.stocksCount,
                    sellPrice: +obj.sellPrice,
                    sellCount: +obj.sellCount,
                    voted: obj.voted,
                });
            }));
            getVariable("name").call(callback(setName));
            getProposals();
        }
    }

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        fetchInfo();
    }, [contract, account]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
            fetchInfo();
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    const isStockholder = stockholder && stockholder.stocksCount;

    const diff = lastMeetingDate && now.getTime() - lastMeetingDate.getTime();

    const isMeetingAvailable = isStockholder && timeBetweenMeetings && !isMeeting && diff && diff > timeBetweenMeetings;

    const isProposalPeriod = !isMeetingAvailable && isStockholder && timeBetweenMeetings && isMeeting && minTimeToMakeProposals && diff && diff < timeBetweenMeetings + minTimeToMakeProposals;

    const isVotePeriod = !isProposalPeriod && isStockholder && timeBetweenMeetings && isMeeting && minTimeToMakeProposals && timeToVote && diff && diff < timeBetweenMeetings + minTimeToMakeProposals + timeToVote;

    const isDividendsPeriod = isStockholder && timeBetweenMeetings && isMeeting && minTimeToMakeProposals && timeToVote && diff && diff > timeBetweenMeetings + minTimeToMakeProposals + timeToVote;

    useEffect(() => {
        if (isProposalPeriod) {
            getProposals();
        }
    }, [isProposalPeriod]);

    if (error) {
        return (
            <>
                Серверная ошибка, невалидная акция
            </>
        );
    }

    return (
        <Col>
            {name && (
                <Row>
                    <Title level={1}>
                        {name}
                    </Title>
                </Row>
            )}
            <Row>
                <Text>
                    Всего акций в обороте: {stocksCount}
                </Text>
            </Row>
            {!!isStockholder && (
                <Row>
                    <Text>
                        Кол-во акций у Вас: {stockholder.stocksCount}
                    </Text>
                </Row>
            )}
            {!isMeeting && (
                <CommonStage isStockholder={!!isStockholder} time={(timeBetweenMeetings || 0) - (diff || 0)} isMeetingAvailable={!!isMeetingAvailable} methods={methods} fetchInfo={fetchInfo}/>
            )}
            {!!isProposalPeriod && (
                <ProposalStage time={((timeBetweenMeetings || 0) + (minTimeToMakeProposals || 0)) - (diff || 0)} proposals={proposals} methods={methods} fetchInfo={fetchInfo}/>
            )}
            {!!isVotePeriod && (
                <VoteStage time={((timeBetweenMeetings || 0) + (minTimeToMakeProposals || 0) + (timeToVote || 0)) - (diff || 0)} voted={stockholder.voted} proposals={proposals} methods={methods} fetchInfo={fetchInfo} />
            )}
            {!!isDividendsPeriod && (
                <DividendStage proposals={proposals} methods={methods} fetchInfo={fetchInfo}/>
            )}
        </Col>
    )
}

export default StockItemPage;

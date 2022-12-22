import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Web3 from "web3";
import {FirebaseContext} from "./FirebaseContext";

declare global {
    interface Window {
        readonly ethereum: {
            readonly isConnected: () => boolean;
            readonly request: (params: any) => Promise<any>;
            readonly on: (event: string, handler: (info?: any) => void) => void;
        }
    }
}

export type AccountStatus = "common" | "director";

type EthereumContextType = {
    readonly isConnected: boolean;
    readonly isAuth: boolean;
    readonly account: string;
    readonly balance: number;
    readonly status: AccountStatus | null;

    readonly web3: Web3 | null;

    readonly gasPrice: string;

    readonly connect: () => void;
}


export const EthereumContext = createContext<EthereumContextType>({
    isAuth: false,
    isConnected: false,
    account: ``,
    status: null,
    balance: 0,
    web3: null,
    gasPrice: ``,
    connect: () => {}
});
EthereumContext.displayName = "EthereumContext";

const EthereumContextProvider = ({ children }: any) => {
    const { firestore } = useContext(FirebaseContext);

    const [isConnected, setConnected] = useState<boolean>(window.ethereum.isConnected());
    const [isAuth, setAuth] = useState<boolean>(false);
    const [account, setAccount] = useState<string>(``);
    const [status, setStatus] = useState<AccountStatus | null>(null);
    const [balance, setBalance] = useState<number>(0);

    const web3 = useMemo(() => {
        if (isConnected) {
            return new Web3(process.env.REACT_APP_BLOCKCHAIN_URL || ``);
        } else {
            return null;
        }
    }, [isConnected]);

    const [gasPrice, setGasPrice] = useState<string>(`0`);

    const authorize = (accounts: any[]) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setAuth(true);
        }
    }

    window.ethereum.on(`connect`, () => {
        setConnected(true);
    })

    const getBalance = useCallback(() => {
        if (web3) {
            window.ethereum
                .request({ method: 'eth_getBalance', params: [account, 'latest'] })
                .then((resp) => {
                    setBalance(+web3.utils.fromWei(resp));
                })
        }
    }, [account, web3]);

    const getStatus = () => {
        const docRef = doc(firestore, "account", account);
        getDoc(docRef).then((snapshot) => {
            if (snapshot.exists()) {
                setStatus(snapshot.data().status);
            } else {
                const metaRef = doc(firestore, "account", "meta");
                getDoc(metaRef).then((accountShot) => {
                    if (accountShot.exists()) {
                        const total = accountShot.data().total;
                        const s: AccountStatus = total > 0 ? "common" : "director";
                        setStatus(s);
                        setDoc(docRef, {
                            status: s,
                        });
                        setDoc(metaRef, {
                            total: total + 1,
                        })
                    }
                })
            }
        });
    }

    useEffect(() => {
        if (account) {
            getBalance();
            getStatus();
        }
    }, [account]);

    const getAccounts = () => {
        window.ethereum.request({ method: 'eth_accounts' }).then(authorize);
    }

    const connect = () => {
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(authorize);
    }

    window.ethereum.on('accountsChanged', (info) => {
        window.location.reload();
    })

    const disconnect = () => {
        setConnected(false);
        setAccount(``);
        setBalance(0);
    }

    const getGasPrice = () => {
        web3 && web3.eth.getGasPrice().then((price) => {
            setGasPrice(price);
        })
    }

    useEffect(() => {
        if (!isAuth && isConnected) {
            getAccounts();
        }
    }, [isAuth, isConnected]);

    useEffect(() => {
        if (isAuth && web3) {
            getGasPrice();
        }
    }, [isAuth, web3]);

    const value = {
        isConnected,
        isAuth,
        account,
        status,
        balance,
        connect,
        web3,
        gasPrice,
    };

    return (
        <EthereumContext.Provider value={value}>
            {children}
        </EthereumContext.Provider>
    )
}

export default EthereumContextProvider;

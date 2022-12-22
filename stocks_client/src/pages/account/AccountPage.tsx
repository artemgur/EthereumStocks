import { Outlet } from "react-router-dom";
import TransactionsContextProvider from "../../contexts/TransactionsContext";

const AccountPage = () => {
    return (
        <TransactionsContextProvider>
            <Outlet/>
        </TransactionsContextProvider>
    )
}

export default AccountPage;

import { Route, Routes } from "react-router-dom";
import {MainPage} from "./pages/account/MainPage";
import AppLayout from "./layout/AppLayout";
import AccountPage from "./pages/account/AccountPage";
import TransactionsPage from "./pages/account/TransactionsPage";
import OrderListPage from "./pages/orders/OrderListPage";
import OrderCreatePage from "./pages/orders/OrderCreatePage";
import StockListPage from "./pages/stocks/StockListPage";
import MyStocksPage from "./pages/stocks/MyStocksPage";
import StockCreatePage from "./pages/stocks/StockCreatePage";
import StockItemPage from "./pages/stocks/StockItemPage";
import StockPage from "./pages/stocks/StockPage";
import OrderPage from "./pages/orders/OrderPage";

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<AppLayout/>}>
                <Route index element={<MainPage/>}/>
                <Route path="account" element={<AccountPage/>}>
                    <Route path="transactions" element={<TransactionsPage/>}/>
                </Route>
                <Route path="stocks" element={<StockPage/>}>
                    <Route index element={<StockListPage/>}/>
                    <Route path="my" element={<MyStocksPage/>}/>
                    <Route path="create" element={<StockCreatePage/>}/>
                    <Route path=":id" element={<StockItemPage/>}/>
                </Route>
                <Route path="orders" element={<OrderPage/>}>
                    <Route index element={<OrderListPage/>}/>
                    <Route path="create" element={<OrderCreatePage/>}/>
                </Route>
            </Route>
        </Routes>
    )
}

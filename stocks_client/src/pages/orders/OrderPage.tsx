import StockContextProvider from "../../contexts/StockContext";
import OrderContextProvider from "../../contexts/OrderContext";
import { Outlet } from "react-router-dom";

const OrderPage = () => {
    return (
        <StockContextProvider>
            <OrderContextProvider>
                <Outlet/>
            </OrderContextProvider>
        </StockContextProvider>
    )
}

export default OrderPage;

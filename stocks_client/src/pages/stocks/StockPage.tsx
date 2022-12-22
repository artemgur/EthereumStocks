import { Outlet } from "react-router-dom";
import OrderContextProvider from "../../contexts/OrderContext";
import StockContextProvider from "../../contexts/StockContext";

const StockPage = () => {
    return (
        <StockContextProvider>
            <OrderContextProvider>
                <Outlet />
            </OrderContextProvider>
        </StockContextProvider>
    );
}

export default StockPage;

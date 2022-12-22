import React from 'react';
import { BrowserRouter } from "react-router-dom";
import EthereumContextProvider from "./contexts/EthereumContext";
import TransactionsContextProvider from "./contexts/TransactionsContext";
import FirebaseContextProvider from "./contexts/FirebaseContext";
import NotSupportedPage from "./pages/NotSupportedPage";
import LoadingPage from "./pages/LoadingPage";

function App() {
  return (
    <BrowserRouter>
        {window.ethereum ? (
            <FirebaseContextProvider>
              <EthereumContextProvider>
                <TransactionsContextProvider>
                  <LoadingPage/>
                </TransactionsContextProvider>
              </EthereumContextProvider>
            </FirebaseContextProvider>
        ) : (
            <NotSupportedPage/>
        )}
    </BrowserRouter>
  );
}

export default App;

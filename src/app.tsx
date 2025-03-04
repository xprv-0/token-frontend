import "./i18n";
import "./app.scss";

import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { AppLoader } from "./app-loader";
import { AppFooter } from "./components/app-footer";
import { BalanceManager } from "./components/balance-manager";
import { EthConnectModal } from "./components/eth-connect-modal";
import { EthWallet } from "./components/eth-wallet";
// @ts-ignore
import { GraphQlProvider } from "./components/GRAPHQL_PROVIDER/graphql-provider";
import { TemplateSidebar } from "./components/page-templates/template-sidebar";
import { VegaWallet } from "./components/vega-wallet";
import { VegaWalletModal } from "./components/vega-wallet/vega-wallet-modal";
import { Web3Connector } from "./components/web3-connector";
import { AppStateProvider } from "./contexts/app-state/app-state-provider";
import { ContractsProvider } from "./contexts/contracts/contracts-provider";
import { getLibrary } from "./lib/get-library";
import { AppRouter } from "./routes";

function App() {
  const sideBar = React.useMemo(() => [<EthWallet />, <VegaWallet />], []);
  return (
    <GraphQlProvider>
      <Router>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3Connector>
            <ContractsProvider>
              <AppStateProvider>
                <AppLoader>
                  <BalanceManager>
                    <div className="app">
                      <TemplateSidebar sidebar={sideBar}>
                        <AppRouter />
                      </TemplateSidebar>
                      <AppFooter />
                    </div>
                    <VegaWalletModal />
                    <EthConnectModal />
                  </BalanceManager>
                </AppLoader>
              </AppStateProvider>
            </ContractsProvider>
          </Web3Connector>
        </Web3ReactProvider>
      </Router>
    </GraphQlProvider>
  );
}

export default App;

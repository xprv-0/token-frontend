import React from "react";
// @ts-ignore
import detectEthereumProvider from "DETECT_PROVIDER_PATH/detect-provider";
import { SplashScreen } from "../../components/splash-screen";
import { SplashLoader } from "../../components/splash-loader";
import { useTranslation } from "react-i18next";
import {
  EthereumChainId,
  EthereumChainIds,
  EthereumChainNames,
} from "../../config";
import * as Sentry from "@sentry/react";
import { Severity } from "@sentry/react";
import { Web3Context } from "./web3-context";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

enum ProviderStatus {
  Pending,
  Ready,
  None,
  Invalid,
}

/**
 * Provides a raw web3 provider (usually window.ethereum injected by a chrome extension), a Web3
 * instance and the current chainId to its children. Also sets up an listener for the
 * changeChanged event and handles rendering logic to only render children if the configured
 * chainId matches what is set in the users logic.
 */
export const Web3Provider = ({ children }: { children: JSX.Element }) => {
  const { t } = useTranslation();
  const web3Modal = React.useRef(
    new Web3Modal({
      theme: "dark",
      providerOptions: {
        // Any injected wallet, eg Metamask in browsers or Brave's built in
        injected: {
          display: {
            name: "Injected",
            description: "Connect with the provider in your Browser",
          },
          package: null,
        },
        // Wallet connect allows you to connecting using a mobile wallet
        walletconnect: {
          display: {
            name: "Mobile",
            description: "Scan qrcode with your mobile wallet",
          },
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.REACT_APP_INFURA_ID,
          },
        },
      },
    })
  );
  const provider = React.useRef<any>(null);
  const web3 = React.useRef<Web3 | null>(null);
  const [status, setStatus] = React.useState(ProviderStatus.Pending);
  const [chainId, setChainId] = React.useState<EthereumChainId | null>(null);

  // // Detect provider
  // React.useEffect(() => {
  //   detectEthereumProvider()
  //     .then((res: any) => {
  //       // Extra check helps with Opera's legacy web3 - it properly falls through to NOT_DETECTED
  //       if (res && res.request) {
  //         provider.current = res;
  //         web3.current = new Web3(res);
  //         setStatus(ProviderStatus.Ready);
  //       } else {
  //         setStatus(ProviderStatus.Invalid);
  //       }
  //     })
  //     .catch(() => {
  //       setStatus(ProviderStatus.None);
  //     });
  // }, []);

  // Get and set the chainId if the provider is ready
  React.useEffect(() => {
    const getChainId = async () => {
      const chainId = await provider.current.request({
        method: "eth_chainId",
      });
      setChainId(chainId);
    };

    if (status === ProviderStatus.Ready) {
      getChainId();
    }
  }, [status]);

  // // Bind a listener for chainChanged if the provider is ready
  // React.useEffect(() => {
  //   const bindChainChangeListener = () => {
  //     provider.current.on("chainChanged", (newChainId: EthereumChainId) => {
  //       Sentry.addBreadcrumb({
  //         type: "ChainChanged",
  //         level: Severity.Log,
  //         message: "User changed chain in wallet provider",
  //         data: {
  //           old: chainId,
  //           new: newChainId,
  //         },
  //         timestamp: Date.now(),
  //       });
  //       setChainId(newChainId);
  //     });
  //   };

  //   if (status === ProviderStatus.Ready) {
  //     bindChainChangeListener();
  //   }

  //   return () => {
  //     if (
  //       provider.current &&
  //       typeof provider.current.removeAllListeners === "function"
  //     ) {
  //       provider.current.removeAllListeners("chainChanged");
  //     }
  //   };
  // }, [chainId, status]);

  // // App cant work without a web3 provider so return with a splash
  // // screen preventing further actions
  // if (status === ProviderStatus.None || status === ProviderStatus.Invalid) {
  //   return (
  //     <SplashScreen>
  //       <div>
  //         {status === ProviderStatus.Invalid
  //           ? t("invalidWeb3Provider")
  //           : t("invalidWeb3Browser")}
  //       </div>
  //     </SplashScreen>
  //   );
  // }

  // // Still waiting for the provider to be detected and the chainId fetched
  // if (
  //   status === ProviderStatus.Pending ||
  //   chainId === null ||
  //   provider.current === null ||
  //   web3.current === null
  // ) {
  //   return (
  //     <SplashScreen>
  //       <SplashLoader />
  //     </SplashScreen>
  //   );
  // }

  if (!provider.current) {
    return (
      <div>
        <button
          onClick={async () => {
            provider.current = await web3Modal.current.connect();
            web3.current = new Web3(provider.current);
            setStatus(ProviderStatus.Ready);
          }}
        >
          Connect
        </button>
      </div>
    );
  }

  if (!chainId) {
    return <div>No chain Id for some reason</div>;
  }

  // Chain ID retrieved from provider isn't the same as what the app is
  // configured to work with. Prevent further actions with splash screen
  if (chainId && chainId !== process.env.REACT_APP_CHAIN) {
    const currentChain = EthereumChainNames[chainId];
    const desiredChain =
      EthereumChainNames[process.env.REACT_APP_CHAIN as EthereumChainId];
    return (
      <SplashScreen>
        <div>
          <p>
            {/* If we can find a friendly name for chain use it else fall back to generic message */}
            {currentChain
              ? t("wrongNetwork", { chain: currentChain })
              : t("wrongNetworkUnknownChain", { chain: desiredChain })}
            {t("Desired network", {
              chain: desiredChain,
            })}
          </p>
        </div>
      </SplashScreen>
    );
  }

  return (
    <Web3Context.Provider
      value={{
        provider: provider.current,
        web3: web3.current,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

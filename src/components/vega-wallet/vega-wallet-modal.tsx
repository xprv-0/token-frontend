import { Overlay } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";

import {
  AppStateActionType,
  useAppState,
} from "../../contexts/app-state/app-state-context";
import { Modal } from "../modal";
import { DownloadWalletPrompt } from "./download-wallet-prompt";
import { VegaWalletForm } from "./vega-wallet-form";

export const VegaWalletModal = () => {
  const { t } = useTranslation();
  const { appState, appDispatch } = useAppState();
  return (
    <Overlay
      className="bp3-dark"
      isOpen={appState.vegaWalletOverlay}
      onClose={() =>
        appDispatch({
          type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
          isOpen: false,
        })
      }
      transitionDuration={0}
    >
      <div className="modal modal--dark">
        <Modal>
          <h2>{t("connectVegaWallet")}</h2>
          <VegaWalletForm
            onConnect={() =>
              appDispatch({
                type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
                isOpen: false,
              })
            }
          />
          <DownloadWalletPrompt />
        </Modal>
      </div>
    </Overlay>
  );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionComplete } from "../../../components/transaction-complete";
import { TransactionConfirm } from "../../../components/transaction-confirm";
import { TransactionError } from "../../../components/transaction-error";
import { TransactionsInProgress } from "../../../components/transaction-in-progress";
import { useVegaWeb3 } from "../../../hooks/use-vega-web3";
import { EthereumChainIds } from "../../../lib/vega-web3-utils";
import { initialClaimState, revealReducer, TxState } from "./reveal-reducer";

export const ClaimStep2 = ({ step1Completed }: { step1Completed: boolean }) => {
  const { t } = useTranslation();
  const [state, dispatch] = React.useReducer(revealReducer, initialClaimState);
  const vega = useVegaWeb3(EthereumChainIds.Mainnet);
  const commitReveal = React.useCallback(async () => {
    dispatch({ type: "REVEAL_TX_REQUESTED" });
    const promi = vega.commitClaim(); // TODO change this to reveal
    promi
      .on("transactionHash", (hash: string) => {
        dispatch({ type: "REVEAL_TX_SUBMITTED", txHash: hash });
      })
      .on("receipt", (receipt: any) => {
        dispatch({ type: "REVEAL_TX_COMPLETE", receipt });
      })
      .on("error", (err: Error) => {
        dispatch({ type: "REVEAL_TX_ERROR", error: err });
      });
  }, [vega]);
  let content = null;
  if (state.claimTxState === TxState.Error) {
    content = <TransactionError error={state.claimTxData.error} />;
  } else if (state.claimTxState === TxState.Pending) {
    content = <TransactionsInProgress hash={state.claimTxData.hash} />;
  } else if (state.claimTxState === TxState.Requested) {
    content = <TransactionConfirm />;
  } else if (state.claimTxState === TxState.Complete) {
    content = <TransactionComplete />;
  } else {
    content = (
      <button disabled={!step1Completed} onClick={() => commitReveal()}>
        Reveal
      </button>
    );
  }
  return (
    <div data-testid="claim-step-2" style={{ padding: 15 }}>
      <h1>{t("step2Title")}</h1>
      <p>{t("step2Body")}</p>
      {!step1Completed && <p>{t("step2Note")}</p>}
      {content}
    </div>
  );
};

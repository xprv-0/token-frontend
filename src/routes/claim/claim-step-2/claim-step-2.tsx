import React from "react";
import { useTranslation } from "react-i18next";
import {
  TransactionAction,
  TransactionActionType,
  TransactionState,
  TxState,
} from "../../../hooks/transaction-reducer";
import { TransactionCallout } from "../../../components/transaction-callout";
import { BigNumber } from "../../../lib/bignumber";

export const ClaimStep2 = ({
  amount,
  txState,
  txDispatch,
  onSubmit,
}: {
  amount: BigNumber;
  txState: TransactionState;
  txDispatch: React.Dispatch<TransactionAction>;
  onSubmit: () => void;
}) => {
  const { t } = useTranslation();

  if (txState.txState !== TxState.Default) {
    return (
      <div data-testid="claim-step-2">
        <TransactionCallout
          state={txState}
          reset={() => txDispatch({ type: TransactionActionType.TX_RESET })}
        />
      </div>
    );
  }

  return (
    <div data-testid="claim-step-2">
      <button type="submit" onClick={onSubmit} className="fill">
        {t("Claim {amount} Vega", { amount: amount.toString() })}
      </button>
    </div>
  );
};

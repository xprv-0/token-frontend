import "./token-input.scss";
import { FormGroup, InputGroup, Intent, Tag } from "@blueprintjs/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { BigNumber } from "../../lib/bignumber";
import { Callout } from "../callout";
import { Tick } from "../icons";
import {
  TransactionAction,
  TransactionActionType,
  TransactionState,
  TxState,
} from "../../hooks/transaction-reducer";
import { TransactionCallout } from "../transaction-callout";

const inputName = "amount";

export const AmountInput = ({
  amount,
  setAmount,
  maximum,
}: {
  amount: string;
  setAmount: React.Dispatch<any>;
  maximum: BigNumber;
}) => {
  const { t } = useTranslation();
  return (
    <div className="token-input__container">
      <InputGroup
        data-testid="token-amount-input"
        className="token-input__input"
        name={inputName}
        id={inputName}
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
        intent={Intent.NONE}
        rightElement={<Tag minimal={true}>{t("VEGA Tokens")}</Tag>}
        autoComplete="off"
        type="number"
        max={maximum.toNumber()}
        min={0}
      />
      {maximum && (
        <button
          type="button"
          onClick={() => setAmount(maximum.toString())}
          data-testid="token-amount-use-maximum"
          className="button-link token-input__use-maximum "
        >
          {t("Use maximum")}
        </button>
      )}
    </div>
  );
};

export const TokenInput = ({
  amount,
  setAmount,
  perform,
  submitText,

  approveText,
  allowance,
  approve,
  requireApproval = false,
  maximum = new BigNumber("0"),
  approveTxState,
  approveTxDispatch,
}: {
  amount: string;
  setAmount: React.Dispatch<any>;
  perform: () => void;
  requireApproval?: boolean;
  submitText: string;

  maximum?: BigNumber;
  allowance?: BigNumber;
  approve?: () => void;
  approveText?: string;
  approveTxState?: TransactionState;
  approveTxDispatch?: React.Dispatch<TransactionAction>;
}) => {
  if (
    requireApproval &&
    (allowance == null ||
      approve == null ||
      !approveTxState ||
      !approveTxDispatch)
  ) {
    throw new Error(
      "If requires approval is true allowance, approve, approveTxState and approveDispatch props are required!"
    );
  }
  const { t } = useTranslation();
  const isApproved = !new BigNumber(allowance!).isEqualTo(0);
  const showApproveButton =
    !isApproved || new BigNumber(amount).isGreaterThan(allowance!);

  const isDisabled = React.useMemo<boolean>(() => {
    if (requireApproval) {
      return (
        !isApproved ||
        !amount ||
        new BigNumber(amount).isLessThanOrEqualTo("0") ||
        new BigNumber(amount).isGreaterThan(maximum)
      );
    }
    return (
      !amount ||
      new BigNumber(amount).isLessThanOrEqualTo("0") ||
      new BigNumber(amount).isGreaterThan(maximum)
    );
  }, [amount, isApproved, maximum, requireApproval]);
  let approveContent = null;

  if (showApproveButton) {
    if (
      approveTxDispatch &&
      approveTxState &&
      approveTxState.txState !== TxState.Default
    ) {
      approveContent = (
        <TransactionCallout
          state={approveTxState}
          pendingHeading={"Approve VEGA tokens for staking on Vega"}
          reset={() =>
            approveTxDispatch({ type: TransactionActionType.TX_RESET })
          }
        />
      );
    } else {
      approveContent = (
        <button
          data-testid="token-input-approve-button"
          className="fill token-input__submit"
          onClick={approve}
        >
          {approveText}
        </button>
      );
    }
  } else {
    approveContent = (
      <Callout
        icon={<Tick />}
        intent="success"
        title={t("VEGA tokens are approved for staking")}
      ></Callout>
    );
  }
  return (
    <FormGroup label="" labelFor={inputName}>
      <AmountInput amount={amount} setAmount={setAmount} maximum={maximum} />
      {approveContent}
      <button
        data-testid="token-input-submit-button"
        className="fill token-input__submit"
        disabled={isDisabled}
        onClick={perform}
      >
        {submitText}
      </button>
    </FormGroup>
  );
};

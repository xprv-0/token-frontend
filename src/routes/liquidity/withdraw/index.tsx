import "./withdraw.scss";

import React from "react";
import { useEthUser } from "../../../hooks/use-eth-user";
import { useVegaLPStaking } from "../../../hooks/use-vega-lp-staking";
import { useParams } from "react-router";
import { REWARDS_ADDRESSES } from "../../../config";
import { useTransaction } from "../../../hooks/use-transaction";
import {
  TransactionActionType,
  TxState,
} from "../../../hooks/transaction-reducer";
import { TransactionCallout } from "../../../components/transaction-callout";
import { useTranslation } from "react-i18next";
import { EthConnectPrompt } from "../../../components/eth-connect-prompt";
import * as Sentry from "@sentry/react";
import { LiquidityAction, LiquidityState } from "../liquidity-reducer";
import { useGetLiquidityBalances } from "../hooks";
import {
  KeyValueTable,
  KeyValueTableRow,
} from "../../../components/key-value-table";
import { Callout } from "../../../components/callout";
import { Error } from "../../../components/icons";
import { Link } from "react-router-dom";
import { Routes } from "../../router-config";

export const LiquidityWithdrawPage = ({
  lpTokenAddress,
  state,
  dispatch,
}: {
  lpTokenAddress: string;
  state: LiquidityState;
  dispatch: React.Dispatch<LiquidityAction>;
}) => {
  const { t } = useTranslation();
  const lpStaking = useVegaLPStaking({ address: lpTokenAddress });
  const { ethAddress } = useEthUser();
  const {
    state: txUnstakeState,
    dispatch: txUnstakeDispatch,
    perform: txUnstakePerform,
  } = useTransaction(() => lpStaking.unstake(ethAddress));
  const transactionInProgress = React.useMemo(
    () => txUnstakeState.txState !== TxState.Default,
    [txUnstakeState.txState]
  );
  const values = React.useMemo(
    () => state.contractData[lpTokenAddress],
    [lpTokenAddress, state.contractData]
  );
  const { getBalances, lpStakingEth, lpStakingUSDC } = useGetLiquidityBalances(
    dispatch,
    ethAddress
  );
  React.useEffect(() => {
    const run = async () => {
      try {
        await Promise.all([
          getBalances(lpStakingUSDC, REWARDS_ADDRESSES["Sushi Swap VEGA/USDC"]),
          getBalances(lpStakingEth, REWARDS_ADDRESSES["Sushi Swap VEGA/ETH"]),
        ]);
      } catch (e) {
        Sentry.captureException(e);
      }
    };
    if (txUnstakeState.txState === TxState.Complete) {
      run();
    }
  }, [getBalances, lpStakingEth, lpStakingUSDC, txUnstakeState.txState]);

  if (transactionInProgress) {
    return (
      <>
        <p>{t("lpTokenWithdrawSubmit")}</p>
        <TransactionCallout
          state={txUnstakeState}
          completeBody={
            <Link to={Routes.LIQUIDITY}>
              <button className="fill">{t("lpTxSuccessButton")}</button>
            </Link>
          }
          reset={() =>
            txUnstakeDispatch({ type: TransactionActionType.TX_RESET })
          }
        />
      </>
    );
  } else if (
    !values.connectedWalletData?.totalStaked ||
    values.connectedWalletData?.totalStaked.isEqualTo(0)
  ) {
    return <section>{t("withdrawLpNoneDeposited")}</section>;
  }

  return (
    <section>
      {!ethAddress ? (
        <EthConnectPrompt />
      ) : (
        <section>
          <Callout
            icon={<Error />}
            intent="error"
            title={t("withdrawLpCalloutTitle")}
          >
            <p>{t("withdrawLpCalloutBody")}</p>
          </Callout>
          <p>{t("lpTokenWithdrawSubmit")}</p>
          <KeyValueTable className="dex-tokens-withdraw__table">
            <KeyValueTableRow>
              <th>{t("liquidityTokenWithdrawBalance")}</th>
              <td>{values.connectedWalletData.totalStaked.toString()}</td>
            </KeyValueTableRow>
            <KeyValueTableRow>
              <th>{t("liquidityTokenWithdrawRewards")}</th>
              <td>
                {values.connectedWalletData.accumulatedRewards.toString()}
              </td>
            </KeyValueTableRow>
          </KeyValueTable>
          <p className="dex-tokens-withdraw__submit">
            <button className="fill" onClick={txUnstakePerform}>
              {t("withdrawLpWithdrawButton")}
            </button>
          </p>
        </section>
      )}
    </section>
  );
};

export const LiquidityWithdraw = ({
  state,
  dispatch,
}: {
  state: LiquidityState;
  dispatch: React.Dispatch<LiquidityAction>;
}) => {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  const isValidAddress = React.useMemo(
    () => Object.values(REWARDS_ADDRESSES).includes(address),
    [address]
  );

  if (!isValidAddress) {
    return <section>{t("lpTokensInvalidToken", { address })}</section>;
  }
  return (
    <LiquidityWithdrawPage
      lpTokenAddress={address}
      state={state}
      dispatch={dispatch}
    />
  );
};

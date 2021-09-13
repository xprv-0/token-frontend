import "./liquidity-container.scss";
import React from "react";
import { useTranslation } from "react-i18next";
import { EtherscanLink } from "../../components/etherscan-link";
import { useAppState } from "../../contexts/app-state/app-state-context";
import { Link } from "react-router-dom";
import { Routes } from "../router-config";
import { LiquidityState, LiquidityAction } from "./liquidity-reducer";

interface DexTokensSectionProps {
  name: string;
  contractAddress: string;
  ethAddress: string;
  state: LiquidityState;
  dispatch: React.Dispatch<LiquidityAction>;
  showInteractionButton?: boolean;
}

export const DexTokensSection = ({
  name,
  contractAddress,
  ethAddress,
  state,
  showInteractionButton = true,
}: DexTokensSectionProps) => {
  const { appState } = useAppState();
  const { t } = useTranslation();
  const values = state.contractData[contractAddress];
  if (!values) {
    return <p>{t("Loading")}...</p>;
  }

  return (
    <section className="dex-tokens-section">
      <h3>{name}</h3>
      <table className="dex-tokens-section__table">
        <tbody>
          <tr>
            <th>{t("liquidityTokenContractAddress")}</th>
            <td>
              <EtherscanLink
                chainId={appState.chainId}
                tx={contractAddress}
                text={contractAddress}
              />
            </td>
          </tr>
          <tr>
            <th>{t("rewardPerEpoch")}</th>
            <td>
              {values.rewardPerEpoch.toString()} {t("VEGA")}
            </td>
          </tr>
          <tr>
            <th>{t("rewardTokenContractAddress")}</th>
            <td>
              <EtherscanLink
                chainId={appState.chainId}
                tx={values.awardContractAddress}
                text={values.awardContractAddress}
              />
            </td>
          </tr>
          <tr>
            <th>{t("lpTokensEstimateAPY")}</th>
            <td>{values.estimateAPY.decimalPlaces(2).toString()}%</td>
          </tr>
          <tr>
            <th>{t("lpTokensInRewardPool")}</th>
            <td>{values.rewardPoolBalance.toString()}</td>
          </tr>
          {ethAddress && (
            <ConnectedRows
              showInteractionButton={showInteractionButton}
              lpContractAddress={contractAddress}
              state={state}
            />
          )}
        </tbody>
      </table>
    </section>
  );
};

interface ConnectedRowsProps {
  lpContractAddress: string;
  state: LiquidityState;
  showInteractionButton: boolean;
}

const ConnectedRows = ({
  lpContractAddress,
  state,
  showInteractionButton = true,
}: ConnectedRowsProps) => {
  const { t } = useTranslation();
  const values = state.contractData[lpContractAddress];

  // Only shows the Deposit/Withdraw button IF they have tokens AND they haven't staked AND we're not on the relevant page
  const isDepositButtonVisible =
    showInteractionButton &&
    values.availableLPTokens &&
    values.availableLPTokens.isGreaterThan(0);

  return (
    <>
      <tr>
        <th>{t("usersLpTokens")}</th>
        <td>
          <div>{values.availableLPTokens?.toString()}</div>
          {values.stakedLPTokens?.isGreaterThan(0) ? (
            <span className="text-muted">{t("alreadyDeposited")}</span>
          ) : isDepositButtonVisible ? (
            <div style={{ marginTop: 3 }}>
              <Link to={`${Routes.LIQUIDITY}/${lpContractAddress}/deposit`}>
                <button>{t("depositToRewardPoolButton")}</button>
              </Link>
            </div>
          ) : null}
        </td>
      </tr>
      <tr>
        <th>{t("usersStakedLPTokens")}</th>
        <td>{values.stakedLPTokens?.toString()}</td>
      </tr>
      {/*<tr>
        <th>{t("usersShareOfPool")}</th>
        <td>{values.shareOfPool}</td>
      </tr>*/}
      <tr>
        <th>{t("usersAccumulatedRewards")}</th>
        <td>
          <div>
            {values.accumulatedRewards?.toString()} {t("VEGA")}
          </div>
          {values.stakedLPTokens?.isGreaterThan(0) && (
            <div style={{ marginTop: 3 }}>
              <Link to={`${Routes.LIQUIDITY}/${lpContractAddress}/withdraw`}>
                <button>{t("withdrawFromRewardPoolButton")}</button>
              </Link>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};

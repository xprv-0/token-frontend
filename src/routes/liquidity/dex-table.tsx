import "./liquidity-container.scss";
import React from "react";
import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import { useVegaLPStaking } from "../../hooks/use-vega-lp-staking";
import { EtherscanLink } from "../../components/etherscan-link";
import { useAppState } from "../../contexts/app-state/app-state-context";
import { truncateMiddle } from "../../lib/truncate-middle";
import { IVegaLPStaking } from "../../lib/web3-utils";
import { BigNumber } from "../../lib/bignumber";
import { Link } from "react-router-dom";
import { Routes } from "../router-config";
import {
  LiquidityState,
  LiquidityAction,
  LiquidityActionType,
} from "./liquidity-reducer";

interface DexTokensSectionProps {
  name: string;
  contractAddress: string;
  ethAddress: string;
  state: LiquidityState;
  dispatch: React.Dispatch<LiquidityAction>;
}

export const DexTokensSection = ({
  name,
  contractAddress,
  ethAddress,
  state,
  dispatch,
}: DexTokensSectionProps) => {
  const { appState } = useAppState();
  const { t } = useTranslation();
  const lpStaking = useVegaLPStaking({ address: contractAddress });
  const values = state.contractData[contractAddress];
  React.useEffect(() => {
    const run = async () => {
      try {
        const [rewardPerEpoch, rewardPoolBalance, awardContractAddress] =
          await Promise.all<BigNumber, BigNumber, string>([
            await lpStaking.rewardPerEpoch(),
            await lpStaking.liquidityTokensInRewardPool(),
            await lpStaking.awardContractAddress(),
          ]);
        dispatch({
          type: LiquidityActionType.SET_CONTRACT_INFORMATION,
          contractAddress,
          contractData: {
            rewardPerEpoch: rewardPerEpoch,
            rewardPoolBalance: rewardPoolBalance,
            awardContractAddress: awardContractAddress,
          },
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    run();
  }, [lpStaking, ethAddress, contractAddress, dispatch]);
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
                hash={contractAddress}
                text={truncateMiddle(contractAddress)}
              />
            </td>
          </tr>
          <tr>
            <th>{t("rewardPerEpoch")}</th>
            <td>{values.rewardPerEpoch.toString()} VEGA</td>
          </tr>
          <tr>
            <th>{t("rewardTokenContractAddress")}</th>
            <td>
              <EtherscanLink
                chainId={appState.chainId}
                hash={values.awardContractAddress}
                text={truncateMiddle(values.awardContractAddress)}
              />
            </td>
          </tr>
          <tr>
            <th>{t("lpTokensInRewardPool")}</th>
            <td>{values.rewardPoolBalance.toString()}</td>
          </tr>
          {ethAddress && (
            <ConnectedRows
              lpContractAddress={contractAddress}
              ethAddress={ethAddress}
              lpStaking={lpStaking}
              rewardPoolBalance={values.rewardPoolBalance}
              state={state}
              dispatch={dispatch}
            />
          )}
        </tbody>
      </table>
    </section>
  );
};

interface ConnectedRowsProps {
  lpContractAddress: string;
  ethAddress: string;
  lpStaking: IVegaLPStaking;
  rewardPoolBalance: BigNumber;
  state: LiquidityState;
  dispatch: React.Dispatch<LiquidityAction>;
}

const ConnectedRows = ({
  lpContractAddress,
  ethAddress,
  lpStaking,
  rewardPoolBalance,
  state,
  dispatch,
}: ConnectedRowsProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);

  const values = state.contractData[lpContractAddress];
  React.useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const availableLPTokens = await lpStaking.totalUnstaked(ethAddress);
        const stakedLPTokens = await lpStaking.stakedBalance(ethAddress);
        // TODO: check that this is correct, I think we are meant to be summing a few
        // values here?
        const accumulatedRewards = await lpStaking.rewardsBalance(ethAddress);

        const shareOfPool =
          stakedLPTokens.dividedBy(rewardPoolBalance).times(100).toString() +
          "%";

        dispatch({
          type: LiquidityActionType.SET_CONTRACT_INFORMATION,
          contractAddress: lpContractAddress,
          contractData: {
            availableLPTokens,
            stakedLPTokens,
            shareOfPool,
            accumulatedRewards,
          },
        });
      } catch (e) {
        Sentry.captureException(e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [dispatch, ethAddress, lpContractAddress, lpStaking, rewardPoolBalance]);

  if (loading) {
    return null;
  }

  return (
    <>
      <tr>
        <th>{t("usersLpTokens")}</th>
        <td>
          <div>{values.availableLPTokens.toString()}</div>
          {values.stakedLPTokens.isGreaterThan(0) ? (
            <span className="text-muted">{t("alreadyDeposited")}</span>
          ) : (
            <div style={{ marginTop: 3 }}>
              <Link to={`${Routes.LIQUIDITY}/${lpContractAddress}/deposit`}>
                <button>{t("depositToRewardPoolButton")}</button>
              </Link>
            </div>
          )}
        </td>
      </tr>
      <tr>
        <th>{t("usersStakedLPTokens")}</th>
        <td>{values.stakedLPTokens.toString()}</td>
      </tr>
      <tr>
        <th>{t("usersShareOfPool")}</th>
        <td>{values.shareOfPool}</td>
      </tr>
      <tr>
        <th>{t("usersAccumulatedRewards")}</th>
        <td>
          <div>{values.accumulatedRewards.toString()} VEGA</div>
          {/* // TODO: check this condition is correct */}
          {values.stakedLPTokens.isGreaterThan(0) && (
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

import "./staking-node.scss";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ValidatorTable } from "./validator-table";
import { VegaKeyExtended } from "../../contexts/app-state/app-state-context";
import { EpochCountdown } from "../../components/epoch-countdown";
import { YourStake } from "./your-stake";
import { StakingForm } from "./staking-form";
import { StakingWalletsContainer } from "./staking-wallets-container";
import { BigNumber } from "../../lib/bignumber";
import { Staking as StakingQueryResult } from "./__generated__/Staking";
import { StakingNodesContainer } from "./staking-nodes-container";
import { Colors } from "../../config";
import { ConnectToVega } from "./connect-to-vega";

export const StakingNodeContainer = () => {
  return (
    <StakingWalletsContainer>
      {({ currVegaKey }) => (
        currVegaKey ?
        <StakingNodesContainer>
          {({ data }) => <StakingNode vegaKey={currVegaKey} data={data} />}
        </StakingNodesContainer>
        :
        <ConnectToVega />
      )}
    </StakingWalletsContainer>
  );
};

interface StakingNodeProps {
  vegaKey: VegaKeyExtended;
  data?: StakingQueryResult;
}

export const StakingNode = ({ vegaKey, data }: StakingNodeProps) => {
  const { node } = useParams<{ node: string }>();
  const { t } = useTranslation();

  const currentDelegationAmount = React.useMemo(() => {
    if (!data?.party?.delegations) return new BigNumber(0);
    const amounts = data.party.delegations.map((d) => new BigNumber(d.amount));
    return BigNumber.sum.apply(null, [new BigNumber(0), ...amounts]);
  }, [data]);
  const unstaked = React.useMemo(() => {
    return new BigNumber(data?.party?.stake.currentStakeAvailable || 0).minus(
      currentDelegationAmount
    );
  }, [currentDelegationAmount, data?.party?.stake.currentStakeAvailable]);

  const nodeInfo = React.useMemo(() => {
    return data?.nodes?.find(({ id }) => id === node);
  }, [node, data]);

  if (!nodeInfo) {
    return (
      <span style={{ color: Colors.RED }}>
        Could not find a node with id {node}
      </span>
    );
  }

  return (
    <>
      <h2 style={{ wordBreak: "break-word", marginTop: 0 }}>
        {t("VALIDATOR {{node}}", { node })}
      </h2>
      <p>Vega key: {vegaKey.pubShort}</p>
      <ValidatorTable
        node={nodeInfo}
        stakedTotal={data?.nodeData?.stakedTotal || "0"}
      />
      {data?.epoch.timestamps.start && data?.epoch.timestamps.expiry && (
        <EpochCountdown
          containerClass="staking-node__epoch"
          id={data.epoch.id}
          startDate={new Date(data?.epoch.timestamps.start)}
          endDate={new Date(data?.epoch.timestamps.expiry)}
        />
      )}
      <YourStake
        currentEpoch={data?.epoch.id!}
        delegations={data?.party?.delegations || []}
      />
      <StakingForm
        pubkey={vegaKey.pub}
        nodeId={node}
        availableStakeToAdd={unstaked}
        availableStakeToRemove={currentDelegationAmount}
      />
    </>
  );
};

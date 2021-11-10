import React from "react";
import * as Sentry from "@sentry/react";
import "./vega-wallet.scss";
import {
  AppStateActionType,
  useAppState,
  VegaKeyExtended,
  VegaWalletStatus,
} from "../../contexts/app-state/app-state-context";
import {
  WalletCard,
  WalletCardActions,
  WalletCardAsset,
  WalletCardAssetProps,
  WalletCardContent,
  WalletCardHeader,
  WalletCardRow,
} from "../wallet-card";
import { useTranslation } from "react-i18next";
import {
  MINIMUM_WALLET_VERSION,
  vegaWalletService,
} from "../../lib/vega-wallet/vega-wallet-service";
import { gql, useApolloClient } from "@apollo/client";
import {
  Delegations,
  DelegationsVariables,
  Delegations_party_delegations,
} from "./__generated__/Delegations";
import { useVegaUser } from "../../hooks/use-vega-user";
import { BigNumber } from "../../lib/bignumber";
import { truncateMiddle } from "../../lib/truncate-middle";
import { keyBy, uniq } from "lodash";
import { useRefreshAssociatedBalances } from "../../hooks/use-refresh-associated-balances";
import { useWeb3 } from "../../contexts/web3-context/web3-context";
import { ADDRESSES, Colors } from "../../config";
import { BulletHeader } from "../bullet-header";
import { Routes } from "../../routes/router-config";
import { Link } from "react-router-dom";
import vegaWhite from "../../images/vega_white.png";
import noIcon from "../../images/token-no-icon.png";
import { addDecimal } from "../../lib/decimals";
import { AccountType } from "../../__generated__/globalTypes";

const DELEGATIONS_QUERY = gql`
  query Delegations($partyId: ID!) {
    epoch {
      id
    }
    party(id: $partyId) {
      delegations {
        amountFormatted @client
        amount
        node {
          id
        }
        epoch
      }
      stake {
        currentStakeAvailable
        currentStakeAvailableFormatted @client
      }
      accounts {
        asset {
          name
          id
          decimals
          symbol
          source {
            __typename
            ... on ERC20 {
              contractAddress
            }
          }
        }
        type
        balance
      }
    }
  }
`;

export const VegaWallet = () => {
  const { t } = useTranslation();
  const { currVegaKey, vegaKeys, version } = useVegaUser();

  const child = !vegaKeys ? (
    <VegaWalletNotConnected />
  ) : (
    <VegaWalletConnected
      currVegaKey={currVegaKey}
      vegaKeys={vegaKeys}
      version={version}
    />
  );

  return (
    <section className="vega-wallet">
      <WalletCard dark={true}>
        <WalletCardHeader dark={true}>
          <div>
            <h1>{t("vegaWallet")}</h1>
            <span>{currVegaKey && `(${currVegaKey.alias})`}</span>
          </div>
          {currVegaKey && (
            <>
              <span className="vega-wallet__curr-key">
                {currVegaKey.pubShort}
              </span>
            </>
          )}
        </WalletCardHeader>
        <WalletCardContent>{child}</WalletCardContent>
        <WalletCardContent>{version}</WalletCardContent>
      </WalletCard>
    </section>
  );
};

const VegaWalletNotConnected = () => {
  const { t } = useTranslation();
  const { appState, appDispatch } = useAppState();

  if (appState.vegaWalletStatus === VegaWalletStatus.None) {
    return (
      <WalletCardContent>
        <div>{t("noService")}</div>
      </WalletCardContent>
    );
  }

  return (
    <button
      onClick={() =>
        appDispatch({
          type: AppStateActionType.SET_VEGA_WALLET_OVERLAY,
          isOpen: true,
        })
      }
      className="vega-wallet__connect"
      data-testid="connect-vega"
      type="button"
    >
      {t("Connect")}
    </button>
  );
};

interface VegaWalletAssetsListProps {
  accounts: WalletCardAssetProps[];
}

const VegaWalletAssetList = ({ accounts }: VegaWalletAssetsListProps) => {
  const { t } = useTranslation();
  if (!accounts.length) {
    return null;
  }
  return (
    <>
      <WalletCardHeader>
        <BulletHeader style={{ border: "none" }} tag="h2">
          {t("Assets")}
        </BulletHeader>
      </WalletCardHeader>
      {accounts.map((a) => (
        <WalletCardAsset {...a} />
      ))}
    </>
  );
};

interface VegaWalletConnectedProps {
  currVegaKey: VegaKeyExtended | null;
  vegaKeys: VegaKeyExtended[];
  version: string | undefined;
}

const VegaWalletConnected = ({
  currVegaKey,
  vegaKeys,
  version,
}: VegaWalletConnectedProps) => {
  const { t } = useTranslation();
  const { ethAddress } = useWeb3();
  const {
    appDispatch,
    appState: { decimals },
  } = useAppState();
  const setAssociatedBalances = useRefreshAssociatedBalances();
  const [disconnecting, setDisconnecting] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const client = useApolloClient();
  const [delegations, setDelegations] = React.useState<
    Delegations_party_delegations[]
  >([]);
  const [delegatedNodes, setDelegatedNodes] = React.useState<
    {
      nodeId: string;
      hasStakePending: boolean;
      currentEpochStake?: BigNumber;
      nextEpochStake?: BigNumber;
    }[]
  >([]);
  const [accounts, setAccounts] = React.useState<WalletCardAssetProps[]>([]);
  const [currentStakeAvailable, setCurrentStakeAvailable] =
    React.useState<BigNumber>(new BigNumber(0));

  React.useEffect(() => {
    let interval: any;
    let mounted = true;

    if (currVegaKey?.pub) {
      // start polling for delegation
      interval = setInterval(() => {
        client
          .query<Delegations, DelegationsVariables>({
            query: DELEGATIONS_QUERY,
            variables: { partyId: currVegaKey.pub },
            fetchPolicy: "network-only",
          })
          .then((res) => {
            if (!mounted) return;
            const filter =
              res.data.party?.delegations?.filter((d) => {
                return d.epoch.toString() === res.data.epoch.id;
              }) || [];
            const sortedDelegations = [...filter].sort((a, b) => {
              return new BigNumber(b.amountFormatted)
                .minus(a.amountFormatted)
                .toNumber();
            });
            setDelegations(sortedDelegations);
            setCurrentStakeAvailable(
              new BigNumber(
                res.data.party?.stake.currentStakeAvailableFormatted || 0
              )
            );
            const accounts = res.data.party?.accounts || [];
            setAccounts(
              accounts
                .filter((a) => a.type === AccountType.General)
                .map((a) => {
                  const isVega =
                    a.asset.source.__typename === "ERC20" &&
                    a.asset.source.contractAddress ===
                      ADDRESSES.vegaTokenAddress;

                  return {
                    isVega,
                    name: a.asset.name,
                    symbol: isVega ? a.asset.symbol : t("collateral"),
                    decimals: a.asset.decimals,
                    balance: new BigNumber(
                      addDecimal(new BigNumber(a.balance), a.asset.decimals)
                    ),
                    image: isVega ? vegaWhite : noIcon,
                  };
                })
                .sort((a, b) => {
                  // Put VEGA at the top of the list
                  if (a.isVega) {
                    return -1;
                  }
                  if (b.isVega) {
                    return 1;
                  }
                  // Secondary sort by name
                  if (a.name < b.name) {
                    return -1;
                  }
                  if (a.name > b.name) {
                    return 1;
                  }
                  return 0;
                })
            );
            const delegatedNextEpoch = keyBy(
              res.data.party?.delegations?.filter((d) => {
                return d.epoch === Number(res.data.epoch.id) + 1;
              }) || [],
              "node.id"
            );
            const delegatedThisEpoch = keyBy(
              res.data.party?.delegations?.filter((d) => {
                return d.epoch === Number(res.data.epoch.id);
              }) || [],
              "node.id"
            );
            const nodesDelegated = uniq([
              ...Object.keys(delegatedNextEpoch),
              ...Object.keys(delegatedThisEpoch),
            ]);

            const delegatedAmounts = nodesDelegated
              .map((d) => ({
                nodeId: d,
                hasStakePending: !!(
                  (delegatedThisEpoch[d]?.amountFormatted ||
                    delegatedNextEpoch[d]?.amountFormatted) &&
                  delegatedThisEpoch[d]?.amountFormatted !==
                    delegatedNextEpoch[d]?.amountFormatted
                ),
                currentEpochStake:
                  delegatedThisEpoch[d] &&
                  new BigNumber(delegatedThisEpoch[d].amountFormatted),
                nextEpochStake:
                  delegatedNextEpoch[d] &&
                  new BigNumber(delegatedNextEpoch[d].amountFormatted),
              }))
              .sort((a, b) => {
                if (a.currentEpochStake.isLessThan(b.currentEpochStake))
                  return 1;
                if (a.currentEpochStake.isGreaterThan(b.currentEpochStake))
                  return -1;
                if (a.nodeId < b.nodeId) return 1;
                if (a.nodeId > b.nodeId) return -1;
                return 0;
              });

            setDelegatedNodes(delegatedAmounts);
          })
          .catch((err: Error) => {
            Sentry.captureException(err);
            // If query fails stop interval. Its almost certain that the query
            // will just continue to fail
            clearInterval(interval);
          });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, [client, currVegaKey?.pub, t]);

  const handleDisconnect = React.useCallback(
    async function () {
      try {
        setDisconnecting(true);
        await vegaWalletService.revokeToken();
        appDispatch({ type: AppStateActionType.VEGA_WALLET_DISCONNECT });
      } catch (err) {
        Sentry.captureException(err);
      }
    },
    [appDispatch]
  );

  const unstaked = React.useMemo(() => {
    const totalDelegated = delegations.reduce<BigNumber>(
      (acc, cur) => acc.plus(cur.amountFormatted),
      new BigNumber(0)
    );
    return BigNumber.max(currentStakeAvailable.minus(totalDelegated), 0);
  }, [currentStakeAvailable, delegations]);

  const changeKey = React.useCallback(
    async (k: VegaKeyExtended) => {
      if (ethAddress) {
        await setAssociatedBalances(ethAddress, k.pub);
      }
      appDispatch({
        type: AppStateActionType.VEGA_WALLET_SET_KEY,
        key: k,
      });
      setExpanded(false);
    },
    [ethAddress, appDispatch, setAssociatedBalances]
  );

  const disconnect = (
    <WalletCardActions>
      {vegaKeys.length > 1 ? (
        <button
          className="button-link button-link--dark"
          onClick={() => setExpanded((x) => !x)}
          type="button"
        >
          {expanded ? "Hide keys" : "Change key"}
        </button>
      ) : null}
      <button
        className="button-link button-link--dark"
        onClick={handleDisconnect}
        type="button"
      >
        {disconnecting ? t("awaitingDisconnect") : t("disconnect")}
      </button>
    </WalletCardActions>
  );

  if (!version) {
    return (
      <>
        <div
          style={{
            color: Colors.RED,
          }}
        >
          {t("noVersionFound")}
        </div>
        {disconnect}
      </>
    );
  } else if (!vegaWalletService.isSupportedVersion(version)) {
    return (
      <>
        <div
          style={{
            color: Colors.RED,
          }}
        >
          {t("unsupportedVersion", {
            version,
            requiredVersion: MINIMUM_WALLET_VERSION,
          })}
        </div>
        {disconnect}
      </>
    );
  }

  return vegaKeys.length ? (
    <>
      <WalletCardAsset
        image={vegaWhite}
        decimals={decimals}
        name="VEGA"
        symbol="associated"
        balance={currentStakeAvailable}
      />
      <WalletCardRow label={t("unstaked")} value={unstaked} dark={true} />
      {delegatedNodes.length ? (
        <WalletCardRow label={t("stakedValidators")} dark={true} bold={true} />
      ) : null}
      {delegatedNodes.map((d) => (
        <div key={d.nodeId}>
          {d.currentEpochStake && (
            <WalletCardRow
              label={`${truncateMiddle(d.nodeId)} ${
                d.hasStakePending ? "(This epoch)" : ""
              }`}
              value={d.currentEpochStake}
              valueSuffix={t("VEGA")}
              dark={true}
            />
          )}
          {d.hasStakePending && (
            <WalletCardRow
              label={`${truncateMiddle(d.nodeId)} (Next epoch)`}
              value={d.nextEpochStake}
              valueSuffix={t("VEGA")}
              dark={true}
            />
          )}
        </div>
      ))}
      {expanded && (
        <ul className="vega-wallet__key-list">
          {vegaKeys
            .filter((k) => currVegaKey && currVegaKey.pub !== k.pub)
            .map((k) => (
              <li key={k.pub} onClick={() => changeKey(k)}>
                {k.alias} {k.pubShort}
              </li>
            ))}
        </ul>
      )}
      <WalletCardActions>
        <Link style={{ flex: 1 }} to={Routes.GOVERNANCE}>
          <button className="button-secondary">{t("governance")}</button>
        </Link>
        <Link style={{ flex: 1 }} to={Routes.STAKING}>
          <button className="button-secondary">{t("staking")}</button>
        </Link>
      </WalletCardActions>
      <VegaWalletAssetList accounts={accounts} />
      {disconnect}
    </>
  ) : (
    <WalletCardContent>{t("noKeys")}</WalletCardContent>
  );
};

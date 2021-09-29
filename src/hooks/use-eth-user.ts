import React from "react";
import {
  AppStateActionType,
  useAppState,
} from "../contexts/app-state/app-state-context";
import { useVegaStaking } from "./use-vega-staking";
import { useVegaToken } from "./use-vega-token";
import { useVegaVesting } from "./use-vega-vesting";
import { BigNumber } from "../lib/bignumber";
import { useGetUserTrancheBalances } from "./use-get-user-tranche-balances";
import * as Sentry from "@sentry/react";
import { ADDRESSES } from "../config";
import { isUnexpectedError } from "../lib/web3-utils";

export function useEthUser() {
  const { appState, appDispatch, provider } = useAppState();
  const token = useVegaToken();
  const staking = useVegaStaking();
  const vesting = useVegaVesting();
  const connectTimer = React.useRef<any>();
  const getUserTrancheBalances = useGetUserTrancheBalances(appState.ethAddress);
  const [triedToConnect, setTriedToConnect] = React.useState<boolean>(false);

  const connect = React.useCallback(async () => {
    let connected = false;

    // only show set connecting state if some time has passed to
    // avoid UI flickering if you have already permitted the website
    // to connect to metamask
    connectTimer.current = setTimeout(() => {
      if (!connected) {
        appDispatch({ type: AppStateActionType.CONNECT });
      }
    }, 300);

    try {
      appDispatch({ type: AppStateActionType.CONNECT });

      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      connected = true;

      appDispatch({
        type: AppStateActionType.CONNECT_SUCCESS,
        address: accounts[0],
      });
      Sentry.setUser({ id: accounts[0] });
    } catch (e) {
      if (isUnexpectedError(e)) {
        Sentry.captureException(e);
      }
      appDispatch({ type: AppStateActionType.CONNECT_FAIL, error: e });
    }
  }, [appDispatch, provider]);

  // Auto connect if possible
  React.useEffect(() => {
    if (
      !triedToConnect &&
      // We don't have an address we are not connected
      !appState.ethAddress &&
      // If we have an error we don't want to try reconnecting
      !appState.error &&
      // If we are connecting we don't want to try to connect
      !appState.ethWalletConnecting
    ) {
      try {
        setTriedToConnect(true);
        connect();
      } catch (e) {
        Sentry.captureException(e);
      }
    }
  }, [
    appState.ethAddress,
    appState.ethWalletConnecting,
    appState.error,
    connect,
    triedToConnect,
  ]);

  // update balances on connect to Ethereum
  React.useEffect(() => {
    const updateBalances = async () => {
      try {
        const [balance, walletBalance, lien, allowance] = await Promise.all([
          vesting.getUserBalanceAllTranches(appState.ethAddress),
          token.balanceOf(appState.ethAddress),
          vesting.getLien(appState.ethAddress),
          token.allowance(appState.ethAddress, ADDRESSES.stakingBridge),
        ]);
        appDispatch({
          type: AppStateActionType.UPDATE_ACCOUNT_BALANCES,
          balance: new BigNumber(balance),
          walletBalance,
          lien,
          allowance,
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    };

    if (appState.ethAddress) {
      updateBalances();
    }
  }, [appDispatch, appState.ethAddress, provider, staking, token, vesting]);

  // Updates on address change, getUserTrancheBalance has address as a dep
  React.useEffect(() => {
    if (appState.ethAddress) {
      getUserTrancheBalances();
    }
  }, [appState.ethAddress, getUserTrancheBalances]);

  // Clear connect timer on unmount
  React.useEffect(() => {
    return () => {
      if (connectTimer.current) {
        clearTimeout(connectTimer.current);
      }
    };
  }, []);

  return {
    ethAddress: appState.ethAddress,
    connect,
  };
}

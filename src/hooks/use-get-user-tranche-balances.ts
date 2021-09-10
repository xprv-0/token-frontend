import React from "react";
import {
  AppStateActionType,
  useAppState,
} from "../contexts/app-state/app-state-context";
import { useVegaVesting } from "./use-vega-vesting";
import * as Sentry from "@sentry/react";

export const useGetUserTrancheBalances = (address: string) => {
  const vesting = useVegaVesting();
  const { appDispatch } = useAppState();
  return React.useCallback(async () => {
    appDispatch({
      type: AppStateActionType.SET_TRANCHE_ERROR,
      error: null,
    });
    try {
      const tranches = await vesting.getAllTranches();
      const userTranches = tranches.filter((t) =>
        t.users.some(
          ({ address: a }) =>
            a && address && a.toLowerCase() === address.toLowerCase()
        )
      );
      const trancheIds = [0, ...userTranches.map((t) => t.tranche_id)];
      const promises = trancheIds.map(async (tId) => {
        const [total, vested] = await Promise.all([
          vesting.userTrancheTotalBalance(address, tId),
          vesting.userTrancheVestedBalance(address, tId),
        ]);
        return {
          id: tId,
          locked: total.minus(vested),
          vested,
        };
      });

      const trancheBalances = await Promise.all(promises);
      appDispatch({
        type: AppStateActionType.SET_TRANCHE_DATA,
        trancheBalances,
        tranches,
      });
    } catch (e) {
      Sentry.captureException(e);
      appDispatch({
        type: AppStateActionType.SET_TRANCHE_ERROR,
        error: e,
      });
    }
  }, [address, appDispatch, vesting]);
};

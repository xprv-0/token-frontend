import { BigNumber } from "../bignumber";
import type { Tranche } from "../vega-web3/vega-web3-types";

export function generateTranche(id: string | number): Tranche {
  return {
    tranche_id: id.toString(),
    tranche_start: new Date(),
    tranche_end: new Date(),
    total_added: new BigNumber(0),
    total_removed: new BigNumber(0),
    locked_amount: new BigNumber(0),
    deposits: [],
    withdrawals: [],
    users: [],
  };
}

export function generateTranches(count = 1) {
  return new Array(count).fill(null).map((_, i) => generateTranche(i));
}

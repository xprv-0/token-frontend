import { Tranche } from "../vega-web3/vega-web3-types";
import { IVegaVesting } from "../web3-utils";
import trancheData from "./tranche-data.json";

const BASE_URL = "mocks/vesting";

class MockedVesting implements IVegaVesting {
  private async performFetch(url: string) {
    const res = await fetch(`${BASE_URL}/${url}`);
    return await res.json();
  }

  getUserBalanceAllTranches(account: string): Promise<string> {
    return this.performFetch(`balance`);
  }
  getAllTranches(): Promise<Tranche[]> {
    // TODO populate with events
    // @ts-ignore
    return Promise.resolve(trancheData);
  }
}

export default MockedVesting;

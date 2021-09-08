import { BigNumber } from "../lib/bignumber";
import { Tranche } from "./vega-web3/vega-web3-types";

export type EthereumChainId = "0x1" | "0x3" | "0x4" | "0x5" | "0x2a";
export type EthereumChainName =
  | "Mainnet"
  | "Ropsten"
  | "Rinkeby"
  | "Goerli"
  | "Kovan";

export const EthereumChainNames: Record<EthereumChainId, EthereumChainName> = {
  "0x1": "Mainnet",
  "0x3": "Ropsten",
  "0x4": "Rinkeby",
  "0x5": "Goerli",
  "0x2a": "Kovan",
};

export const EthereumChainIds: Record<EthereumChainName, EthereumChainId> = {
  Mainnet: "0x1",
  Ropsten: "0x3",
  Rinkeby: "0x4",
  Goerli: "0x5",
  Kovan: "0x2a",
};

export type PromiEvent = typeof Promise & {
  on: (event: string, listener: (...args: any[]) => void) => PromiEvent;
  once: (event: string, listener: (...args: any[]) => void) => PromiEvent;
  off: (event?: string) => void;
};

export interface IStaking {
  stakeBalance(address: string, vegaKey: string): Promise<BigNumber>;
  totalStaked(): Promise<BigNumber>;
  removeStake(address: string, amount: string, vegaKey: string): PromiEvent;
  checkRemoveStake(
    address: string,
    amount: string,
    vegaKey: string
  ): Promise<any>;
  addStake(address: string, amount: string, vegaKey: string): PromiEvent;
  checkAddStake(address: string, amount: string, vegaKey: string): Promise<any>;
}

export interface IVegaStaking extends IStaking {
  checkTransferStake(
    address: string,
    amount: string,
    newAddress: string,
    vegaKey: string
  ): Promise<any>;
  transferStake(
    address: string,
    amount: string,
    newAddress: string,
    vegaKey: string
  ): PromiEvent;
}

export interface IVegaVesting extends IStaking {
  getUserBalanceAllTranches(address: string): Promise<BigNumber>;
  getLien(address: string): Promise<BigNumber>;
  getAllTranches(): Promise<Tranche[]>;
  userTrancheTotalBalance(address: string, tranche: number): Promise<BigNumber>;
  userTrancheVestedBalance(
    address: string,
    tranche: number
  ): Promise<BigNumber>;
  withdrawFromTranche(account: string, trancheId: number): PromiEvent;
  checkWithdrawFromTranche(account: string, trancheId: number): Promise<any>;
}

export interface IVegaClaim {
  commit(claimCode: string, account: string): PromiEvent;

  checkCommit(claimCode: string, account: string): Promise<any>;

  claim({
    claimCode,
    denomination,
    trancheId,
    expiry,
    nonce,
    country,
    targeted,
    account,
  }: {
    claimCode: string;
    denomination: BigNumber;
    trancheId: number;
    expiry: number;
    nonce: string;
    country: string;
    targeted: boolean;
    account: string;
  }): PromiEvent;

  checkClaim({
    claimCode,
    denomination,
    trancheId,
    expiry,
    nonce,
    country,
    targeted,
    account,
  }: {
    claimCode: string;
    denomination: BigNumber;
    trancheId: number;
    expiry: number;
    nonce: string;
    country: string;
    targeted: boolean;
    account: string;
  }): Promise<any>;
  isCommitted({
    claimCode,
    account,
  }: {
    claimCode: string;
    account: string;
  }): Promise<boolean>;

  isExpired(expiry: number): Promise<boolean>;
  isUsed(nonce: string): Promise<boolean>;
  isCountryBlocked(country: string): Promise<boolean>;
}

export interface IVegaToken {
  totalSupply(): Promise<BigNumber>;
  decimals(): Promise<number>;
  tokenData(): Promise<{ totalSupply: BigNumber; decimals: number }>;
  balanceOf(address: string): Promise<BigNumber>;
  approve(address: string, spender: string): PromiEvent;
  allowance(address: string, spender: string): Promise<BigNumber>;
}

export interface IVegaLPStaking {
  stakedBalance(account: string): Promise<BigNumber>;
  rewardsBalance(account: string): Promise<BigNumber>;
  estimateAPY(): Promise<BigNumber>;
  stake(amount: BigNumber, account: string): PromiEvent;
  unstake(account: string): PromiEvent;
}

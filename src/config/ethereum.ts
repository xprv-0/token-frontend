import { Networks } from "./vega";

const appChainId = process.env.REACT_APP_CHAIN as EthereumChainId;
const appEnv = process.env.REACT_APP_ENV as Networks;
const infuraId = process.env.REACT_APP_INFURA_ID;

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

interface VegaContracts {
  vestingAddress: string;
  vegaTokenAddress: string;
  claimAddress: string;
  lockedAddress: string;
  stakingBridge: string;
}

const EnvironmentConfig: { [key in Networks]: VegaContracts } = {
  [Networks.DEVNET]: {
    vegaTokenAddress: "0xc93137f9F4B820Ca85FfA3C7e84cCa6Ebc7bB517",
    claimAddress: "0x8Cef746ab7C83B61F6461cC92882bD61AB65a994",
    lockedAddress: "0x0",
    vestingAddress: "0xd751FF6264234cAfAE88e4BF6003878fAB9630a7",
    stakingBridge: "0x3cCe40e1e47cedf76c03db3E48507f421b575523",
  },
  [Networks.STAGNET]: {
    vestingAddress: "0xfCe6eB272D3d4146A96bC28de71212b327F575fa",
    vegaTokenAddress: "0x547cbA83a7eb82b546ee5C7ff0527F258Ba4546D",
    claimAddress: "0x8Cef746ab7C83B61F6461cC92882bD61AB65a994", // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: "0x0", // TODO not deployed to this env
    stakingBridge: "0x7D88CD817227D599815d407D929af18Bb8D57176",
  },
  [Networks.TESTNET]: {
    vestingAddress: "0x6A42ed1484f0E22e2Bcc29CEbA3bf305c52F55Be",
    vegaTokenAddress: "0xe55A846ced767ea49885B3BB9E1Bf5617E178182",
    claimAddress: "0x8Cef746ab7C83B61F6461cC92882bD61AB65a994", // TODO not deployed to this env, but random address so app doesn't error
    lockedAddress: "0x0", // TODO not deployed to this env
    stakingBridge: "0xB24e0ac9199e8f4F69eF0eD8ee266b2433AF0dF0",
  },
  [Networks.MAINNET]: {
    vestingAddress: "0x23d1bFE8fA50a167816fBD79D7932577c06011f4",
    vegaTokenAddress: "0xcB84d72e61e383767C4DFEb2d8ff7f4FB89abc6e",
    claimAddress: "0xd0db7b4c528c3a14648ced7064dd528595d5b273",
    lockedAddress: "0x78344c7305d73a7a0ac3c94cd9960f4449a1814e",
    stakingBridge: "0x195064D33f09e0c42cF98E665D9506e0dC17de68",
  },
};

const Addresses = {
  [EthereumChainIds.Mainnet]: EnvironmentConfig.MAINNET,
  [EthereumChainIds.Ropsten]: EnvironmentConfig[appEnv],
};

// No concept of dev/staging/test for these right now.
const RewardsAddresses = {
  [EthereumChainIds.Mainnet]: {
    "SushiSwap VEGA/ETH": "0x285de24077440c53b1661287D170e3ae22de0a44",
    "SushiSwap VEGA/USDC": "0x49407c243c26f109b3c77c41dd83742164c20b5f",
  } as { [key: string]: string },
  [EthereumChainIds.Ropsten]: {
    "SushiSwap VEGA/ETH": "0xa93dd6912897c5fe8503a82234d829bc7905714b",
    "SushiSwap VEGA/USDC": "0xa93dd6912897c5fe8503a82234d829bc7905714b",
  } as { [key: string]: string },
};

const RewardsPoolAddresses = {
  [EthereumChainIds.Mainnet]: {
    "0x285de24077440c53b1661287D170e3ae22de0a44":
      "0x29c827ce49accf68a1a278c67c9d30c52fbbc348",
    "0x49407c243c26f109b3c77c41dd83742164c20b5f":
      "0x42b7B8f8F83fA5cbf0176f8c24Ad51EbcD4B5F17",
  } as { [key: string]: string },
  [EthereumChainIds.Ropsten]: {
    "0xa93dd6912897c5fe8503a82234d829bc7905714b":
      "0x29c827ce49accf68a1a278c67c9d30c52fbbc348",
    // Same address so cannot have same key twice
    // "0xcc382BF2451d5eA0990Ed881aDbc85Ca49B9E672":
    //   "0x42b7b8f8f83fa5cbf0176f8c24ad51ebcd4b5f17",
  } as { [key: string]: string },
};

const InfuraUrls = {
  [EthereumChainIds.Mainnet]: `https://mainnet.infura.io/v3/${infuraId}`,
  [EthereumChainIds.Ropsten]: `https://ropsten.infura.io/v3/${infuraId}`,
};

/** Contract addresses for the different contracts in the VEGA ecosystem */
export const ADDRESSES = Addresses[appChainId];

/** Contract addresses for liquidity rewards for different markets */
export const REWARDS_ADDRESSES = RewardsAddresses[appChainId];
export const REWARDS_POOL_ADDRESSES = RewardsPoolAddresses[appChainId];

/** Infura endpoins */
export const INFURA_URL = InfuraUrls[appChainId];

/**
 * The Chain ID the environment is configured for.
 * Normally this is 0x3 (Ropsten) for dev and 0x1 (Mainnet) for prod
 */
export const APP_CHAIN_ID = appChainId;

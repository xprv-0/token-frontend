const TRUTHY = ["1", "true"];

export const Flags = {
  HOSTED_WALLET_ENABLED: TRUTHY.includes(
    process.env.REACT_APP_HOSTED_WALLET_ENABLED!
  ),
  IN_CONTEXT_TRANSLATION: TRUTHY.includes(
    process.env.REACT_APP_IN_CONTEXT_TRANSLATION!
  ),
  MOCK: TRUTHY.includes(process.env.REACT_APP_MOCKED!),
  DEX_STAKING_DISABLED: TRUTHY.includes(
    process.env.REACT_APP_DEX_STAKING_DISABLED!
  ),
  VESTING_DISABLED: TRUTHY.includes(process.env.REACT_APP_VESTING_DISABLED!),
  FAIRGROUND: TRUTHY.includes(process.env.REACT_APP_FAIRGROUND!),
  WITHDRAWS_DISABLED: TRUTHY.includes(
    process.env.REACT_APP_WITHDRAWS_DISABLED!
  ),
};

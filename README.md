# Token frontend

**_Control panel for your VEGA tokens_**

![preview](https://user-images.githubusercontent.com/6678/131992372-4a89d7ea-d9b3-4698-b767-e4464396a7d0.jpg)

## Features

- View vesting progress
- Redeem VEGA tokens
- Stake VEGA tokens

# Development

Install:
`yarn`

Add .env file in root:

```bash
// .env
REACT_APP_CHAIN=0x3
REACT_APP_VEGA_URL="https://n04.d.vega.xyz/query"
```

Starting the app:
`yarn start`

## Configuration

There are a few different configuration options offered for this app:

| **Flag**               | **Purpose**                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `REACT_APP_SENTRY_DSN` | The sentry endpoint to report to. Should be off in dev but set in live.                              |
| `REACT_APP_CHAIN`      | The ETH chain for the app to work on. Should be mainnet for live, but ropsten for preview deploys.   |
| `REACT_APP_VEGA_URL`   | The GraphQL query endpoint of a [Vega data node](https://github.com/vegaprotocol/networks#data-node) |

## Example configs:

For example configurations, check out our [netlify.toml](./netlify.toml).

## Testing

To run the minimal set of unit tests, run the following:

```bash
yarn install
yarn test
```

To run the UI automation tests with a mocked API, run:

```bash
yarn install
yarn add cypress
yarn start:mock &
cd automation
yarn
yarn cypress:open
```

## See also

- [vega-locked-erc20](https://github.com/vegaprotocol/vega-locked-erc20) - a proxy contract that shows your current balance
  of locked tokens.
- [VEGA Tokens: Vesting Details](https://blog.vega.xyz/vega-tokens-vesting-details-890b00fc238e) - a blog describing
  the vesting process & key dates.
- [Introducing the VEGA token](https://blog.vega.xyz/introducing-the-vega-token-40dac090b5c1) - a blog about the VEGA
  token.
- [The VEGA Token Listing & LP Incentives](https://blog.vega.xyz/unlocking-vega-coinlist-pro-uniswap-sushiswap-b1414750e358) - blog about the token and site
- [vega.xyz](https://vega.xyz) - about Vega Protocol

# License

[MIT](LICENSE)

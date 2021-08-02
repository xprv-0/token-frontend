[![Netlify Status](https://api.netlify.com/api/v1/badges/0c312b37-db30-47ed-b7fd-bda5304f5d77/deploy-status)](https://app.netlify.com/sites/token-vega-xyz/deploys)

# Setup

Install:
`yarn`

Add .env file in root:

```bash
// .env
REACT_APP_REDEEM_LIVE=0
REACT_APP_CHAIN=0x3
REACT_APP_SHOW_NETWORK_SWITCHER=1
```

Starting the app:
`yarn start`

# Configuration

There are a few different configration options offered for this app:

## REACT_APP_SENTRY_DSN

The sentry DNS to report to. Should be off in dev but set in live

<!-- Will be removed at some point -->

## REACT_APP_REDEEM_LIVE

We have not built the redeem pages at the time of writitng. This turns off all calls to action about the redeem pages.

## REACT_APP_CHAIN

The desired chain for the app to work on. Should be mainnet for live, but ropsten for preview deploys.

## REACT_APP_SHOW_NETWORK_SWITCHER

Allows you to change the above dynamically in the application. Useful for testing, should be on fopr preview deploys/dev but should be for live.

## Example configs:

The used config can be found in [netlify.toml](./netlify.toml).

```
REACT_APP_REDEEM_LIVE=0
REACT_APP_CHAIN=0x3
REACT_APP_SHOW_NETWORK_SWITCHER=1
```

Example config file for testnet:

```
REACT_APP_SENTRY_DSN=https://4b8c8a8ba07742648aa4dfe1b8d17e40@o286262.ingest.sentry.io/5882996
REACT_APP_REDEEM_LIVE=0
REACT_APP_CHAIN=0x3
REACT_APP_SHOW_NETWORK_SWITCHER=1
```

Example config for live:

```
REACT_APP_SENTRY_DSN=https://4b8c8a8ba07742648aa4dfe1b8d17e40@o286262.ingest.sentry.io/5882996
REACT_APP_REDEEM_LIVE=0
REACT_APP_CHAIN=0x1
REACT_APP_SHOW_NETWORK_SWITCHER=0
```

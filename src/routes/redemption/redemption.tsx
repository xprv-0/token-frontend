import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { EthConnectPrompt } from "../../components/eth-connect-prompt";
import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { useEthUser } from "../../hooks/use-eth-user";
import { useTranches } from "../../hooks/use-tranches";
import { useVegaVesting } from "../../hooks/use-vega-vesting";
import { RedemptionInformation } from "./home/redemption-information";
import {
  initialRedemptionState,
  RedemptionActionType,
  redemptionReducer,
} from "./redemption-reducer";
import { RedeemFromTranche } from "./tranche";

const RedemptionRouter = () => {
  const match = useRouteMatch();
  const vesting = useVegaVesting();
  const [state, dispatch] = React.useReducer(
    redemptionReducer,
    initialRedemptionState
  );
  const { ethAddress } = useEthUser();
  const tranches = useTranches();

  React.useEffect(() => {
    const run = (address: string) => {
      const userTranches = tranches.filter((t) =>
        t.users.some(
          ({ address: a }) => a.toLowerCase() === address.toLowerCase()
        )
      );
      dispatch({
        type: RedemptionActionType.SET_USER_TRANCHES,
        userTranches,
      });
    };

    if (ethAddress) {
      run(ethAddress);
    }
  }, [ethAddress, tranches, vesting]);

  if (!tranches.length) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  if (!ethAddress) {
    return <EthConnectPrompt />;
  }

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <RedemptionInformation state={state} address={ethAddress} />
      </Route>
      <Route path={`${match.path}/:id`}>
        <RedeemFromTranche state={state} address={ethAddress} />
      </Route>
    </Switch>
  );
};

export default RedemptionRouter;

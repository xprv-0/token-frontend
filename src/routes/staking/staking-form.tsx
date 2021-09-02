import "./staking-form.scss";

import React from "react";
import * as Sentry from "@sentry/react";
import { FormGroup, Radio, RadioGroup } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { useVegaWallet } from "../../hooks/use-vega-wallet";
import { gql, useApolloClient } from "@apollo/client";
import {
  PartyDelegations,
  PartyDelegationsVariables,
} from "./__generated__/PartyDelegations";
import { TokenInput } from "../../components/token-input";
import BigNumber from "bignumber.js";
import {
  DelegateSubmissionInput,
  UndelegateSubmissionInput,
} from "../../lib/vega-wallet/vega-wallet-service";
import { StakeSuccess } from "./stake-success";
import { StakePending } from "./stake-pending";
import { StakeFailure } from "./stake-failure";
import { useHistory } from "react-router-dom";
import { useSearchParams } from "../../hooks/use-search-params";
import { removeDecimal } from "../../lib/decimals";
import { useAppState } from "../../contexts/app-state/app-state-context";

export const PARTY_DELEGATIONS_QUERY = gql`
  query PartyDelegations($partyId: String!) {
    party(id: $partyId) {
      delegations {
        amount
        node {
          id
        }
        epoch
      }
    }
  }
`;

enum FormState {
  Default,
  Pending,
  Success,
  Failure,
}

export type StakeAction = "Add" | "Remove" | undefined;

interface StakingFormProps {
  nodeId: string;
  pubkey: string;
  availableStakeToAdd: BigNumber;
  availableStakeToRemove: BigNumber;
}

export const StakingForm = ({
  nodeId,
  pubkey,
  availableStakeToAdd,
  availableStakeToRemove,
}: StakingFormProps) => {
  const params = useSearchParams();
  const history = useHistory();
  const client = useApolloClient();
  const { appState } = useAppState();
  const [formState, setFormState] = React.useState(FormState.Default);
  const vegaWallet = useVegaWallet();
  const { t } = useTranslation();
  const [action, setAction] = React.useState<StakeAction>(params.action);
  const [amount, setAmount] = React.useState("");

  const maxDelegation = React.useMemo(() => {
    if (action === "Add") {
      return availableStakeToAdd;
    }

    if (action === "Remove") {
      return availableStakeToRemove;
    }
  }, [action, availableStakeToAdd, availableStakeToRemove]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState(FormState.Pending);
    const delegateInput: DelegateSubmissionInput = {
      pubKey: pubkey,
      delegateSubmission: {
        nodeId,
        amount: removeDecimal(new BigNumber(amount), appState.decimals),
      },
    };
    const undelegateInput: UndelegateSubmissionInput = {
      pubKey: pubkey,
      undelegateSubmission: {
        nodeId,
        amount: removeDecimal(new BigNumber(amount), appState.decimals),
        method: "METHOD_AT_END_OF_EPOCH",
      },
    };
    try {
      const command = action === "Add" ? delegateInput : undelegateInput;
      const [err] = await vegaWallet.commandSync(command);

      if (err) {
        setFormState(FormState.Failure);
        Sentry.captureException(err);
        console.log("err", err);
      }

      // await success via poll
    } catch (err) {
      console.log("catch", err);
      setFormState(FormState.Failure);
      Sentry.captureException(err);
    }
  }

  React.useEffect(() => {
    let interval: any;

    if (formState === FormState.Pending) {
      // start polling for delegation
      interval = setInterval(() => {
        client
          .query<PartyDelegations, PartyDelegationsVariables>({
            query: PARTY_DELEGATIONS_QUERY,
            variables: { partyId: pubkey },
          })
          .then((res) => {
            const delegation = res.data.party?.delegations?.find((d) => {
              return d.node.id === nodeId; // && d.epoch === the next epoch?
            });

            if (delegation) {
              setFormState(FormState.Success);
              clearInterval(interval);
            }
          })
          .catch((err) => console.log(err));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [formState, client, pubkey, nodeId]);

  if (formState === FormState.Failure) {
    return <StakeFailure nodeId={nodeId} />;
  }

  if (formState === FormState.Pending) {
    return <StakePending action={action} amount={amount} nodeId={nodeId} />;
  }

  if (formState === FormState.Success) {
    return <StakeSuccess action={action} amount={amount} nodeId={nodeId} />;
  }

  return (
    <>
      <h2>{t("Manage your stake")}</h2>
      <form onSubmit={onSubmit} data-testid="stake-form">
        <FormGroup>
          <RadioGroup
            onChange={(e) => {
              // @ts-ignore
              const value = e.target.value;
              setAction(value);
              history.replace({
                pathname: history.location.pathname,
                search: `?action=${value}`,
              });
            }}
            selectedValue={action}
            inline={true}
          >
            <Radio value="Add" label="Add" data-testid="add-stake-radio" />
            <Radio
              value="Remove"
              label="Remove"
              data-testid="remove-stake-radio"
            />
          </RadioGroup>
        </FormGroup>
        {action !== undefined && (
          <>
            <h2>{t("How much to {{action}} in next epoch?", { action })}</h2>
            <TokenInput
              amount={amount}
              setAmount={setAmount}
              maximum={maxDelegation}
            />
            <button className="fill" type="submit">
              {`${action}${amount ? ` ${amount}` : ""}`} {t("vegaTokens")}
            </button>
          </>
        )}
      </form>
    </>
  );
};

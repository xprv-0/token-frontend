import { gql, useQuery } from "@apollo/client";
import { Callout } from "@vegaprotocol/ui-toolkit";
import compact from "lodash/compact";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import React from "react";
import { useTranslation } from "react-i18next";

import { SplashLoader } from "../../components/splash-loader";
import { SplashScreen } from "../../components/splash-screen";
import { Proposals } from "./__generated__/Proposals";
import { PROPOSALS_FRAGMENT } from "./proposal-fragment";
import { ProposalsList } from "./proposals-list";

export const PROPOSALS_QUERY = gql`
  ${PROPOSALS_FRAGMENT}
  query Proposals {
    proposals {
      ...ProposalFields
    }
  }
`;

export const ProposalsContainer = () => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<Proposals, never>(PROPOSALS_QUERY, {
    pollInterval: 5000,
  });

  const proposals = React.useMemo(() => {
    if (!data?.proposals?.length) {
      return [];
    }

    return flow([
      compact,
      (arr) =>
        orderBy(
          arr,
          [
            (p) => new Date(p.terms.enactmentDatetime),
            (p) => new Date(p.terms.closingDatetime),
          ],
          ["desc", "desc"]
        ),
    ])(data.proposals);
  }, [data]);

  if (error) {
    return (
      <Callout intent="error" title={t("Something went wrong")}>
        <pre>{error.message}</pre>
      </Callout>
    );
  }

  if (loading) {
    return (
      <SplashScreen>
        <SplashLoader />
      </SplashScreen>
    );
  }

  return <ProposalsList proposals={proposals} />;
};

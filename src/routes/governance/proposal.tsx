import { useTranslation } from "react-i18next";

import { Heading } from "../../components/heading";
import { Proposal_proposal } from "./__generated__/Proposal";
import { NetworkChange } from "./network-change";
import { VoteDetails } from "./vote-details";

interface ProposalProps {
  proposal: Proposal_proposal;
}

export const Proposal = ({ proposal }: ProposalProps) => {
  const { t } = useTranslation();

  if (!proposal) {
    return null;
  }

  return (
    <>
      <Heading title={t("updateNetworkParam")} />
      <NetworkChange proposal={proposal} />
      <VoteDetails proposal={proposal} />
    </>
  );
};

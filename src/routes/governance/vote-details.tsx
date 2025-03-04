import "./vote-details.scss";

import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

import { ProposalState } from "../../__generated__/globalTypes";
import { formatNumber } from "../../lib/format-number";
import { Proposal_proposal } from "./__generated__/Proposal";
import { CurrentProposalStatus } from "./current-proposal-status";
import { useVoteInformation } from "./hooks";
import { useUserVote } from "./use-user-vote";
import { VoteButtonsContainer } from "./vote-buttons";
import { VoteProgress } from "./vote-progress";

interface VoteDetailsProps {
  proposal: Proposal_proposal;
}

export const VoteDetails = ({ proposal }: VoteDetailsProps) => {
  const {
    totalTokensPercentage,
    participationMet,
    totalTokensVoted,
    noPercentage,
    yesPercentage,
    yesTokens,
    noTokens,
    requiredMajorityPercentage,
    requiredParticipation,
  } = useVoteInformation({ proposal });

  const { t } = useTranslation();
  const { voteState, voteDatetime, castVote } = useUserVote(
    proposal.id,
    proposal.votes.yes.votes,
    proposal.votes.no.votes
  );

  const defaultDecimals = 2;
  const daysLeft = t("daysLeft", {
    daysLeft: formatDistanceToNow(new Date(proposal.terms.closingDatetime)),
  });

  return (
    <section>
      <h3 className="proposal__sub-title">{t("votes")}</h3>
      <p className="proposal__set_to">
        <span>
          <CurrentProposalStatus proposal={proposal} />
        </span>
        .&nbsp;
        {proposal.state === ProposalState.Open ? daysLeft : null}
      </p>
      <table className="vote-details__table">
        <thead>
          <tr>
            <th>{t("for")}</th>
            <th>
              <VoteProgress
                threshold={requiredMajorityPercentage}
                progress={yesPercentage}
              />
            </th>
            <th>{t("against")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{yesPercentage.toFixed(defaultDecimals)}%</td>
            <td className="vote-details__summary">
              {t("majorityRequired")}{" "}
              {requiredMajorityPercentage.toFixed(defaultDecimals)}%
            </td>
            <td>{noPercentage.toFixed(defaultDecimals)}%</td>
          </tr>
          <tr>
            <td className="text-muted">
              {" "}
              {formatNumber(yesTokens, defaultDecimals)}
            </td>
            <td></td>
            <td className="text-muted">
              {formatNumber(noTokens, defaultDecimals)}
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        {t("participation")}
        {": "}
        {participationMet ? (
          <span className="vote-details__participation-met">{t("met")}</span>
        ) : (
          <span className="vote-details__participation-not-met">
            {t("notMet")}
          </span>
        )}{" "}
        {formatNumber(totalTokensVoted, defaultDecimals)}{" "}
        {formatNumber(totalTokensPercentage, defaultDecimals)}%
        <span className="vote-details__required-participation text-muted">
          (
          {formatNumber(
            requiredParticipation.multipliedBy(100),
            defaultDecimals
          )}
          % {t("governanceRequired")})
        </span>
      </p>
      <h3>{t("yourVote")}</h3>
      <VoteButtonsContainer
        voteState={voteState}
        castVote={castVote}
        voteDatetime={voteDatetime}
        proposalState={proposal.state}
      />
    </section>
  );
};

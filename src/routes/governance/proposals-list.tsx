import { format } from "date-fns";
import "./proposals-list.scss";

import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import {
  Proposals_proposals,
  Proposals_proposals_terms_change_UpdateNetworkParameter,
} from "./__generated__/Proposals";
import { CurrentProposalStatus } from "./current-proposal-status";
import { Heading } from "../../components/heading";

const DATE_FORMAT = "d MMM yyyy HH:mm";

interface ProposalsListProps {
  proposals: Proposals_proposals[];
}

export const ProposalsList = ({ proposals }: ProposalsListProps) => {
  const { t } = useTranslation();
  const match = useRouteMatch();

  const filteredData = proposals.filter((row) => {
    return row.terms.change.__typename === "UpdateNetworkParameter";
  });

  if (filteredData.length === 0) {
    return <p>{t("noProposals")}</p>;
  }

  const renderRow = (row: Proposals_proposals) => {
    const enactmentDate = new Date(row.terms.enactmentDatetime);
    return (
      <li className="proposals-list__main-list-item" key={row.id}>
        <div className="proposals-list__row">
          <Link
            className="proposals-list__first-item"
            to={`${match.path}/${row.id}`}
          >
            {
              (
                row.terms
                  .change as Proposals_proposals_terms_change_UpdateNetworkParameter
              ).networkParameter.key
            }
          </Link>
          <p className="proposals-list__item-right">
            {
              (
                row.terms
                  .change as Proposals_proposals_terms_change_UpdateNetworkParameter
              ).networkParameter!.value
            }
          </p>
        </div>
        <div className="proposals-list__row">
          <p className="proposals-list__item-left-low-key">{t("closesOn")}</p>
          <span className="proposals-list__item-right">
            {format(new Date(row.terms.closingDatetime), DATE_FORMAT)}
          </span>
        </div>
        <div className="proposals-list__row">
          <p className="proposals-list__item-left-low-key">
            {t("proposedEnactment")}
          </p>
          <span className="proposals-list__item-right">
            {format(enactmentDate, DATE_FORMAT)}
          </span>
        </div>

        <div className="proposals-list__row proposals-list__border">
          <p className="proposals-list__item-left-low-key">{t("voteStatus")}</p>
          <CurrentProposalStatus proposal={row} />
        </div>
      </li>
    );
  };

  return (
    <>
      <Heading title={t("pageTitleGovernance")} />
      <p>{t("proposedChangesToVegaNetwork")}</p>
      <p>{t("vegaTokenHoldersCanVote")}</p>
      <p>{t("requiredMajorityDescription")}</p>
      <h2>{t("proposals")}</h2>
      <ul className="proposals-list__main-list">
        {filteredData.map((row) => renderRow(row))}
      </ul>
    </>
  );
};

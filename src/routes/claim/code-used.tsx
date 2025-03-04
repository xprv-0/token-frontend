import { Callout } from "@vegaprotocol/ui-toolkit";
import { useTranslation } from "react-i18next";

import { Error } from "../../components/icons";
import { ADDRESSES } from "../../config";

export const CodeUsed = () => {
  const { t } = useTranslation();
  return (
    <Callout intent="action" icon={<Error />} title={t("codeUsed")}>
      <p>{t("codeUsedText")}</p>
      <h4>
        {t(
          "Keep track of locked tokens in your wallet with the VEGA (VESTING) token."
        )}
      </h4>
      <p>
        {t(
          "The token address is {{address}}. Hit the add token button in your ERC20 wallet and enter this address.",
          {
            address: ADDRESSES.lockedAddress,
          }
        )}
      </p>
    </Callout>
  );
};

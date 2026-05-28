import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  getGroupedSecurityDetailReasons,
  hasGroupedSecurityDetails,
} from '@popup/evm/utils/evm-grouped-security-warning.utils';
import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface Props {
  warning: EvmTransactionWarning;
  onIconClick?: () => void;
  showLeadingIcon?: boolean;
  defaultDetailsExpanded?: boolean;
}

export const GroupedSecurityWarningMessage = ({
  warning,
  onIconClick,
  showLeadingIcon = true,
  defaultDetailsExpanded = false,
}: Props) => {
  const detailReasons = getGroupedSecurityDetailReasons(warning);
  const hasDetails = hasGroupedSecurityDetails(warning);
  const [detailsExpanded, setDetailsExpanded] = useState(defaultDetailsExpanded);

  const toggleDetails = () => {
    setDetailsExpanded((expanded) => !expanded);
  };

  return (
    <div className="grouped-security-warning">
      <div className="grouped-security-warning__summary">
        {showLeadingIcon && (
          <>
            {!warning.ignored && (
              <SVGIcon
                className={`warning-icon ${warning.level}`}
                icon={SVGIcons.GLOBAL_WARNING}
                onClick={onIconClick}
              />
            )}
            {warning.ignored && (
              <SVGIcon
                className="warning-icon"
                icon={SVGIcons.GLOBAL_CHECK}
                onClick={onIconClick}
              />
            )}
          </>
        )}
        <div className="grouped-security-warning__summary-text">
          {chrome.i18n.getMessage(warning.message, warning.messageParams ?? [])}
        </div>
      </div>
      {hasDetails && (
        <>
          {!detailsExpanded && (
            <button
              type="button"
              className="grouped-security-warning__toggle"
              onClick={toggleDetails}>
              {chrome.i18n.getMessage('evm_security_warning_show_details')}
            </button>
          )}
          {detailsExpanded && (
            <ul
              className="grouped-security-warning__details"
              onClick={toggleDetails}>
              {detailReasons.map((detail, index) => (
                <li key={`${detail.message}-${index}`}>
                  {chrome.i18n.getMessage(
                    detail.message,
                    detail.messageParams ?? [],
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

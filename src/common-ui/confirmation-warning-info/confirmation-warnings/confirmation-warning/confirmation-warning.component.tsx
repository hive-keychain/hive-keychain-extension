import { isGroupedSecurityWarning } from '@popup/evm/utils/evm-grouped-security-warning.utils';
import React from 'react';
import { TransactionWarning } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { GroupedSecurityWarningMessage } from 'src/common-ui/evm/grouped-security-warning-message/grouped-security-warning-message.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface ConfirmationWarningProps {
  warning: TransactionWarning;
  key: string;
  onWarningClicked: () => void;
}

export const ConfirmationWarning = ({
  warning,
  onWarningClicked,
}: ConfirmationWarningProps) => {
  if (isGroupedSecurityWarning(warning)) {
    return (
      <div className="warning">
        <GroupedSecurityWarningMessage
          warning={warning}
          onIconClick={onWarningClicked}
        />
      </div>
    );
  }

  return (
    <div className="warning">
      {!warning.ignored && (
        <SVGIcon
          className={`warning-icon ${warning.level}`}
          icon={SVGIcons.GLOBAL_WARNING}
          onClick={() => onWarningClicked()}
        />
      )}
      {warning.ignored && (
        <SVGIcon
          className={`warning-icon`}
          icon={SVGIcons.GLOBAL_CHECK}
          onClick={() => onWarningClicked()}
        />
      )}
      <div className="warning-message">
        {chrome.i18n.getMessage(warning?.message!, warning.messageParams ?? [])}
      </div>
    </div>
  );
};

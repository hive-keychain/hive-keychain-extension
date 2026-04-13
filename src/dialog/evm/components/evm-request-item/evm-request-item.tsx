import {
  EvmTransactionWarning,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmRequestItemLongText } from 'src/dialog/evm/components/evm-request-item/evm-request-item-long-text/evm-request-item-long-text';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

import sanitize from 'sanitize-html';

export interface EvmRequestItemProps {
  field: TransactionConfirmationField;
  onWarningClicked?: (warningIndex: number) => void;
}

export const EvmRequestItem = ({
  field,
  onWarningClicked,
}: EvmRequestItemProps) => {
  const [showWarnings, setShowWarnings] = useState(false);
  const fieldTitle = useFieldTitle(field.name);
  const renderField = () => {
    switch (field.type) {
      case EvmInputDisplayType.LONG_TEXT:
        return (
          <EvmRequestItemLongText title={field.name} value={field.value} />
        );
      default: {
        return (
          <>
            {fieldTitle && <div className="label">{fieldTitle}</div>}
            <div className="value">{field.value}</div>
          </>
        );
      }
    }
  };

  const handleOnWarningClicked = (index: number) => {
    if (onWarningClicked) onWarningClicked(index);
  };

  const displayWarningIcon = (warnings: EvmTransactionWarning[]) => {
    const highestWarning =
      EvmTransactionParserUtils.getHighestWarning(warnings);

    const toggleShowWarnings = () => {
      if (field.warnings && field.warnings.length > 1) {
        setShowWarnings(!showWarnings);
      } else if (field.warnings && field.warnings.length === 1) {
        if (onWarningClicked) onWarningClicked(0);
      }
    };
    return (
      <>
        {!highestWarning.ignored && (
          <SVGIcon
            className={`warning-icon ${highestWarning.level}`}
            icon={SVGIcons.GLOBAL_WARNING}
            onClick={() => toggleShowWarnings()}
          />
        )}
        {highestWarning.ignored && (
          <SVGIcon
            className={`warning-icon`}
            icon={SVGIcons.GLOBAL_CHECK}
            onClick={() => toggleShowWarnings()}
          />
        )}
      </>
    );
  };

  return (
    <div className="field-container" style={field.style}>
      <div className="field-content">
        {field.warnings && field.warnings.length > 0 && (
          <div className="warning">{displayWarningIcon(field.warnings)}</div>
        )}
        <div className={`field ${sanitize(field.type)}`}>{renderField()}</div>
      </div>
      {showWarnings && field.warnings && field.warnings.length > 0 && (
        <div className="warning-container">
          {field.warnings.map((warning, index) => (
            <div className="warning" key={`warning-${index}`}>
              {!warning.ignored && (
                <SVGIcon
                  className={`warning-icon ${warning.level}`}
                  icon={SVGIcons.GLOBAL_WARNING}
                  onClick={() => handleOnWarningClicked(index)}
                />
              )}
              {warning.ignored && (
                <SVGIcon
                  className={`warning-icon`}
                  icon={SVGIcons.GLOBAL_CHECK}
                  onClick={() => handleOnWarningClicked(index)}
                />
              )}
              <div className="warning-message">
                {chrome.i18n.getMessage(
                  warning?.message!,
                  warning.messageParams ?? [],
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {field.information && field.information.length > 0 && (
        <div className="information-container">
          {field.information.map((information, index) => (
            <div className="information" key={`information-${index}`}>
              <SVGIcon
                className={`information-icon`}
                icon={SVGIcons.GLOBAL_INFO}
              />
              <div className="information-message">
                {chrome.i18n.getMessage(
                  information?.message!,
                  information.messageParams ?? [],
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

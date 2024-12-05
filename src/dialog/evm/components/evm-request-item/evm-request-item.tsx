import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { EvmRequestItemLongText } from 'src/dialog/evm/components/evm-request-item/evm-request-item-long-text/evm-request-item-long-text';
import { useFieldTitle } from 'src/dialog/evm/components/use-field-title.hook';

export interface EvmRequestItemProps {
  field: TransactionConfirmationField;
  onWarningClicked?: (warningIndex: number) => void;
}

export const EvmRequestItem = ({
  field,
  onWarningClicked,
}: EvmRequestItemProps) => {
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
            <div className="label">{fieldTitle}</div>
            <div className="value">{field.value}</div>
          </>
        );
      }
    }
  };

  const handleOnWarningClicked = (index: number) => {
    if (onWarningClicked) onWarningClicked(index);
  };

  return (
    <div className="field-container">
      <div className={`field ${field.type}`}>{renderField()}</div>
      {field.warnings && field.warnings.length > 0 && (
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

import { TransactionConfirmationField } from '@popup/evm/interfaces/evm-transactions.interface';
import React from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
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

  //   switch (field.type) {
  //     case 'address':
  //       return <EvmRequestItemAddress {...field} />;
  //     case 'number':
  //     case 'uint256':
  //       return <EvmRequestItemNumber {...field} />;
  //     case 'string':
  //       return <EvmRequestItemString {...field} />;
  //     default:
  //       return <div>Type not defined</div>;
  //   }

  const handleOnWarningClicked = (index: number) => {
    if (onWarningClicked) onWarningClicked(index);
  };

  return (
    <div className="field-container">
      <div className="field">
        <div className="label">{fieldTitle}</div>
        <div className="value">{field.value}</div>
      </div>
      {field.warnings && field.warnings.length > 0 && (
        <div className="warning-container">
          {field.warnings.map((warning, index) => (
            <div className="warning">
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
                {chrome.i18n.getMessage(warning?.message!)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

/** Collapsible value row when decoded args (e.g. bytes32) render as long hex strings. */
const COLLAPSIBLE_STRING_VALUE_MIN_LENGTH = 48;

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
          <EvmRequestItemLongText
            title={field.name}
            value={field.value}
            titleSuffix={warningIcon}
          />
        );
      default: {
        const raw = field.value;
        const useCollapsibleString =
          field.type !== EvmInputDisplayType.WARNING_ONLY &&
          typeof raw === 'string' &&
          raw.length >= COLLAPSIBLE_STRING_VALUE_MIN_LENGTH;
        const widenTupleBlock = field.type === EvmInputDisplayType.TUPLE;

        return (
          <>
            {fieldTitle && (
              <div className="label">
                {fieldTitle}
                {warningIcon}
              </div>
            )}
            <div
              className={`value${useCollapsibleString ? ' value--collapsible' : ''}${widenTupleBlock ? ' value--tuple-block' : ''}`}>
              {useCollapsibleString ? (
                <EvmRequestItemLongText value={raw} />
              ) : (
                raw
              )}
            </div>
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

  const warningIcon =
    field.warnings && field.warnings.length > 0
      ? displayWarningIcon(field.warnings)
      : null;

  return (
    <div className="field-container" style={field.style}>
      <div className="field-content">
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

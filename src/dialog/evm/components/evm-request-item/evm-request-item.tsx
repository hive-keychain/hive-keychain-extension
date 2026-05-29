import {
  EvmTransactionWarning,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import React from 'react';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
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
  const fieldTitle = useFieldTitle(field.name);

  const handleWarningIconClick = () => {
    if (onWarningClicked) {
      onWarningClicked(0);
    }
  };

  const displayWarningIcon = (warnings: EvmTransactionWarning[]) => {
    const highestWarning =
      EvmTransactionParserUtils.getHighestWarning(warnings);

    return (
      <>
        {!highestWarning.ignored && (
          <SVGIcon
            className={`warning-icon ${highestWarning.level}`}
            icon={EvmRiskWarningUtils.getWarningIcon(highestWarning.level)}
            onClick={handleWarningIconClick}
          />
        )}
        {highestWarning.ignored && (
          <SVGIcon
            className="warning-icon"
            icon={SVGIcons.GLOBAL_CHECK}
            onClick={handleWarningIconClick}
          />
        )}
      </>
    );
  };

  const warningIcon =
    field.warnings && field.warnings.length > 0
      ? displayWarningIcon(field.warnings)
      : null;

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

        if (field.type === EvmInputDisplayType.TUPLE) {
          return (
            <EvmRequestItemLongText
              title={field.name}
              value={raw}
              titleSuffix={warningIcon}
            />
          );
        }

        const valueClassName = `value${useCollapsibleString ? ' value--collapsible' : ''}`;
        const valueBody = useCollapsibleString ? (
          <EvmRequestItemLongText value={raw} />
        ) : (
          raw
        );

        if (!fieldTitle && warningIcon) {
          return (
            <div className={`${valueClassName} value--leading-warning-icon`}>
              {warningIcon}
              <div className="value__body">{valueBody}</div>
            </div>
          );
        }

        return (
          <>
            {fieldTitle && (
              <div className="label">
                {fieldTitle}
                {warningIcon}
              </div>
            )}
            <div className={valueClassName}>{valueBody}</div>
          </>
        );
      }
    }
  };

  return (
    <div className="field-container" style={field.style}>
      <div className="field-content">
        <div className={`field ${sanitize(field.type)}`}>{renderField()}</div>
      </div>
      {field.information && field.information.length > 0 && (
        <div className="information-container">
          {field.information.map((information, index) => (
            <div className="information" key={`information-${index}`}>
              <SVGIcon
                className="information-icon"
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

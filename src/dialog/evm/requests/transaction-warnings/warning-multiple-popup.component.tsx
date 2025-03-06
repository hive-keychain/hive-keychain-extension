import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { ConfirmationPageEvmFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  warningHook: useTransactionHook;
}

export const EvmMultipleWarningsPopup = ({ warningHook }: Props) => {
  const fieldWarningTemplate = (
    field: ConfirmationPageEvmFields | TransactionConfirmationField,
  ) => {
    return (
      <>
        {field.name && (
          <div className="field-name">{chrome.i18n.getMessage(field.name)}</div>
        )}
        {field.warnings?.map(
          (warning: EvmTransactionWarning, warningIndex: number) => {
            if (warning.ignored === false) {
              return (
                <div
                  className="warning"
                  key={`warning-${field.name}-warning-${warningIndex}`}>
                  <SVGIcon
                    className={`warning-icon ${warning?.level}`}
                    icon={SVGIcons.GLOBAL_WARNING}
                  />
                  <div className="warning-message">
                    {chrome.i18n.getMessage(warning?.message!)}
                  </div>
                </div>
              );
            }
          },
        )}
      </>
    );
  };

  return (
    <PopupContainer
      className="transaction-warning-content"
      onClickOutside={warningHook.closePopup}>
      <div className="warning-top-panel">
        <SVGIcon className="icon" icon={SVGIcons.MESSAGE_ERROR} />
        <div className={`title`}>
          {chrome.i18n.getMessage('evm_transaction_transaction_has_warning')}
        </div>
      </div>
      <div className="warnings">
        {warningHook
          .getAllFieldsWithNotIgnoredWarnings()
          .map(
            (field: ConfirmationPageEvmFields | TransactionConfirmationField) =>
              fieldWarningTemplate(field),
          )}

        {/* {warningHook.duplicatedTransactionField &&
          fieldWarningTemplate(warningHook.duplicatedTransactionField)} */}
      </div>

      {EvmTransactionParserUtils.getHighestWarning(
        warningHook.getAllNotIgnoredWarnings(),
      ) === EvmTransactionWarningLevel.HIGH && (
        <CheckboxPanelComponent
          onChange={(value) => warningHook.setBypassWarning(value)}
          checked={warningHook.bypassWarning}
          title="evm_transaction_warning_high_level_bypass_message"
          backgroundType={BackgroundType.FILLED}
        />
      )}

      <div className="buttons-container">
        <ButtonComponent
          label="dialog_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={warningHook.closePopup}
          height="small"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="evm_send_transaction_ignore_all_warnings"
          onClick={warningHook.ignoreAllWarnings}
          height="small"
          disabled={
            EvmTransactionParserUtils.getHighestWarning(
              warningHook.getAllNotIgnoredWarnings(),
            ) === EvmTransactionWarningLevel.HIGH && !warningHook.bypassWarning
          }
        />
      </div>
    </PopupContainer>
  );
};

import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import React, { Fragment } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { ConfirmationPageEvmFields } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { EvmRiskWarningRow } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning-row.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

import { I18nUtils } from 'src/utils/i18n.utils';
interface Props {
  warningHook: useTransactionHook;
}

export const EvmMultipleWarningsPopup = ({ warningHook }: Props) => {
  const activeWarnings = warningHook.getPopupNotIgnoredWarnings();
  const highestLevel =
    EvmRiskWarningUtils.getHighestLevelFromWarnings(activeWarnings) ??
    EvmTransactionWarningLevel.LOW;
  const levelClass = EvmRiskWarningUtils.getLevelModifierClass(highestLevel);

  const fieldWarningTemplate = (
    field: ConfirmationPageEvmFields | TransactionConfirmationField,
    fieldIndex: number,
  ) => {
    return (
      <Fragment key={`warning-field-${field.name}-${fieldIndex}`}>
        {field.name && (
          <div className="field-name">{I18nUtils.getMessage(field.name)}</div>
        )}
        {field.warnings?.map(
          (warning: EvmTransactionWarning, warningIndex: number) => {
            if (warning.ignored === false) {
              return (
                <Fragment
                  key={`warning-${field.name}-${warningIndex}`}>
                  <EvmRiskWarningRow
                    warning={warning}
                    variant="panel"
                  />
                  {warning.type ===
                    EvmTransactionWarningType.WHITELIST_ADDRESS && (
                    <InputComponent
                      value={
                        warningHook.whitelistLabels[
                          EvmRiskWarningUtils.getWhitelistLabelKey(
                            field.name,
                            warningIndex,
                          )
                        ] ?? ''
                      }
                      type={InputType.TEXT}
                      placeholder={
                        warning.extraData?.placeholder ??
                        'evm_transaction_receiver_favorite_label'
                      }
                      onChange={(value) =>
                        warningHook.setWhitelistLabelForWarning(
                          field.name,
                          warningIndex,
                          value,
                        )
                      }
                    />
                  )}
                </Fragment>
              );
            }
            return null;
          },
        )}
      </Fragment>
    );
  };

  return (
    <PopupContainer
      useBodyPortal
      className="transaction-warning-content"
      onClickOutside={warningHook.closePopup}>
      <div className={`evm-risk-modal-header ${levelClass}`}>
        <SVGIcon
          className="evm-risk-modal-header__icon"
          icon={EvmRiskWarningUtils.getWarningIcon(highestLevel)}
        />
        <div className="evm-risk-modal-header__title">
          {I18nUtils.getMessage(
            EvmRiskWarningUtils.getModalTitleKey(highestLevel),
          )}
        </div>
      </div>
      <div className="warnings">
        {warningHook
          .getFieldsForWarningsPopup()
          .map(
            (
              field: ConfirmationPageEvmFields | TransactionConfirmationField,
              index: number,
            ) => fieldWarningTemplate(field, index),
          )}
      </div>

      {highestLevel === EvmTransactionWarningLevel.HIGH && (
        <CheckboxPanelComponent
          onChange={(value) => warningHook.setBypassWarning(value)}
          checked={warningHook.bypassWarning}
          title="evm_transaction_warning_high_level_bypass_message"
          backgroundType={BackgroundType.TRANSPARENT}
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
          label="evm_send_transaction_ignore_warning"
          onClick={warningHook.ignorePopupWarnings}
          height="small"
          disabled={
            highestLevel === EvmTransactionWarningLevel.HIGH &&
            !warningHook.bypassWarning
          }
        />
      </div>
    </PopupContainer>
  );
};

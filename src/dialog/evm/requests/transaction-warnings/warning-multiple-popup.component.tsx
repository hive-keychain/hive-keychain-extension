import {
  EvmTransactionWarning,
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
  TransactionConfirmationField,
} from '@popup/evm/interfaces/evm-transactions.interface';
import React, { Fragment, useState } from 'react';
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
  warningHook?: useTransactionHook;
  warningHooks?: useTransactionHook[];
  onClose?: () => void;
}

export const EvmMultipleWarningsPopup = ({
  warningHook,
  warningHooks,
  onClose,
}: Props) => {
  const [batchBypass, setBatchBypass] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const hooks = warningHooks ?? (warningHook ? [warningHook] : []);
  const activeWarnings = hooks.flatMap((hook) =>
    warningHooks
      ? hook.getAllNotIgnoredWarnings()
      : hook.getPopupNotIgnoredWarnings(),
  );
  const highestLevel =
    EvmRiskWarningUtils.getHighestLevelFromWarnings(activeWarnings) ??
    EvmTransactionWarningLevel.LOW;
  const levelClass = EvmRiskWarningUtils.getLevelModifierClass(highestLevel);

  const fieldWarningTemplate = (
    field: ConfirmationPageEvmFields | TransactionConfirmationField,
    fieldIndex: number,
    hook: useTransactionHook,
    callIndex: number,
  ) => {
    return (
      <Fragment key={`warning-field-${callIndex}-${field.name}-${fieldIndex}`}>
        {field.name && (
          <div className="field-name">{I18nUtils.getMessage(field.name)}</div>
        )}
        {field.warnings?.map(
          (warning: EvmTransactionWarning, warningIndex: number) => {
            if (warning.ignored === false) {
              return (
                <Fragment
                  key={`warning-${callIndex}-${field.name}-${warningIndex}`}>
                  <EvmRiskWarningRow
                    warning={warning}
                    variant="panel"
                  />
                  {warning.type ===
                    EvmTransactionWarningType.WHITELIST_ADDRESS && (
                    <InputComponent
                      value={
                        hook.whitelistLabels[
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
                        hook.setWhitelistLabelForWarning(
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

  const close = () => {
    hooks.forEach((hook) => hook.closePopup());
    onClose?.();
  };

  const acknowledge = async () => {
    if (acknowledging) return;
    setAcknowledging(true);
    try {
      await Promise.all(hooks.map((hook) => hook.ignorePopupWarnings()));
      onClose?.();
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <PopupContainer
      useBodyPortal
      className="transaction-warning-content"
      onClickOutside={close}>
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
        {hooks.map((hook, callIndex) => (
          <Fragment key={callIndex}>
            {warningHooks && hook.getFieldsForWarningsPopup().length > 0 && (
              <div className="field-name">
                {I18nUtils.getMessage('evm_batch_call', [String(callIndex + 1)])}
              </div>
            )}
            {hook
              .getFieldsForWarningsPopup()
              .map((field, fieldIndex) =>
                fieldWarningTemplate(field, fieldIndex, hook, callIndex),
              )}
          </Fragment>
        ))}
      </div>

      {highestLevel === EvmTransactionWarningLevel.HIGH && (
        <CheckboxPanelComponent
          onChange={(value) =>
            warningHooks
              ? setBatchBypass(value)
              : warningHook?.setBypassWarning(value)
          }
          checked={
            warningHooks ? batchBypass : warningHook?.bypassWarning ?? false
          }
          title="evm_transaction_warning_high_level_bypass_message"
          backgroundType={BackgroundType.TRANSPARENT}
        />
      )}

      <div className="buttons-container">
        <ButtonComponent
          label="dialog_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={close}
          height="small"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="evm_send_transaction_ignore_warning"
          onClick={() => void acknowledge()}
          height="small"
          disabled={
            highestLevel === EvmTransactionWarningLevel.HIGH &&
            !(warningHooks ? batchBypass : warningHook?.bypassWarning)
          }
        />
      </div>
    </PopupContainer>
  );
};

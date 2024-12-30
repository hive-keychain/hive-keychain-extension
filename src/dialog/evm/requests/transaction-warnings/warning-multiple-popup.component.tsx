import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

interface Props {
  warningHook: useTransactionHook;
}

export const EvmWarningMultiplePopupComponent = ({ warningHook }: Props) => {
  return (
    <PopupContainer
      className="transaction-warning-content"
      onClickOutside={warningHook.closePopup}>
      <div className="warning-top-panel">
        <SVGIcon className="icon" icon={SVGIcons.MESSAGE_ERROR} />
      </div>
      <div className="warnings">
        {warningHook.selectedSingleWarning && (
          <div className="warning">
            <SVGIcon
              className={`warning-icon ${warningHook.selectedSingleWarning.warning.level}`}
              icon={SVGIcons.GLOBAL_WARNING}
            />
            <div className="warning-message">
              {chrome.i18n.getMessage(
                warningHook.selectedSingleWarning.warning.message!,
              )}
            </div>
          </div>
        )}
      </div>
      {warningHook.selectedSingleWarning &&
        warningHook.selectedSingleWarning.warning.level ===
          EvmTransactionWarningLevel.HIGH && (
          <CheckboxPanelComponent
            onChange={(value) => warningHook.setBypassWarning(value)}
            checked={warningHook.bypassWarning}
            title="evm_transaction_warning_high_level_bypass_message"
            backgroundType={BackgroundType.FILLED}
          />
        )}

      {warningHook.selectedSingleWarning &&
        warningHook.selectedSingleWarning.warning.type ===
          EvmTransactionWarningType.WHITELIST_ADDRESS && (
          <InputComponent
            value={warningHook.whitelistLabel}
            type={InputType.TEXT}
            onChange={warningHook.setWhitelistLabel}
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
          onClick={() =>
            warningHook.handleSingleWarningIgnore(
              warningHook.selectedSingleWarning!,
            )
          }
          height="small"
          disabled={
            warningHook.selectedSingleWarning?.warning.level ===
              EvmTransactionWarningLevel.HIGH && !warningHook.bypassWarning
          }
        />
      </div>
    </PopupContainer>
  );
};

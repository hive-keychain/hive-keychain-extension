import { PendingHiveAccountCreationRequest } from '@interfaces/hive-account-creation.interface';
import QRCode from 'react-qr-code';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { copyTextWithToast } from 'src/common-ui/toast/copy-toast.utils';
import { PaidAccountCreationPaymentUtils } from 'src/popup/hive/utils/paid-account-creation-payment.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

interface ExternalWalletPaymentPopupProps {
  pendingRequest: PendingHiveAccountCreationRequest;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitTxHash: (txHash: string) => Promise<void>;
}

const renderCopyButton = (value: string, label: string) => (
  <button
    type="button"
    className="copy-field-button"
    aria-label={`Copy ${label}`}
    title={`Copy ${label}`}
    onClick={() => copyTextWithToast(value)}>
    <SVGIcon icon={SVGIcons.SELECT_COPY} />
  </button>
);

const renderField = ({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) => (
  <div className="payment-field">
    <div className="field-content">
      <div className="field-label">{label}</div>
      <div className="field-value">{value}</div>
    </div>
    {copyable ? renderCopyButton(value, label.toLowerCase()) : <div />}
  </div>
);

export const ExternalWalletPaymentPopup = ({
  pendingRequest,
  isSubmitting,
  onClose,
  onSubmitTxHash,
}: ExternalWalletPaymentPopupProps) => {
  const [txHash, setTxHash] = useState('');
  const [txHashError, setTxHashError] = useState<string | undefined>();

  const paymentAssetLabel =
    pendingRequest.paymentTokenSymbol ?? pendingRequest.paymentCurrency;

  const handleSubmit = async () => {
    const normalizedTxHash =
      PaidAccountCreationPaymentUtils.normalizePaymentTxHash(txHash);
    if (
      !PaidAccountCreationPaymentUtils.isValidPaymentTxHash(
        pendingRequest,
        normalizedTxHash,
      )
    ) {
      setTxHashError(
        I18nUtils.getMessage(
          'html_popup_create_account_invalid_payment_tx_hash',
        ),
      );
      return;
    }

    setTxHashError(undefined);
    await onSubmitTxHash(normalizedTxHash);
  };

  return (
    <PopupContainer
      data-testid="external-wallet-payment-popup"
      className="external-wallet-payment-popup-container"
      onClickOutside={onClose}>
      <div className="external-wallet-payment-popup">
        <div className="popup-title">
          {I18nUtils.getMessage('html_popup_create_account_pay_external_wallet')}
        </div>
        <div className="popup-instructions">
          {I18nUtils.getMessage(
            'html_popup_create_account_external_wallet_instructions',
          )}
        </div>

        <div className="payment-details">
          {renderField({
            label: I18nUtils.getMessage('popup_html_transfer_amount'),
            value: `${pendingRequest.amount} ${paymentAssetLabel}`,
            copyable: true,
          })}
          {renderField({
            label: I18nUtils.getMessage('popup_html_transfer_to'),
            value: pendingRequest.paymentAddress,
            copyable: true,
          })}
          {pendingRequest.memo &&
            renderField({
              label: I18nUtils.getMessage('popup_html_memo'),
              value: pendingRequest.memo,
              copyable: true,
            })}
        </div>

        <div className="qr-code-container">
          <QRCode
            data-testid="qrcode"
            className="qrcode"
            value={pendingRequest.paymentAddress}
            bgColor="var(--qrcode-background-color)"
            fgColor="var(--qrcode-foreground-color)"
          />
        </div>

        <InputComponent
          dataTestId="external-wallet-payment-tx-hash-input"
          label="html_popup_create_account_payment_tx_hash"
          type={InputType.TEXT}
          value={txHash}
          onChange={(value) => {
            setTxHash(value);
            if (txHashError) {
              setTxHashError(undefined);
            }
          }}
          onEnterPress={() => {
            if (!isSubmitting) {
              void handleSubmit();
            }
          }}
        />
        {txHashError && <div className="tx-hash-error">{txHashError}</div>}

        <div className="action-buttons">
          <ButtonComponent
            label="popup_html_button_label_cancel"
            type={ButtonType.ALTERNATIVE}
            height="small"
            disabled={isSubmitting}
            onClick={onClose}
          />
          <ButtonComponent
            label={
              isSubmitting
                ? 'html_popup_create_account_submitting_payment_tx'
                : 'html_popup_create_account_submit_payment_tx'
            }
            height="small"
            disabled={isSubmitting || txHash.trim().length === 0}
            onClick={() => void handleSubmit()}
          />
        </div>
      </div>
    </PopupContainer>
  );
};

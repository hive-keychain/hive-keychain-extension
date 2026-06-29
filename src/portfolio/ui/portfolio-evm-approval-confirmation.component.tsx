import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';
import AmountWithLogo from 'src/common-ui/amount-with-logo/amount-with-logo';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  ConfirmationPageEvmFields,
  ConfirmationPageFieldType,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { ConfirmationFieldWarningIcon } from 'src/common-ui/confirmation-warning-info/confirmation-field-warning-icon/confirmation-field-warning-icon.component';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import { EvmRiskAlertBanner } from 'src/common-ui/evm/evm-risk-warning/evm-risk-alert-banner.component';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { LabelComponent } from 'src/common-ui/label/label.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/interfaces/messages.interface';
import { PortfolioEvmInAppConfirmationContext } from 'src/portfolio/portfolio-in-app-confirmation.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

type Props = {
  context: PortfolioEvmInAppConfirmationContext;
  onDismiss: () => void;
  setErrorMessage: (key: string, params?: string[]) => void;
};

/**
 * Embedded confirmation shown when a portfolio EVM swap first needs an ERC-20
 * approval. Mirrors the LI.FI confirmation page: a dedicated Approve panel and
 * Swap panel, each with its own gas fee selector, then a single confirm that
 * sends the approval (and waits) before the swap.
 */
export const PortfolioEvmApprovalConfirmation = ({
  context,
  onDismiss,
  setErrorMessage,
}: Props) => {
  const { approveFields = [], fields, chain, account, message } = context;

  const transactionHook = useTransactionHook(
    {} as EvmRequestMessage,
    {} as EvmRequest,
  );

  const [approveSelectedFee, setApproveSelectedFee] =
    useState<GasFeeEstimationBase>();
  const [swapSelectedFee, setSwapSelectedFee] =
    useState<GasFeeEstimationBase>();

  useEffect(() => {
    transactionHook.setConfirmationPageFields([...approveFields, ...fields]);
  }, [approveFields, fields]);

  const handleErrors = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setErrorMessage(error.message, error.params ?? []);
    }
  };

  const handleClickOnConfirm = () => {
    if (transactionHook.hasWarning()) {
      transactionHook.openWarningsPopup();
      return;
    }
    if (!swapSelectedFee || !approveSelectedFee) {
      setErrorMessage('popup_html_evm_gas_fee_not_selected');
      return;
    }
    void context.onConfirm(swapSelectedFee, approveSelectedFee);
  };

  const handleClickOnCancel = () => {
    onDismiss();
  };

  const confirmationFields = [...approveFields, ...fields];
  const bannerWarnings =
    EvmRiskWarningUtils.collectWarningsFromConfirmationFields(
      confirmationFields,
    ).filter((warning) => !warning.ignored);
  const bannerWarningCount =
    EvmRiskWarningUtils.countFieldsWithActiveWarnings(confirmationFields);

  const renderFieldValue = (field: ConfirmationPageEvmFields) => {
    switch (field.tag) {
      case ConfirmationPageFieldType.USERNAME:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            <UsernameWithAvatar username={field.value as string} />
          </div>
        );
      case ConfirmationPageFieldType.AMOUNT:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            <AmountWithLogo
              amount={field.value as string}
              symbol={field.tokenSymbol}
              logoUrl={field.tokenLogoUrl}
            />
          </div>
        );
      default:
        return (
          <div className={`value ${field.valueClassName ?? ''}`}>
            {field.value}
          </div>
        );
    }
  };

  const renderFields = (
    sectionFields: ConfirmationPageEvmFields[],
    indexOffset: number,
  ) =>
    sectionFields.map((field, index) => (
      <React.Fragment key={field.label}>
        <div className="field">
          {field.label && (
            <div className="label">
              {I18nUtils.getMessage(field.label)}
              {field.warnings && field.warnings.length > 0 && (
                <ConfirmationFieldWarningIcon
                  warnings={field.warnings}
                  onClick={() =>
                    transactionHook.openWarningsPopup({
                      type: 'confirmation',
                      index: indexOffset + index,
                    })
                  }
                />
              )}
            </div>
          )}
          {renderFieldValue(field)}
        </div>
        {index !== sectionFields.length - 1 && (
          <Separator
            key={`separator-${field.label}`}
            type={'horizontal'}
            fullSize
          />
        )}
      </React.Fragment>
    ));

  return (
    <div className="confirmation-page confirmation-page--embedded portfolio-evm-approval-confirmation">
      <div className="confirmation-top">
        {message && (
          <div
            className="introduction"
            dangerouslySetInnerHTML={{
              __html: HtmlUtils.sanitizeHtml(message),
            }}></div>
        )}

        {bannerWarningCount > 0 && (
          <EvmRiskAlertBanner
            warnings={bannerWarnings}
            warningCount={bannerWarningCount}
            onReviewClick={() => transactionHook.openWarningsPopup()}
          />
        )}

        <div className="fields">
          <LabelComponent
            value={'evm_approval_operation'}
            className="portfolio-operation-name"
          />
          {renderFields(approveFields, 0)}
          <GasFeePanel
            chain={chain as EvmChain}
            fromAddress={account.wallet.address}
            selectedFee={approveSelectedFee}
            onSelectFee={setApproveSelectedFee}
            transactionType={
              context.approveTransactionData?.type ??
              (chain as EvmChain).defaultTransactionType
            }
            transactionData={context.approveTransactionData}
            setErrorMessage={handleErrors}
          />
        </div>

        <div className="fields">
          <LabelComponent
            value={'evm_swap_operation'}
            className="portfolio-operation-name"
          />
          {renderFields(fields, approveFields.length)}
          <GasFeePanel
            chain={chain as EvmChain}
            fromAddress={account.wallet.address}
            selectedFee={swapSelectedFee}
            onSelectFee={setSwapSelectedFee}
            transactionType={
              context.transactionData?.type ??
              (chain as EvmChain).defaultTransactionType
            }
            transactionData={context.transactionData}
            setErrorMessage={handleErrors}
          />
        </div>
      </div>

      <div className="evm-bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={handleClickOnCancel}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        <ButtonComponent
          dataTestId="dialog_confirm-button"
          label={'popup_html_confirm'}
          onClick={handleClickOnConfirm}
          type={ButtonType.IMPORTANT}></ButtonComponent>
      </div>
      <ConfirmationPopup transactionHook={transactionHook} />
    </div>
  );
};

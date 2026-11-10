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
import { EvmSwapConfirmationBalance } from 'src/common-ui/evm/evm-swap-confirmation-balance.component';
import { EvmSwapConfirmationBalanceUtils } from '@popup/evm/utils/evm-swap-confirmation-balance.utils';
import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

type Props = {
  context: PortfolioEvmInAppConfirmationContext;
  onDismiss: () => void;
  setErrorMessage: (key: string, params?: string[]) => void;
};

/**
 * Embedded confirmation shown when a portfolio EVM swap first needs an allowance.
 * One Approve panel per allowance (ERC-20, then Permit2 when both are required)
 * and a Swap panel, each with its own gas fee selector. A single confirm sends
 * the allowances in order, waiting for each, before the swap.
 */
export const PortfolioEvmApprovalConfirmation = ({
  context,
  onDismiss,
  setErrorMessage,
}: Props) => {
  const { allowanceSteps, fields, chain, account, message } = context;

  const transactionHook = useTransactionHook(
    {} as EvmRequestMessage,
    {} as EvmRequest,
  );

  const [allowanceFees, setAllowanceFees] = useState<
    Array<GasFeeEstimationBase | undefined>
  >(() => allowanceSteps.map(() => undefined));
  const [swapSelectedFee, setSwapSelectedFee] =
    useState<GasFeeEstimationBase>();
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);

  useEffect(() => {
    transactionHook.setConfirmationPageFields([
      ...allowanceSteps.flatMap((step) => step.fields),
      ...fields,
    ]);
  }, [allowanceSteps, fields]);

  const handleErrors = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setErrorMessage(error.message, error.params ?? []);
    }
  };

  const handleSelectAllowanceFee = (
    index: number,
    fee: GasFeeEstimationBase,
  ) => {
    setAllowanceFees((current) =>
      current.map((selected, selectedIndex) =>
        selectedIndex === index ? fee : selected,
      ),
    );
  };

  const handleClickOnConfirm = () => {
    if (transactionHook.hasWarning()) {
      transactionHook.openWarningsPopup();
      return;
    }
    const selectedAllowanceFees = allowanceFees.filter(
      (fee): fee is GasFeeEstimationBase => Boolean(fee),
    );
    if (
      !swapSelectedFee ||
      selectedAllowanceFees.length !== allowanceSteps.length
    ) {
      setErrorMessage('popup_html_evm_gas_fee_not_selected');
      return;
    }
    void context.onConfirm(swapSelectedFee, selectedAllowanceFees);
  };

  const handleClickOnCancel = () => {
    onDismiss();
  };

  const allowanceFields = allowanceSteps.flatMap((step) => step.fields);
  const confirmationFields = [...allowanceFields, ...fields];
  const allowanceFieldOffsetAt = (stepIndex: number) =>
    allowanceSteps
      .slice(0, stepIndex)
      .reduce((total, step) => total + step.fields.length, 0);
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
              network={field.tokenNetwork}
              networkLogoUrl={field.tokenNetworkLogoUrl}
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

        {allowanceSteps.map((step, index) => (
          <div className="fields" key={`portfolio-allowance-${index}`}>
            <LabelComponent
              value={'evm_approval_operation'}
              className="portfolio-operation-name"
            />
            {renderFields(step.fields, allowanceFieldOffsetAt(index))}
            <GasFeePanel
              chain={chain as EvmChain}
              fromAddress={account.wallet.address}
              selectedFee={allowanceFees[index]}
              onSelectFee={(fee) => handleSelectAllowanceFee(index, fee)}
              transactionType={
                step.transactionData.type ??
                (chain as EvmChain).defaultTransactionType
              }
              transactionData={step.transactionData}
              setErrorMessage={handleErrors}
            />
          </div>
        ))}

        <div className="fields">
          <LabelComponent
            value={'evm_swap_operation'}
            className="portfolio-operation-name"
          />
          {renderFields(fields, allowanceFields.length)}
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
        <EvmSwapConfirmationBalance
          walletAddress={account.wallet.address}
          chain={chain as EvmChain}
          fromTokenInfo={context.fromTokenInfo}
          swapAmount={context.swapAmount}
          swapGasFee={swapSelectedFee}
          approveGasFee={EvmSwapConfirmationBalanceUtils.sumGasFees(
            allowanceFees,
          )}
          onInsufficientBalanceChange={setHasInsufficientBalance}
        />
      </div>

      <div className="evm-bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={handleClickOnCancel}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        {!hasInsufficientBalance && (
          <ButtonComponent
            dataTestId="dialog_confirm-button"
            label={'popup_html_confirm'}
            onClick={handleClickOnConfirm}
            type={ButtonType.IMPORTANT}></ButtonComponent>
        )}
      </div>
      <ConfirmationPopup transactionHook={transactionHook} />
    </div>
  );
};

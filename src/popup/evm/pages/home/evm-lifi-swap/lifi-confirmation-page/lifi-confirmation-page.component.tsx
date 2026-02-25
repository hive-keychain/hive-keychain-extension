import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { ConfirmationPageEvmFields } from '@common-ui/confirmation-page/confirmation-page.interface';
import { ConfirmationWarnings } from '@common-ui/confirmation-warning-info/confirmation-warnings/confirmation-warnings.component';
import { LabelComponent } from '@common-ui/label/label.component';
import { Separator } from '@common-ui/separator/separator.component';
import { useTransactionHook } from '@dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

interface LiFiConfirmationPageNavigationParams {
  swapTransactionData: ProviderTransactionData;
  swapFields: ConfirmationPageEvmFields[];
  approveTransactionData?: ProviderTransactionData;
  approveFields: ConfirmationPageEvmFields[];
  message?: string;
  title?: string;
  skipTitleTranslation?: boolean;
  afterConfirmAction: (
    swapGasFee: GasFeeEstimationBase,
    swapTransactionData: ProviderTransactionData,
    approveGasFee?: GasFeeEstimationBase,
    approveTransactionData?: ProviderTransactionData,
  ) => void;
  afterCancelAction?: () => {};
}

const LiFiConfirmationPage = ({
  activeAccount,
  evmPrices,
  approveTransactionData,
  swapTransactionData,
  approveFields,
  swapFields,
  message,
  title,
  skipTitleTranslation,
  afterConfirmAction,
  afterCancelAction,
  goBack,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsFromRedux) => {
  const transactionHook = useTransactionHook(
    {} as EvmRequestMessage,
    {} as EvmRequest,
  );

  const [approveSelectedFee, setApproveSelectedFee] =
    useState<GasFeeEstimationBase>();
  const [swapSelectedFee, setSwapSelectedFee] =
    useState<GasFeeEstimationBase>();

  useEffect(() => {
    console.log({ approveTransactionData, swapTransactionData });
    setTitleContainerProperties({
      title: title ?? 'popup_html_confirm',
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        if (afterCancelAction) afterCancelAction();
      },
      onCloseAdditional: () => {
        if (afterCancelAction) afterCancelAction();
      },
    });
  }, []);

  const handleClickOnConfirm = () => {
    if (swapSelectedFee) {
      if (
        (approveTransactionData && approveSelectedFee) ||
        !approveTransactionData
      ) {
        afterConfirmAction(
          swapSelectedFee,
          swapTransactionData,
          approveSelectedFee,
          approveTransactionData,
        );
        return;
      }
    }
    // If here display error message beacause gas fee missing
  };

  const handleClickOnCancel = () => {
    if (afterCancelAction) afterCancelAction();
    goBack();
  };

  const handleOnWarningClicked = (
    field: ConfirmationPageEvmFields,
    warningIndex: number,
    fieldIndex: number,
  ) => {
    transactionHook.openSingleWarningPopup(
      fieldIndex,
      warningIndex,
      field.warnings![warningIndex],
    );
  };

  const handleErrors = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="confirmation-page lifi-confirmation-page">
      <div className="confirmation-top lifi-confirmation-page-content">
        {message && (
          <div
            className="introduction"
            dangerouslySetInnerHTML={{
              __html: message,
            }}></div>
        )}
        {approveTransactionData && (
          <>
            <div className="fields">
              <LabelComponent value={'evm_approval_operation'} />
              {approveFields.map((field, index) => (
                <React.Fragment key={field.label}>
                  <div className="field">
                    {field.label && (
                      <div className="label">
                        {chrome.i18n.getMessage(field.label)}
                      </div>
                    )}
                    <div className={`value ${field.valueClassName ?? ''}`}>
                      {field.value}
                    </div>
                  </div>
                  {field.warnings && field.warnings.length > 0 && (
                    <ConfirmationWarnings
                      warnings={field.warnings}
                      onWarningClicked={(warningIndex) =>
                        handleOnWarningClicked(field, warningIndex, index)
                      }
                    />
                  )}
                  {index !== approveFields.length - 1 && (
                    <Separator
                      key={`separator-${field.label}`}
                      type={'horizontal'}
                      fullSize
                    />
                  )}
                </React.Fragment>
              ))}
              <GasFeePanel
                chain={approveTransactionData.chain!}
                wallet={activeAccount.wallet}
                selectedFee={approveSelectedFee}
                onSelectFee={setApproveSelectedFee}
                transactionType={
                  (approveTransactionData.chain! as EvmChain)
                    .defaultTransactionType
                }
                transactionData={approveTransactionData}
                prices={evmPrices}
                setErrorMessage={handleErrors}
                expandable={true}
              />
            </div>
          </>
        )}
        <div className="fields">
          <LabelComponent value={'evm_swap_operation'} />
          {swapFields.map((field, index) => (
            <React.Fragment key={field.label}>
              <div className="field">
                {field.label && (
                  <div className="label">
                    {chrome.i18n.getMessage(field.label)}
                  </div>
                )}
                <div className={`value ${field.valueClassName ?? ''}`}>
                  {field.value}
                </div>
              </div>
              {field.warnings && field.warnings.length > 0 && (
                <ConfirmationWarnings
                  warnings={field.warnings}
                  onWarningClicked={(warningIndex) =>
                    handleOnWarningClicked(field, warningIndex, index)
                  }
                />
              )}
              {index !== swapFields.length - 1 && (
                <Separator
                  key={`separator-${field.label}`}
                  type={'horizontal'}
                  fullSize
                />
              )}
            </React.Fragment>
          ))}
          <GasFeePanel
            chain={swapTransactionData.chain!}
            wallet={activeAccount.wallet}
            selectedFee={swapSelectedFee}
            onSelectFee={setSwapSelectedFee}
            transactionType={
              (swapTransactionData.chain! as EvmChain).defaultTransactionType
            }
            transactionData={swapTransactionData}
            prices={evmPrices}
            setErrorMessage={handleErrors}
            expandable={true}
          />
        </div>
      </div>

      <div className="evm-bottom-panel lifi-confirmation-page-actions">
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
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const params = state.navigation.stack[0]
    .params as LiFiConfirmationPageNavigationParams;
  console.log(params, 'params');
  return {
    swapTransactionData: params.swapTransactionData,
    approveTransactionData: params.approveTransactionData,
    approveFields: params.approveFields,
    swapFields: params.swapFields,
    message: params.message,
    title: params.title,
    skipTitleTranslation: params.skipTitleTranslation,
    afterConfirmAction: params.afterConfirmAction,
    afterCancelAction: params.afterCancelAction,
    activeAccount: state.evm.activeAccount,
    evmPrices: state.evm.prices,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector> &
  LiFiConfirmationPageNavigationParams;

export const LiFiConfirmationPageComponent = connector(LiFiConfirmationPage);

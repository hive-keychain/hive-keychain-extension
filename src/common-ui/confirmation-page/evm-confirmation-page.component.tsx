import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import { BalanceChangeCardUtils } from '@dialog/components/balance-change-card/balance-change-card.utils';
import { EvmRequestMessage } from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { Screen } from '@interfaces/screen.interface';
import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import EventEmitter from 'events';
import React, { BaseSyntheticEvent, useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  ConfirmationPageEvmFields,
  ConfirmationPageFields,
  EVMConfirmationPageParams,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import { ConfirmationFieldWarningIcon } from 'src/common-ui/confirmation-warning-info/confirmation-field-warning-icon/confirmation-field-warning-icon.component';
import {
  EvmRiskAlertBanner,
  EvmRiskStaticAlert,
} from 'src/common-ui/evm/evm-risk-warning/evm-risk-alert-banner.component';
import { EvmRiskWarningUtils } from 'src/common-ui/evm/evm-risk-warning/evm-risk-warning.utils';
import { EvmTransactionWarning } from '@popup/evm/interfaces/evm-transactions.interface';
import { Separator } from 'src/common-ui/separator/separator.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
const ConfirmationPage = ({
  fields,
  message,
  afterConfirmAction,
  afterCancelAction,
  warningMessage,
  warningParams,
  skipWarningTranslation,
  title,
  skipTitleTranslation,
  hasGasFee,
  chain,
  tokenInfo,
  prefetchedMainTokenInfo,
  receiverAddress,
  amount,
  wallet,
  activeAccount,
  selectedAccount,
  transactionData,
  goBack,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsType) => {
  const [hasField] = useState(fields && fields.length !== 0);
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimationBase>();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();
  const transactionHook = useTransactionHook(
    {} as EvmRequestMessage,
    {} as EvmRequest,
  );

  const forceOpenGasFeePanelEvent = useMemo(() => new EventEmitter(), []);
  const mainTokenInfo = useMemo(
    () =>
      prefetchedMainTokenInfo ??
      (activeAccount?.nativeAndErc20Tokens?.value.find(
        ({ tokenInfo }) =>
          tokenInfo.type === EVMSmartContractType.NATIVE ||
          tokenInfo.symbol.toLowerCase() ===
            (chain as EvmChain)?.mainToken?.toLowerCase(),
      )?.tokenInfo as EvmSmartContractInfoNative | undefined),
    [
      activeAccount?.nativeAndErc20Tokens?.value,
      chain,
      prefetchedMainTokenInfo,
    ],
  );

  useEffect(() => {
    initConfirmationPage();
  }, []);

  useEffect(() => {
    transactionHook.setConfirmationPageFields(fields);
  }, [fields]);

  useEffect(() => {
    if (
      chain &&
      tokenInfo &&
      selectedAccount &&
      amount !== undefined &&
      (tokenInfo.type === EVMSmartContractType.ERC20 ||
        tokenInfo.type === EVMSmartContractType.NATIVE)
    ) {
      void initBalance(tokenInfo);
    }
  }, [amount, chain, selectedAccount, selectedFee, tokenInfo]);

  const initConfirmationPage = async () => {
    setTitleContainerProperties({
      title: title ?? 'popup_html_confirm',
      skipTitleTranslation,
      isBackButtonEnabled: true,
      onBackAdditional: () => {
        if (afterCancelAction) {
          afterCancelAction();
        }
      },
      onCloseAdditional: () => {
        if (afterCancelAction) {
          afterCancelAction();
        }
      },
    });
    transactionHook.initPendingTransactionWarning(
      wallet.address,
      chain as EvmChain,
    );
    transactionHook.setConfirmationPageFields(fields);
  };

  const hideConfirm = BalanceChangeCardUtils.hasInsufficientBalance(balanceInfo);

  const handleClickOnConfirm = () => {
    if (hasGasFee && GasFeeUtils.isGasFeeEstimateInvalid(selectedFee)) {
      forceOpenGasFeePanelEvent.emit('forceOpenCustomFeePanel');
      return;
    }

    if (transactionHook && transactionHook.hasWarning()) {
      transactionHook.openWarningsPopup();
      return;
    }
    if ((hasGasFee && !!selectedFee) || !hasGasFee)
      afterConfirmAction(selectedFee);
    else setErrorMessage('popup_html_evm_gas_fee_not_selected');
  };

  const handleClickOnCancel = async () => {
    if (afterCancelAction) {
      afterCancelAction();
    }
    goBack();
  };

  const initBalance = async (tokenInfo: EvmSmartContractInfo) => {
    setBalanceInfo(
      await EvmTokensUtils.getBalanceInfo(
        selectedAccount?.wallet.address!,
        chain as EvmChain,
        tokenInfo,
        amount!,
        selectedFee,
        tokenInfo.type === EVMSmartContractType.ERC20
          ? mainTokenInfo
          : undefined,
      ),
    );
  };

  const handleErrors = (error: EtherRPCCustomError | undefined) => {
    if (error) {
      setErrorMessage(error.message, error.params ?? []);
    }
  };

  const getBannerWarnings = (): EvmTransactionWarning[] => {
    const confirmationFields = [
      ...(fields ?? []),
      ...(transactionHook.pendingTransactionWarningField
        ? [transactionHook.pendingTransactionWarningField]
        : []),
    ];
    return EvmRiskWarningUtils.collectWarningsFromConfirmationFields(
      confirmationFields,
    ).filter((warning) => !warning.ignored);
  };

  const getBannerWarningCount = (): number => {
    const confirmationFields = [
      ...(fields ?? []),
      ...(transactionHook.pendingTransactionWarningField
        ? [transactionHook.pendingTransactionWarningField]
        : []),
    ];
    return EvmRiskWarningUtils.countFieldsWithActiveWarnings(
      confirmationFields,
    );
  };

  const bannerWarnings = getBannerWarnings();
  const bannerWarningCount = getBannerWarningCount();

  return (
    <div
      className="confirmation-page"
      data-testid={`${Screen.CONFIRMATION_PAGE}-page`}>
      <div className="confirmation-top">
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: HtmlUtils.sanitizeHtml(message),
          }}></div>

        {warningMessage && (
          <EvmRiskStaticAlert
            message={warningMessage}
            messageParams={warningParams}
            skipTranslation={skipWarningTranslation}
            dataTestId="warning-message"
          />
        )}

        {bannerWarningCount > 0 && (
          <EvmRiskAlertBanner
            warnings={bannerWarnings}
            warningCount={bannerWarningCount}
            onReviewClick={() => transactionHook.openWarningsPopup()}
          />
        )}

        {hasField && (
          <div className="fields">
            {fields.map((field, index) => (
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
                              index,
                            })
                          }
                        />
                      )}
                    </div>
                  )}
                  <div className={`value ${field.valueClassName ?? ''}`}>
                    {field.value}
                  </div>
                </div>
                {index !== fields.length - 1 && (
                  <Separator
                    key={`separator-${field.label}`}
                    type={'horizontal'}
                    fullSize
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {hasGasFee && (
          <GasFeePanel
            chain={chain as EvmChain}
            fromAddress={wallet.address}
            prefetchedMainTokenInfo={mainTokenInfo}
            selectedFee={selectedFee}
            onSelectFee={setSelectedFee}
            transactionType={
              transactionData?.type ??
              (chain as EvmChain).defaultTransactionType
            }
            transactionData={transactionData}
            forceOpenGasFeePanelEvent={forceOpenGasFeePanelEvent}
            setErrorMessage={handleErrors}
          />
        )}

        {balanceInfo && <BalanceChangeCard balanceInfo={balanceInfo} />}
      </div>
      <div className="evm-bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={handleClickOnCancel}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        {!hideConfirm && (
          <ButtonComponent
            dataTestId="dialog_confirm-button"
            label={'popup_html_confirm'}
            onClick={($event: BaseSyntheticEvent) => {
              handleClickOnConfirm();
            }}
            type={ButtonType.IMPORTANT}></ButtonComponent>
        )}
      </div>
      <ConfirmationPopup transactionHook={transactionHook} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  const params = state.navigation.stack[0].params;
  return {
    message: params.message as string,
    fields: params.fields as ConfirmationPageEvmFields[],
    warningMessage: params.warningMessage as string,
    warningParams: params.warningParams,
    skipWarningTranslation: params.skipWarningTranslation,
    afterConfirmAction: params.afterConfirmAction,
    afterCancelAction: params.afterCancelAction,
    title: params.title,
    skipTitleTranslation: params.skipTitleTranslation,
    activeAccount: (params.activeAccountOverride ??
      state.evm.activeAccount) as EvmActiveAccount,
    hasGasFee: params.hasGasFee,
    chain: params.chainOverride ?? state.chain,
    tokenInfo: params.tokenInfo as EvmSmartContractInfo,
    prefetchedMainTokenInfo: params.prefetchedMainTokenInfo,
    receiverAddress: params.receiverAddress,
    amount: params.amount,
    wallet: params.wallet,
    selectedAccount: (params.activeAccountOverride ??
      state.evm.activeAccount) as EvmActiveAccount,
    transactionData: params.transactionData as ProviderTransactionData,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector> & EVMConfirmationPageParams;

export const EVMConfirmationPageComponent = connector(ConfirmationPage);

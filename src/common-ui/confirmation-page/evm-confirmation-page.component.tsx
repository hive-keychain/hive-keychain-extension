import { EvmRequest } from '@interfaces/evm-provider.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import Decimal from 'decimal.js';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { Card } from 'src/common-ui/card/card.component';
import {
  ConfirmationPageEvmFields,
  ConfirmationPageFields,
  EVMConfirmationPageParams,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { ConfirmationPopup } from 'src/common-ui/confirmation-warning-info/confirmation-popups/confirmation-popups.component';
import { ConfirmationWarnings } from 'src/common-ui/confirmation-warning-info/confirmation-warnings/confirmation-warnings.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';
import FormatUtils from 'src/utils/format.utils';

interface BalanceInfo {
  before: string;
  estimatedAfter: string;
}

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
  receiverAddress,
  amount,
  wallet,
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

  useEffect(() => {
    initConfirmationPage();
  }, []);

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

    initBalance(tokenInfo);
    transactionHook.setConfirmationPageFields(fields);
  };

  const handleClickOnConfirm = () => {
    if (transactionHook && transactionHook.hasWarning()) {
      transactionHook.setWarningsPopupOpened(true);
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
    const balance = await EvmTokensUtils.getTokenBalance(
      selectedAccount?.wallet.address!,
      chain!,
      tokenInfo,
    );

    setBalanceInfo({
      before: `${balance?.formattedBalance!} ${tokenInfo.symbol}`,
      estimatedAfter: `${FormatUtils.withCommas(
        new Decimal(balance?.balanceInteger!).sub(amount!).toString(),
        (tokenInfo as EvmSmartContractInfoErc20).decimals || 8,
        true,
      )}  ${tokenInfo?.symbol}`,
    });
  };

  const handleOnWarningClicked = (
    field: ConfirmationPageFields,
    warningIndex: number,
    fieldIndex: number,
  ) => {
    transactionHook.openSingleWarningPopup(
      fieldIndex,
      warningIndex,
      field.warnings![warningIndex],
    );
  };

  return (
    <div
      className="confirmation-page"
      data-testid={`${Screen.CONFIRMATION_PAGE}-page`}>
      <div className="confirmation-top">
        <div
          className="introduction"
          dangerouslySetInnerHTML={{
            __html: message,
          }}></div>

        {warningMessage && (
          <div data-testid="warning-message" className="warning-message-panel">
            {skipWarningTranslation
              ? warningMessage
              : chrome.i18n.getMessage(warningMessage, warningParams)}
          </div>
        )}

        {hasField && (
          <div className="fields">
            {fields.map((field, index) => (
              <React.Fragment key={field.label}>
                <div className="field">
                  <div className="label">
                    {chrome.i18n.getMessage(field.label)}
                  </div>
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
        {balanceInfo && (
          <Card className="balance-change-panel">
            <div className="balance-change-title">
              {chrome.i18n.getMessage('evm_balance_change_title')}
            </div>

            <div className="balance-panel">
              <div className="balance-before">{balanceInfo?.before}</div>
              <SVGIcon icon={SVGIcons.GLOBAL_TRIANGLE_ARROW} className="icon" />
              <div className="balance-after">{balanceInfo?.estimatedAfter}</div>
            </div>
          </Card>
        )}
        {hasGasFee && (
          <GasFeePanel
            chain={chain}
            tokenInfo={tokenInfo}
            wallet={wallet}
            selectedFee={selectedFee}
            onSelectFee={setSelectedFee}
            transactionType={(chain as EvmChain).defaultTransactionType}
            transactionData={transactionData}
          />
        )}
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
          onClick={($event: BaseSyntheticEvent) => {
            $event.target.disabled = true;
            handleClickOnConfirm();
          }}
          type={ButtonType.IMPORTANT}></ButtonComponent>
      </div>
      <ConfirmationPopup transactionHook={transactionHook} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    message: state.navigation.stack[0].params.message as string,
    fields: state.navigation.stack[0].params
      .fields as ConfirmationPageEvmFields[],
    warningMessage: state.navigation.stack[0].params.warningMessage as string,
    warningParams: state.navigation.stack[0].params.warningParams,
    skipWarningTranslation:
      state.navigation.stack[0].params.skipWarningTranslation,
    afterConfirmAction: state.navigation.stack[0].params.afterConfirmAction,
    afterCancelAction: state.navigation.stack[0].params.afterCancelAction,
    title: state.navigation.stack[0].params.title,
    skipTitleTranslation: state.navigation.stack[0].params.skipTitleTranslation,
    activeAccount: state.evm.activeAccount,
    hasGasFee: state.navigation.stack[0].params.hasGasFee,
    chain: state.chain,
    tokenInfo: state.navigation.stack[0].params.tokenInfo,
    receiverAddress: state.navigation.stack[0].params.receiverAddress,
    amount: state.navigation.stack[0].params.amount,
    wallet: state.navigation.stack[0].params.wallet,
    selectedAccount: state.evm.activeAccount,
    transactionData: state.navigation.stack[0].params
      .transactionData as ProviderTransactionData,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector> & EVMConfirmationPageParams;

export const EVMConfirmationPageComponent = connector(ConfirmationPage);

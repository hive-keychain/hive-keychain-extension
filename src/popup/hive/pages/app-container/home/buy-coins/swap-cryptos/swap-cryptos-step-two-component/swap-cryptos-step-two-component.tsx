import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { SwapCryptos } from '@interfaces/swap-cryptos.interface';
import { ExchangeOperationForm } from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos/swap-cryptos.component';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { SwapCryptosMerger } from '@popup/hive/utils/swap-cryptos.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { Control } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { OptionItem } from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

interface Props {
  startToken: OptionItem;
  endToken: OptionItem;
  getFormParams: () => ExchangeOperationForm;
  minAmountProviderList: { provider: SwapCryptos; amount: number }[];
  providerSelected: SwapCryptos;
  adjustMinAcceptedMessage: string | undefined;
  swapCryptos: SwapCryptosMerger;
  setStep: (value: number) => void;
  setValue: (name: string, value: any) => void;
  handleSubmit: (callback: any) => void;
  control: Control<ExchangeOperationForm, any>;
}

const SwapCryptosStepTwo = ({
  control,
  handleSubmit,
  setValue,
  setStep,
  swapCryptos,
  adjustMinAcceptedMessage,
  startToken,
  endToken,
  setErrorMessage,
  navigateToWithParams,
  getFormParams,
  minAmountProviderList,
  providerSelected,
  addToLoadingList,
  activeAccount,
  removeFromLoadingList,
}: Props & PropsFromRedux) => {
  const handleClickOnSend = async (form: ExchangeOperationForm) => {
    if (minAmountProviderList) {
      const minAmountExpected = minAmountProviderList.find(
        (m) => m.provider === providerSelected,
      );
      if (
        minAmountExpected &&
        parseFloat(form.amountFrom) < minAmountExpected.amount
      ) {
        setErrorMessage('popup_html_need_adjust_min_exchange_amount');
        return;
      }
    }
    if (form.addressTo.trim().length === 0) {
      setErrorMessage('popup_html_need_receive_address');
      return;
    }

    let fields = [
      { label: 'popup_html_transfer_from', value: `@${form.currencyFrom}` },
      { label: 'popup_html_transfer_to', value: `@${form.currencyTo}` },
      { label: 'popup_html_transfer_amount', value: form.amountFrom },
      { label: 'popup_html_destination_address', value: form.addressTo },
    ];
    if (form.refundAddress)
      fields.push({
        label: 'popup_html_refund_address',
        value: form.refundAddress,
      });

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.posting,
      messge: chrome.i18n.getMessage(
        'popup_html_confirm_exchange_operation_text',
      ),
      fields: fields,
      title: 'popup_html_exchange_operation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          'html_popup_exchange_operation',
          KeysUtils.getKeyType(
            activeAccount.keys.posting!,
            activeAccount.keys.postingPubkey!,
          ),
          [form.currencyFrom, form.currencyTo, providerSelected as string],
        );
        try {
          const exchangeResult = await swapCryptos!.getNewExchange(
            form,
            providerSelected as SwapCryptos,
          );
          removeFromLoadingList('html_popup_exchange_operation');
          if (exchangeResult) {
            window.open(exchangeResult.link, '__blank');
          } else {
            setErrorMessage('buy_coins_swap_cryptos_error_api');
            setStep(1);
          }
        } catch (error) {
          Logger.log('Error executing exchange operation', {
            providerSelected,
            error,
          });
          setErrorMessage('buy_coins_swap_cryptos_error_api');
          setStep(1);
        }
      },
    });
  };

  return (
    <FormContainer onSubmit={() => handleSubmit(handleClickOnSend)}>
      <div className="form-fields">
        <div className="provider-icon-label">
          <SVGIcon
            icon={
              providerSelected === SwapCryptos.STEALTHEX
                ? SVGIcons.SWAP_CRYPTOS_STEALTHEX
                : SVGIcons.SWAP_CRYPTOS_SIMPLESWAP
            }
          />
          {adjustMinAcceptedMessage ? (
            <div className="adjust-exchange-amount">
              <InputComponent
                type={InputType.NUMBER}
                value={getFormParams().amountFrom}
                onChange={(newAmount) => setValue('amountFrom', newAmount)}
                placeholder={'popup_html_transfer_amount'}
                min={Number(
                  minAmountProviderList
                    ?.find((m) => m.provider === providerSelected)
                    ?.amount.toFixed(3),
                )}
              />
            </div>
          ) : (
            <div className="amount-to-exchange">
              {chrome.i18n.getMessage('popup_html_amount')}:{' '}
              {FormatUtils.formatCurrencyValue(getFormParams().amountFrom)}
            </div>
          )}
        </div>
        {adjustMinAcceptedMessage && (
          <div className="alert-message">{adjustMinAcceptedMessage}</div>
        )}
        <div className="exchange-tokens">
          <div className="token-label">
            <div className="label">
              {chrome.i18n.getMessage('popup_html_transfer_from')}:{' '}
              {getFormParams().currencyFrom}
            </div>
            <PreloadedImage
              className="left-image"
              src={startToken.img!}
              alt={`side-icon-${startToken.label}`}
            />
          </div>
          <div className="token-label">
            <div className="label">To: {getFormParams().currencyTo}</div>
            <PreloadedImage
              className="left-image"
              src={endToken.img!}
              alt={`side-icon-${endToken.label}`}
            />
          </div>
        </div>
        <FormInputComponent
          name="addressTo"
          control={control}
          dataTestId="exchange-operation-addressTo"
          type={InputType.TEXT}
          placeholder={'popup_html_exchange_receive_address'}
          label={'popup_html_exchange_receive_address'}
        />
        <FormInputComponent
          name="refundAddress"
          control={control}
          dataTestId="exchange-operation-refundAddress"
          type={InputType.TEXT}
          placeholder={'popup_html_exchange_refund_address'}
          label={'popup_html_exchange_refund_address'}
        />
      </div>
      <div className="buttons-container">
        <ButtonComponent
          onClick={() => setStep(1)}
          skipLabelTranslation
          label="Cancel"
          type={ButtonType.ALTERNATIVE}
          additionalClass="button"
        />
        <OperationButtonComponent
          dataTestId="send-texchange-operation"
          requiredKey={KeychainKeyTypesLC.posting}
          onClick={handleSubmit(handleClickOnSend)}
          label={'popup_html_send'}
          additionalClass="button"
        />
      </div>
    </FormContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  setErrorMessage,
  navigateToWithParams,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosStepTwoComponent = connector(SwapCryptosStepTwo);

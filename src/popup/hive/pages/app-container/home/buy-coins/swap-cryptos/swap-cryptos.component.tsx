import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  SwapCryptos as ProviderName,
  SwapCryptosEstimationDisplay,
} from '@interfaces/swap-cryptos.interface';
import { HIVE_OPTION_ITEM } from '@popup/hive/pages/app-container/home/buy-coins/buy-ramps/ramps.component';
import { BuySwapCoinsEstimationComponent } from '@popup/hive/pages/app-container/home/buy-coins/buy-swap-coins-estimation-component/buy-swap-coins-estimation.component';
import {
  SimpleSwapProvider,
  StealthexProvider,
  SwapCryptosMerger,
} from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

/**Note: Partner fee in percents (e.g. 1, 2, 5.3, 20) Max: 20 */
interface ExchangeOperationForm {
  amountFrom: string;
  refundAddress: string;
  addressTo: string;
  currencyFrom: string;
  currencyTo: string;
  partnerFee: number;
}

//TODO fill bellow if needed.
//  - remember there are some validation rules comming from each API
const exchangeOperationFormRules = FormUtils.createRules<ExchangeOperationForm>(
  {},
);

const SwapCryptos = ({ price, setErrorMessage }: PropsFromRedux) => {
  const { control, handleSubmit, watch, setValue } =
    useForm<ExchangeOperationForm>({
      defaultValues: {
        amountFrom: '',
        refundAddress: '',
        addressTo: '',
        currencyFrom: '',
        currencyTo: '',
        partnerFee: 20,
      },
    });
  const getFormParams = () => {
    return watch();
  };
  const [step, setStep] = useState(1);
  const [providerSelected, setProviderSelected] = useState<ProviderName>();
  const [errorInApi, setErrorInApi] = useState<string>();
  const [swapCryptos, setSetswapCryptos] = useState<SwapCryptosMerger>();
  const [loading, setLoading] = useState(true);
  const [loadingMinMaxAccepted, setLoadingMinMaxAccepted] = useState(false);
  const [
    pairedCurrencyOptionsInitialList,
    setPairedCurrencyOptionsInitialList,
  ] = useState<OptionItem[]>([]);
  const [amount, setAmount] = useState('');
  const [startToken, setStartToken] = useState<OptionItem>(HIVE_OPTION_ITEM);
  const [exchangeRangeAmount, setExchangeRangeAmount] = useState({
    min: 0,
    max: 0,
  });
  const [endToken, setEndToken] = useState<OptionItem>(HIVE_OPTION_ITEM);
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    OptionItem[]
  >([HIVE_OPTION_ITEM]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<OptionItem[]>([
    HIVE_OPTION_ITEM,
  ]);
  const [estimations, setEstimations] = useState<
    SwapCryptosEstimationDisplay[]
  >([]);
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const { countdown, refreshCountdown, nullifyCountdown } = useCountdown(
    Config.swapCryptos.autoRefreshPeriodSec,
    () => {
      if (
        parseFloat(amount) > 0 &&
        Number(amount) >= exchangeRangeAmount.min &&
        !loadingMinMaxAccepted &&
        startToken &&
        endToken &&
        swapCryptos
      ) {
        setLoadingEstimation(true);
        getExchangeEstimate(
          amount,
          startToken,
          endToken,
          loadingMinMaxAccepted,
          exchangeRangeAmount,
          swapCryptos,
        );
      }
    },
  );
  useEffect(() => {
    init();
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (
        newAmount,
        newStartToken,
        newEndToken,
        newLoadingMinMaxAccepted,
        newExchangeRangeAmount,
        newSwapCryptos,
      ) => {
        getExchangeEstimate(
          newAmount,
          newStartToken,
          newEndToken,
          newLoadingMinMaxAccepted,
          newExchangeRangeAmount,
          newSwapCryptos,
        );
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  useEffect(() => {
    throttledRefresh(
      amount,
      startToken,
      endToken,
      loadingMinMaxAccepted,
      exchangeRangeAmount,
      swapCryptos,
    );
  }, [
    amount,
    startToken,
    endToken,
    loadingMinMaxAccepted,
    exchangeRangeAmount,
  ]);

  useEffect(() => {
    if (startToken && endToken && !errorInApi) {
      setLoadingMinMaxAccepted(true);
      getMinAndMax(startToken, endToken);
    }
  }, [startToken, endToken, errorInApi]);

  const init = async () => {
    const newSwapCryptos = new SwapCryptosMerger([
      new StealthexProvider(true),
      new SimpleSwapProvider(true),
    ]);
    setSetswapCryptos(newSwapCryptos);
    newSwapCryptos
      .getCurrencyOptions('HIVE')
      .then((currencyOptions) => {
        if (currencyOptions.length === 0) {
          setErrorInApi('buy_coins_swap_cryptos_error_api');
          return;
        }
        setErrorInApi(undefined);
        setPairedCurrencyOptionsInitialList(
          currencyOptions.map((i) => {
            return { ...i, label: i.label.toUpperCase() };
          }),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (pairedCurrencyOptionsInitialList.length && !errorInApi) {
      initializeFromStorage(pairedCurrencyOptionsInitialList);
    }
  }, [pairedCurrencyOptionsInitialList, errorInApi]);

  const initializeFromStorage = async (
    pairedCurrencyOptionsList: OptionItem[],
  ) => {
    const lastCryptoEstimation =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
      );
    let tempStartTokenOptionItem = HIVE_OPTION_ITEM;
    let tempStartTokenOptionItemList = [HIVE_OPTION_ITEM];
    let tempEndtTokenOptionItem = pairedCurrencyOptionsList[0];
    let tempEndTokenOptionItemList = pairedCurrencyOptionsList;
    if (lastCryptoEstimation) {
      tempStartTokenOptionItem =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.from,
            )!;
      tempStartTokenOptionItemList =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
      tempEndtTokenOptionItem =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.to,
            )!;
      tempEndTokenOptionItemList =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
    }
    setStartToken(tempStartTokenOptionItem);
    setStartTokenListOptions(tempStartTokenOptionItemList);
    setEndToken(tempEndtTokenOptionItem);
    setEndTokenListOptions(tempEndTokenOptionItemList);
  };

  const getMinAndMax = async (
    startTokenOption: OptionItem,
    endTokenOption: OptionItem,
  ) => {
    try {
      await swapCryptos
        ?.getMinMaxAccepted(startTokenOption, endTokenOption)
        .then((res) => {
          if (res) {
            if (res.length === 1) {
              setExchangeRangeAmount({ min: res[0].amount, max: 0 });
            } else if (res.length > 1) {
              const minValue = res.sort((a, b) => a.amount - b.amount)[0]
                .amount;
              setExchangeRangeAmount({
                min: minValue,
                max: 0,
              });
            }
          }
        });
      setLoadingMinMaxAccepted(false);
    } catch (error) {
      Logger.log({ error });
    }
  };

  const getExchangeEstimate = async (
    newAmount: string,
    newStartToken: OptionItem,
    newEndToken: OptionItem,
    newLoadingMinMaxAccepted: boolean,
    newExchangeRangeAmount: { min: number; max: number },
    newSwapCryptos: SwapCryptosMerger,
  ) => {
    if (
      parseFloat(newAmount) > 0 &&
      parseFloat(newAmount) >= newExchangeRangeAmount.min &&
      !newLoadingMinMaxAccepted &&
      newStartToken &&
      newEndToken &&
      newSwapCryptos
    ) {
      try {
        setLoadingEstimation(true);
        newSwapCryptos
          .getExchangeEstimation(
            newAmount,
            newStartToken.subLabel!,
            newEndToken.subLabel!,
          )
          .then((res) => {
            if (!res) {
              setErrorInApi('buy_coins_swap_cryptos_error_api');
              return;
            }
            setErrorInApi(undefined);
            setEstimations(
              res.map(({ estimation }) => {
                return { ...estimation };
              }),
            );
            LocalStorageUtils.saveValueInLocalStorage(
              LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
              {
                from: newStartToken.subLabel!,
                to: newEndToken.subLabel!,
              },
            );
          });
        setLoadingEstimation(false);
        refreshCountdown();
      } catch (error) {
        Logger.log({ error });
      }
    } else if (parseFloat(newAmount) === 0 || !newAmount.trim().length) {
      setEstimations([]);
      nullifyCountdown();
    }
  };

  const swapStartAndEnd = () => {
    const tempStarTokentListOptions = [...startTokenListOptions];
    const tempEndTokenListOptions = [...endTokenListOptions];
    const tempStartToken = { ...startToken! };
    const tempEndToken = { ...endToken! };
    setEndToken(tempStartToken);
    setStartToken(tempEndToken);
    setStartTokenListOptions(tempEndTokenListOptions);
    setEndTokenListOptions(tempStarTokentListOptions);
    setEstimations([]);
    setAmount('');
  };

  const handleClickOnSend = async (form: ExchangeOperationForm) => {
    console.log({ form }); //TODO remove line
    if (form.addressTo.trim().length === 0) {
      setErrorMessage('popup_html_need_destination_address');
      return;
    }
    // let fields = [
    //   { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
    //   { label: 'popup_html_transfer_to', value: `@${form.receiverUsername}` },
    //   { label: 'popup_html_transfer_amount', value: stringifiedAmount },
    //   { label: 'popup_html_transfer_memo', value: memoField },
    // ];
  };

  const setFormParams = () => {
    setValue('currencyFrom', startToken.subLabel!);
    setValue('currencyTo', endToken.subLabel!);
    setValue('amountFrom', amount);
    setStep(2);
  };
  //TODo bellow add missing tr if needed
  return (
    <div className="swap-cryptos">
      {loading && (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
      {!loading &&
        startTokenListOptions.length !== 0 &&
        startToken &&
        endTokenListOptions.length !== 0 &&
        step === 1 &&
        endToken && (
          <BuySwapCoinsEstimationComponent
            startToken={startToken}
            startTokenList={startTokenListOptions}
            setStartToken={setStartToken}
            startTokenLabel="token"
            endToken={endToken}
            endTokenList={endTokenListOptions}
            setEndToken={setEndToken}
            endTokenLabel="token"
            amount={amount}
            setAmount={setAmount}
            inputAmountLabel={'popup_html_transfer_amount'}
            inputPlaceHolder={'popup_html_transfer_amount'}
            estimations={estimations}
            countdown={countdown}
            minAmountLabel={'html_popup_swap_crypto_min_accepted_label'}
            minAcceptedAmount={exchangeRangeAmount.min}
            swapTokens={swapStartAndEnd}
            displayReceiveTokenLogo
            errorMessage={errorInApi}
            setStep={setFormParams}
            setProviderSelected={(provider) => setProviderSelected(provider)}
          />
        )}
      {!loading && step === 2 && (
        <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
          <div className="form-fields">
            <div className="provider-icon-label">
              <SVGIcon
                icon={
                  providerSelected === ProviderName.STEALTHEX
                    ? SVGIcons.SWAP_CRYPTOS_STEALTHEX
                    : SVGIcons.SWAP_CRYPTOS_SIMPLESWAP
                }
              />
              <div className="amount-to-exchange">
                Amount:{' '}
                {FormatUtils.formatCurrencyValue(getFormParams().amountFrom)}
              </div>
            </div>
            <div className="exchange-tokens">
              <div className="token-label">
                <div className="label">
                  From: {getFormParams().currencyFrom}
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
              //TODO add tr keys
              skipLabelTranslation
              skipPlaceholderTranslation
              placeholder={'address To'}
              label={'Receive address'}
            />
            <FormInputComponent
              name="refundAddress"
              control={control}
              dataTestId="exchange-operation-refundAddress"
              type={InputType.TEXT}
              //TODO add tr keys
              skipLabelTranslation
              skipPlaceholderTranslation
              placeholder={'Refund Address (Optional)'}
              label={'Refund address(Optional)'}
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
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    price: state.hive.currencyPrices,
  };
};

const connector = connect(mapStateToProps, { setErrorMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosComponent = connector(SwapCryptos);

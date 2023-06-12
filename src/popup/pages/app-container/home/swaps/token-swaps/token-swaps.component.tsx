import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { SwapConfig, SwapStep } from '@interfaces/swap-token.interface';
import { Token } from '@interfaces/tokens.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  goBackToThenNavigate,
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import CustomSelect, {
  SelectOption,
} from 'src/common-ui/select/custom-select.component';
import ServiceUnavailablePage from 'src/common-ui/service-unavailable-page/service-unavailable-page.component';
import Config from 'src/config';
import { BaseCurrencies } from 'src/utils/currency.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import Logger from 'src/utils/logger.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-swaps.component.scss';

const TokenSwaps = ({
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  goBackToThenNavigate,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [swapConfig, setSwapConfig] = useState<SwapConfig>({} as SwapConfig);
  const [underMaintenance, setUnderMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [slippage, setSlippage] = useState(5);
  const [amount, setAmount] = useState<string>('');

  const [startToken, setStartToken] = useState<SelectOption>();
  const [endToken, setEndToken] = useState<SelectOption>();
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    SelectOption[]
  >([]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<
    SelectOption[]
  >([]);
  const [estimate, setEstimate] = useState<SwapStep[]>();
  const [estimateValue, setEstimateValue] = useState<string | undefined>();

  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);

  const [isAdvancedParametersOpen, setIsAdvancedParametersOpen] =
    useState(false);

  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  const throttledRefresh = useMemo(
    () =>
      throttle(
        (newAmount, newEndToken, newStartToken) => {
          if (parseFloat(newAmount) > 0 && newEndToken && newStartToken) {
            calculateEstimate(newAmount, newStartToken, newEndToken);
            setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
          }
        },
        1000,
        { leading: false } as ThrottleSettings,
      ),
    [],
  );

  useEffect(() => {
    throttledRefresh(amount, endToken, startToken);
  }, [amount, endToken, startToken]);

  useEffect(() => {
    init();
    setTitleContainerProperties({
      title: 'popup_html_token_swaps',
      isBackButtonEnabled: true,
    });
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      const serverStatus = await SwapTokenUtils.getServerStatus();
      setUnderMaintenance(serverStatus.isMaintenanceOn);

      const res = await SwapTokenUtils.getConfig();
      console.log(res);
      setSwapConfig(res);
      setSlippage(res.slippage.default);

      if (!serverStatus.isMaintenanceOn) {
        await initTokenSelectOptions();
      }
    } catch (err: any) {
      Logger.error(err);
      setErrorMessage(err.reason.template, err.reason.params);
      setServiceUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (autoRefreshCountdown === 0 && startToken && endToken) {
      calculateEstimate(amount, startToken, endToken);
      setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
      return;
    }

    const intervalId = setInterval(() => {
      setAutoRefreshCountdown(autoRefreshCountdown! - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefreshCountdown]);

  const initTokenSelectOptions = async () => {
    const startList = await SwapTokenUtils.getSwapTokenStartList(
      activeAccount.account,
    );
    const allTokens = await TokensUtils.getAllTokens();
    let list = startList.map((token) => {
      const tokenInfo = allTokens.find((t) => t.symbol === token.symbol);
      let img = '';
      let imgBackup = '';
      if (tokenInfo) {
        img =
          tokenInfo.metadata.icon && tokenInfo.metadata.icon.length > 0
            ? tokenInfo.metadata.icon
            : '/assets/images/hive-engine.svg';
        imgBackup = '/assets/images/hive-engine.svg';
      } else {
        img =
          token.symbol === BaseCurrencies.HIVE
            ? `/assets/images/${Icons.HIVE}`
            : `/assets/images/${Icons.HBD}`;
      }
      return {
        value: token,
        label: token.symbol,
        img: img,
        imgBackup,
      };
    });
    let endList: SelectOption[] = [
      {
        value: { symbol: BaseCurrencies.HIVE.toUpperCase(), precision: 3 },
        label: BaseCurrencies.HIVE.toUpperCase(),
        img: `/assets/images/${Icons.HIVE}`,
      },
      {
        value: { symbol: BaseCurrencies.HBD.toUpperCase(), precision: 3 },
        label: BaseCurrencies.HBD.toUpperCase(),
        img: `/assets/images/${Icons.HBD}`,
      },
      ...allTokens.map((token: Token) => {
        let img = '';
        img = token.metadata.icon ?? '/assets/images/hive-engine.svg';
        return {
          value: token,
          label: token.symbol,
          img: img,
          imgBackup: '/assets/images/hive-engine.svg',
        };
      }),
    ];

    const lastUsed = await SwapTokenUtils.getLastUsed();
    setStartToken(
      lastUsed.from
        ? list.find((t) => t.value.symbol === lastUsed.from.symbol)
        : list[0],
    );
    setStartTokenListOptions(list);
    setEndToken(
      lastUsed.to
        ? list.find((t) => t.value.symbol === lastUsed.to.symbol)
        : undefined,
    );
    setEndTokenListOptions(endList);
  };

  const calculateEstimate = async (
    amount: string,
    startToken: SelectOption,
    endToken: SelectOption,
  ) => {
    if (startToken === endToken) {
      setErrorMessage('swap_start_end_token_should_be_different');
      return;
    }

    try {
      setLoadingEstimate(true);
      setEstimate(undefined);
      setEstimateValue(undefined);
      const result: SwapStep[] = await SwapTokenUtils.getEstimate(
        startToken?.value.symbol,
        endToken?.value.symbol,
        amount,
      );

      if (result.length) {
        const precision = await TokensUtils.getTokenPrecision(
          result[result.length - 1].endToken,
        );
        console.log(swapConfig); //TODO find out why this is undefined
        const value = Number(result[result.length - 1].estimate);
        const fee =
          (Number(result[result.length - 1].estimate) * swapConfig.fee.amount) /
          100;
        const finalValue = Number(value - fee).toFixed(precision);
        setEstimate(result);
        setEstimateValue(finalValue);
      } else {
        setEstimateValue(undefined);
      }
    } catch (err: any) {
      console.log(err);
      setEstimate(undefined);
      setErrorMessage(err.reason.template, err.reason.params);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const processSwap = async () => {
    if (!estimate) {
      setErrorMessage('swap_no_estimate_error');
      return;
    }
    if (slippage < swapConfig.slippage.min) {
      setErrorMessage('swap_min_slippage_error', [
        swapConfig.slippage.min.toString(),
      ]);
      return;
    }
    if (startToken?.value.symbol === endToken?.value.symbol) {
      setErrorMessage('swap_start_end_token_should_be_different');
      return;
    }
    if (!amount || amount.length === 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(startToken?.value.balance)) {
      setErrorMessage('hive_engine_overdraw_balance_error', [
        startToken?.label!,
      ]);
      return;
    }
    let estimateId: string;
    try {
      estimateId = await SwapTokenUtils.saveEstimate(
        estimate!,
        slippage,
        startToken?.value.symbol,
        endToken?.value.symbol,
        parseFloat(amount),
        activeAccount.name!,
      );
    } catch (err: any) {
      setErrorMessage(err.reason.template, err.reason.params);
      return;
    }

    const expectedAmount = estimate![estimate!.length - 1].estimate;

    const startTokenPrecision = await TokensUtils.getTokenPrecision(
      startToken?.value.symbol,
    );
    const endTokenPrecision = await TokensUtils.getTokenPrecision(
      endToken?.value.symbol,
    );

    const fields = [
      { label: 'html_popup_swap_swap_id', value: estimateId },
      {
        label: 'html_popup_swap_swap_amount',
        value: `${Number(amount).toFixed(startTokenPrecision)} ${
          startToken?.value.symbol
        } => ${expectedAmount.toFixed(endTokenPrecision)} ${
          endToken?.value.symbol
        }`,
      },
      {
        label: 'html_popup_swap_swap_slipperage',
        value: `${slippage}% (for each step)`,
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('html_popup_swap_token_confirm_message'),
      fields: fields,
      title: 'html_popup_swap_token_confirm_title',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          'html_popup_swap_sending_token_to_swap_account',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
          [startToken?.value.symbol, Config.swaps.swapAccount],
        );
        try {
          let success;

          success = await SwapTokenUtils.processSwap(
            estimateId,
            startToken?.value.symbol,
            parseFloat(amount),
            activeAccount,
          );

          removeFromLoadingList(
            'html_popup_swap_sending_token_to_swap_account',
          );

          if (success) {
            goBackToThenNavigate(Screen.TOKENS_SWAP_HISTORY);
            setSuccessMessage('html_popup_swap_sending_token_successful');
            SwapTokenUtils.saveLastUsed(startToken?.value, endToken?.value);
          } else {
            setErrorMessage('html_popup_swap_error_sending_token', [
              Config.swaps.swapAccount,
            ]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_delegate_rc_operation');
        }
      },
      afterCancelAction: async () => {
        await SwapTokenUtils.cancelSwap(estimateId);
      },
    });
  };

  const getFormParams = () => {
    return {
      startToken: startToken,
      endToken: endToken,
      amount: amount,
      slipperage: slippage,
    };
  };

  const swapStartAndEnd = () => {
    const tmp = startToken;
    setStartToken(endToken);
    setEndToken(tmp);
  };

  return (
    <div className="token-swaps" aria-label="token-swaps">
      {!loading && !underMaintenance && !serviceUnavailable && (
        <>
          <div className="caption">
            {chrome.i18n.getMessage('swap_caption')}
          </div>
          <div className="fee">
            {chrome.i18n.getMessage('swap_fee')}: {swapConfig.fee.amount}%
          </div>
          <div className="top-row">
            <div className="countdown">
              {!!autoRefreshCountdown && (
                <>
                  {<span>Auto refresh in {autoRefreshCountdown} sec</span>}
                  <Icon
                    name={Icons.REFRESH}
                    onClick={() =>
                      calculateEstimate(amount, startToken!, endToken!)
                    }
                    rotate={loadingEstimate}
                  />
                </>
              )}
            </div>

            <Icon
              name={Icons.HISTORY}
              type={IconType.OUTLINED}
              onClick={() => navigateTo(Screen.TOKENS_SWAP_HISTORY)}
            />
          </div>

          <div className="form">
            <div className="start-token">
              <div className="inputs">
                {startTokenListOptions.length > 0 && (
                  <CustomSelect
                    selectedValue={startToken}
                    options={startTokenListOptions}
                    skipLabelTranslation
                    setSelectedValue={setStartToken}
                  />
                )}
                <InputComponent
                  type={InputType.NUMBER}
                  value={amount}
                  onChange={setAmount}
                  label="popup_html_transfer_amount"
                  placeholder="popup_html_transfer_amount"
                  min={0}
                  onSetToMaxClicked={() => setAmount(startToken?.value.balance)}
                />
              </div>
              <span className="available">
                {chrome.i18n.getMessage('popup_html_available')} :{' '}
                {startToken?.value.balance}
              </span>
            </div>
            <Icon
              type={IconType.OUTLINED}
              name={Icons.SWAP}
              onClick={swapStartAndEnd}
              additionalClassName="swap-icon"
            />
            <div className="end-token">
              {endTokenListOptions.length > 0 && (
                <div>
                  <CustomSelect
                    selectedValue={endToken}
                    options={endTokenListOptions}
                    skipLabelTranslation
                    setSelectedValue={setEndToken}
                    filterable
                  />
                  {estimate && estimate.length > 0 && (
                    <div className="final-value">
                      {chrome.i18n.getMessage('html_popup_swaps_final_price', [
                        estimateValue!,
                        endToken?.label!,
                      ])}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="advanced-parameters">
              <div
                className="title-panel"
                onClick={() =>
                  setIsAdvancedParametersOpen(!isAdvancedParametersOpen)
                }>
                <div className="title">
                  {chrome.i18n.getMessage('swap_advanced_parameters')}
                </div>
                <Icon
                  name={Icons.ARROW_DROPDOWN}
                  onClick={() =>
                    setIsAdvancedParametersOpen(!isAdvancedParametersOpen)
                  }
                />
              </div>
              {isAdvancedParametersOpen && (
                <div className="advanced-parameters-container">
                  <InputComponent
                    type={InputType.NUMBER}
                    min={5}
                    step={1}
                    value={slippage}
                    onChange={setSlippage}
                    label="html_popup_swaps_slipperage"
                    placeholder="html_popup_swaps_slipperage"
                    tooltip="html_popup_swaps_slippage_definition"
                  />
                </div>
              )}
            </div>
          </div>

          <OperationButtonComponent
            ariaLabel="operation-process-button"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={processSwap}
            label={'html_popup_swaps_process_swap'}
          />
        </>
      )}
      {loading && <RotatingLogoComponent />}
      {underMaintenance && (
        <div className="maintenance-mode">
          <Icon name={Icons.MAINTENANCE} />
          <div className="text">
            {chrome.i18n.getMessage('swap_under_maintenance')}
          </div>
        </div>
      )}
      {serviceUnavailable && <ServiceUnavailablePage />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  goBackToThenNavigate,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);

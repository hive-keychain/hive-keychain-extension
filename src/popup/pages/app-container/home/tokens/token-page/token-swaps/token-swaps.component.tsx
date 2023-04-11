import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { SwapStep } from '@interfaces/swap-token.interface';
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
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
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
import Config from 'src/config';
import { BaseCurrencies } from 'src/utils/currency.utils';
import { KeysUtils } from 'src/utils/keys.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-swaps.component.scss';

const TokenSwaps = ({
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
}: PropsFromRedux) => {
  const [loading, setLoading] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [slipperage, setSlipperage] = useState(5);
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

  useEffect(() => {
    initTokenSelectOptions();
  }, []);

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (autoRefreshCountdown === 0) {
      calculateEstimate();
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

  useEffect(() => {
    if (parseFloat(amount) > 0) {
      calculateEstimate();
      setAutoRefreshCountdown(Config.swaps.autoRefreshEveryXSec);
    }
  }, [amount]);

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
    setStartToken(list[0]);
    setStartTokenListOptions(list);
    setEndToken(endList[0]);
    setEndTokenListOptions(endList);
    setLoading(false);
  };

  const calculateEstimate = async () => {
    setLoadingEstimate(true);
    const result: SwapStep[] = await SwapTokenUtils.getEstimate(
      startToken?.value.symbol,
      endToken?.value.symbol,
      amount,
    );
    setEstimate(result);
    if (result.length) {
      const precision = await TokensUtils.getTokenPrecision(
        result[result.length - 1].endToken,
      );
      const value = Number(result[result.length - 1].estimate).toFixed(
        precision,
      );
      setEstimateValue(value);
    } else {
      setEstimateValue(undefined);
    }
    setLoadingEstimate(false);
  };

  const processSwap = async () => {
    if (!amount || amount.length === 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(startToken?.value.balance)) {
      setErrorMessage('hive_engine_overdraw_balance_error', [
        startToken?.label!,
      ]);
    }

    console.log(
      `start processing swap from ${startToken?.label} to ${endToken?.label}`,
    );

    const estimateId = await SwapTokenUtils.saveEstimate(
      estimate!,
      slipperage,
      startToken?.value.symbol,
      endToken?.value.symbol,
      parseFloat(amount),
      activeAccount.name!,
    );

    console.log(`estimate Id => ${estimateId}`);

    const expectedAmount = estimate![estimate!.length - 1].estimate;

    const fields = [
      { label: 'html_popup_swap_swap_id', value: estimateId },
      { label: 'html_popup_swap_swap_from', value: startToken?.value.symbol },
      { label: 'html_popup_swap_swap_to', value: endToken?.value.symbol },
      {
        label: 'html_popup_swap_swap_amount',
        value: `${amount} ${startToken?.value.symbol}`,
      },
      {
        label: 'html_popup_swap_swap_expected_amount',
        value: `${expectedAmount} ${endToken?.value.symbol}`,
      },
      {
        label: 'html_popup_swap_swap_slipperage',
        value: `${slipperage}% (for each step)`,
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
            navigateTo(Screen.HOME_PAGE, true);

            {
              setSuccessMessage('html_popup_swap_sending_token_successful');
            }
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
    });
  };

  const getFormParams = () => {
    return {
      startToken: startToken,
      endToken: endToken,
      amount: amount,
      slipperage: slipperage,
    };
  };

  const swapStartAndEnd = () => {
    const tmp = startToken;
    setStartToken(endToken);
    setEndToken(tmp);
  };

  return (
    <div className="token-swaps" aria-label="token-swaps">
      {!loading && (
        <>
          <div className="top-row">
            <div className="countdown">
              {!!autoRefreshCountdown && (
                <>
                  {<span>Auto refresh in {autoRefreshCountdown} sec</span>}
                  <Icon
                    name={Icons.REFRESH}
                    onClick={calculateEstimate}
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
              <>
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
              </>
            )}
          </div>
          <InputComponent
            type={InputType.NUMBER}
            min={5}
            step={1}
            value={slipperage}
            onChange={setSlipperage}
            label="html_popup_swaps_slipperage"
            placeholder="html_popup_swaps_slipperage"
            tooltip="html_popup_swaps_slippage_definition"
          />
          <OperationButtonComponent
            ariaLabel="operation-process-button"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={processSwap}
            label={'html_popup_swaps_process_swap'}
            fixToBottom
          />
        </>
      )}
      {loading && <RotatingLogoComponent />}
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);

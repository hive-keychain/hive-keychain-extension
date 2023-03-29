import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Token } from '@interfaces/tokens.interface';
import { setErrorMessage } from '@popup/actions/message.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
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
import { SwapStep, SwapTokenUtils } from 'src/utils/swap-token.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-swaps.component.scss';

const TokenSwaps = ({ activeAccount, setErrorMessage }: PropsFromRedux) => {
  const [loading, setLoading] = useState(true);
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
    setEstimate(
      await SwapTokenUtils.getEstimate(
        startToken?.value.symbol,
        endToken?.value.symbol,
        amount,
      ),
    );
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

    console.log(startToken?.value, endToken!.value);

    // await SwapTokenUtils.processSwap(
    //   estimate!,
    //   slipperage,
    //   activeAccount,
    //   startToken?.value,
    //   endToken?.value,
    //   parseFloat(amount),
    // );
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
          {!!autoRefreshCountdown && (
            <div>Auto refresh in {autoRefreshCountdown} sec</div>
          )}

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
                      estimate[estimate.length - 1].estimate.toString(),
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);

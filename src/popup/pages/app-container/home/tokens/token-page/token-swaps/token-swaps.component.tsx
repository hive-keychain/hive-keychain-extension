import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
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
import { BaseCurrencies } from 'src/utils/currency.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';
import TokensUtils from 'src/utils/tokens.utils';
import './token-swaps.component.scss';

const TokenSwaps = ({ activeAccount }: PropsFromRedux) => {
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
  const [swapFinalValue, setSwapFinalValue] = useState<number>();

  useEffect(() => {
    initTokenSelectOptions();
  }, []);

  useEffect(() => {
    calculateFinalValue();
  }, [amount]);

  const initTokenSelectOptions = async () => {
    const startList = await SwapTokenUtils.getSwapTokenStartList(
      activeAccount.account,
    );
    const allTokens = await TokensUtils.getAllTokens();
    let list = startList.map((token) => {
      const tokenInfo = allTokens.find((t) => t.symbol === token.symbol);
      let img = '';
      if (tokenInfo) {
        img =
          tokenInfo.metadata.icon && tokenInfo.metadata.icon.length > 0
            ? tokenInfo.metadata.icon
            : '/assets/images/hive-engine.svg';
      } else {
        img =
          token.symbol === BaseCurrencies.HIVE
            ? `/assets/images/${Icons.HIVE}`
            : `/assets/images/${Icons.HBD}`;
      }
      return {
        value: token.symbol,
        label: token.symbol,
        img: img,
      };
    });
    let endList: SelectOption[] = [
      {
        value: BaseCurrencies.HIVE,
        label: BaseCurrencies.HIVE.toUpperCase(),
        img: `/assets/images/${Icons.HIVE}`,
      },
      {
        value: BaseCurrencies.HBD,
        label: BaseCurrencies.HBD.toUpperCase(),
        img: `/assets/images/${Icons.HBD}`,
      },
      ...allTokens.map((token) => {
        let img = '';
        img = token.metadata.icon ?? '/assets/images/hive-engine.svg';
        return {
          value: token.symbol,
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

    calculateFinalValue();
  };

  const calculateFinalValue = async () => {
    setSwapFinalValue(
      await SwapTokenUtils.getFinalValue(
        startToken?.value!,
        endToken?.value!,
        amount,
      ),
    );
  };

  const processSwap = () => {
    console.log(
      `start processing swap from ${startToken?.label} to ${endToken?.label}`,
    );
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
          <div className="start-token">
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
                />
                {swapFinalValue && (
                  <div className="final-value">
                    {chrome.i18n.getMessage('html_popup_swaps_final_price', [
                      swapFinalValue.toString(),
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

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);

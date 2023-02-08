import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
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
  const [amount, setAmount] = useState();

  const [startToken, setStartToken] = useState<string>();
  const [endToken, setEndToken] = useState<string>();
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    SelectOption[]
  >([]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<
    SelectOption[]
  >([]);

  useEffect(() => {
    initTokenSelectOptions();
  }, []);

  const initTokenSelectOptions = async () => {
    const startList = await SwapTokenUtils.getSwapTokenStartList(
      activeAccount.account,
    );
    const allTokens = await TokensUtils.getAllTokens();
    let list = startList.map((token) => {
      const tokenInfo = allTokens.find((t) => t.symbol === token.symbol);
      let img = '';
      if (tokenInfo) {
        img = tokenInfo.metadata.icon ?? '/assets/images/hive-engine.svg';
      } else {
        img =
          token.symbol === BaseCurrencies.HIVE
            ? `/assets/images/${Icons.HIVE}`
            : `/assets/images/${Icons.HIVE}`;
      }
      return {
        value: token.symbol,
        label: token.symbol,
        img: img,
      };
    });
    // let endList: SelectOption[] = [{},{},...allTokens.map(token) => {
    //   let img = '';
    //     img = tokenInfo.metadata.icon ?? '/assets/images/hive-engine.svg';
    //   return {
    //     value: token.symbol,
    //     label: token.symbol,
    //     img: img,
    //   };
    // }]
    setStartToken(list[0].value);
    setStartTokenListOptions(list);
    // setEndTokenListOptions()
    setLoading(false);
  };

  const processSwap = () => {};

  return (
    <div className="token-swaps" aria-label="token-swaps">
      {!loading && (
        <>
          <div className="start-token">
            {startTokenListOptions.length > 0 && (
              <CustomSelect
                defaultValue={startTokenListOptions[0]}
                options={startTokenListOptions}
                skipLabelTranslation
                onSelectedValueChange={(token) => setStartToken(token)}
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
          <div className="end-token"></div>
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
            ariaLabel="operation-ok-button"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={processSwap}
            label={'html_popup_ok'}
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

import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { Card } from '@common-ui/card/card.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { LabelComponent } from '@common-ui/label/label.component';
import RotatingLogoComponent from '@common-ui/rotating-logo/rotating-logo.component';
import { LiFiTokenFilter } from '@popup/evm/pages/home/evm-lifi-swap/lifi-token-filter/lifi-token-filter.component';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

export const EvmLifiSwap = ({
  setTitleContainerProperties,
  activeChain,
  activeAccount,
}: PropsFromRedux) => {
  const [fromSelectedToken, setFromSelectedToken] = useState<any>(null);
  const [toSelectedToken, setToSelectedToken] = useState<any>(null);

  const [fromTokenList, setFromTokenList] = useState<OptionItem[]>([]);
  const [toTokenList, setToTokenList] = useState<OptionItem[]>([]);
  const [chainList, setChainList] = useState<OptionItem[]>([]);
  const [tokenList, setTokenList] = useState<OptionItem[]>([]);

  const [fromSelectedChain, setFromSelectedChain] = useState<OptionItem>();
  const [toSelectedChain, setToSelectedChain] = useState<OptionItem>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_token_swaps',
      isBackButtonEnabled: true,
    });
    initList();
  }, []);

  useEffect(() => {
    if (fromSelectedChain) {
      const tokens = filterTokenList(fromSelectedChain);
      setFromTokenList(tokens);
      setFromSelectedToken(tokens[0]);
    }
  }, [fromSelectedChain]);

  useEffect(() => {
    if (toSelectedChain) {
      const tokens = filterTokenList(toSelectedChain);
      setToTokenList(tokens);
      setToSelectedToken(tokens[0]);
    }
  }, [toSelectedChain]);

  const initList = async () => {
    const optionsLists = await LiFiUtils.getLiFiSwapOptionLists();

    setTokenList(optionsLists.tokens);
    setChainList(optionsLists.chains);

    const chain = optionsLists.chains.find(
      (chainOption) => chainOption.value.id === Number(activeChain.chainId),
    );
    setFromSelectedChain(chain);
    setToSelectedChain(chain);

    setLoading(false);
  };

  const filterTokenList = (chainOption: OptionItem) => {
    if (chainOption.value === '*') {
      return tokenList;
    } else {
      return tokenList.filter(
        (token) => token.value.chainId === chainOption.value.id,
      );
    }
  };

  return (
    <div className="evm-lifi-swap-page">
      <Card>
        {!loading && (
          <div className="evm-lifi-swap-page-content">
            <LabelComponent value="html_popup_swap_swap_from" />
            <div className="evm-lifi-swap-chain-token-selectors">
              <ComplexeCustomSelect
                options={fromTokenList}
                selectedItem={fromSelectedToken}
                setSelectedItem={setFromSelectedToken}
                generateImageIfNull
                filterable
                customFilter={
                  <>
                    {fromSelectedChain && (
                      <LiFiTokenFilter
                        options={chainList}
                        selectedItem={fromSelectedChain}
                        setSelectedItem={setFromSelectedChain}
                      />
                    )}
                  </>
                }
              />
            </div>

            <LabelComponent value="html_popup_swap_swap_to" />
            <div className="evm-lifi-swap-chain-token-selectors">
              <ComplexeCustomSelect
                options={fromTokenList}
                selectedItem={toSelectedToken}
                setSelectedItem={setToSelectedToken}
                generateImageIfNull
                filterable
                customFilter={
                  <>
                    {toSelectedChain && (
                      <LiFiTokenFilter
                        options={chainList}
                        selectedItem={toSelectedChain}
                        setSelectedItem={setToSelectedChain}
                      />
                    )}
                  </>
                }
              />
            </div>
            <InputComponent
              label="html_popup_swap_swap_amount"
              type={InputType.NUMBER}
              value={0}
              onChange={() => {}}
              placeholder="popup_html_transfer_amount"
            />
            <InputComponent
              label="html_popup_swap_swap_expected_amount"
              type={InputType.NUMBER}
              value={0}
              onChange={() => {}}
              placeholder="popup_html_transfer_amount"
              disabled
            />
            <div className="evm-lifi-swap-page-content-buttons">
              <ButtonComponent
                type={ButtonType.ALTERNATIVE}
                label="popup_html_button_label_cancel"
                onClick={() => {}}
              />
              <ButtonComponent
                type={ButtonType.IMPORTANT}
                label="html_popup_swaps_process_swap"
                onClick={() => {}}
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="evm-lifi-swap-page-loading">
            <RotatingLogoComponent />
          </div>
        )}
      </Card>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    activeChain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmLifiSwapComponent = connector(EvmLifiSwap);

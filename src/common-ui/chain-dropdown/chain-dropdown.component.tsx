import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmEventName } from '@interfaces/evm-provider.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const ChainDropdown = ({
  chain,
  activeAccount,
  setChain,
  resetChain,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [options, setOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    if (chain.name.length > 0) init();
  }, [chain]);

  const init = async () => {
    const chains = await ChainUtils.getSetupChains(true);
    if (!chains.find((e) => e.chainId === chain.chainId)) {
      chains.push(chain);
    }
    let optionItems: OptionItem[] = chains.map((c) => {
      return { label: c.name, value: c, img: c.logo };
    });
    setOptions(optionItems);
  };

  const handleOnAddBlockchainClicked = () => {
    resetChain();
  };

  const selectChain = (chain: Chain) => {
    switch (chain.type) {
      case ChainType.EVM:
        console.log('loading new chain ');
        loadEvmActiveAccount(chain as EvmChain, activeAccount.wallet);
        break;
    }

    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_EVM_EVENT,
      value: { eventType: EvmEventName.CHAIN_CHANGED, args: chain.chainId },
    } as BackgroundMessage);
    setChain(chain);
  };

  return (
    <>
      {options && chain && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          options={options}
          selectedItem={{ label: chain.name, value: chain, img: chain.logo }}
          setSelectedItem={(item) => selectChain(item.value)}
          background="white"
          footer={
            <div
              className="add-blockchain-panel"
              onClick={handleOnAddBlockchainClicked}>
              <SVGIcon icon={SVGIcons.SELECT_ADD} />
              <div className="text">
                {chrome.i18n.getMessage('html_popup_add_blockchain')}
              </div>
            </div>
          }
          renderOnlyIcon
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as Chain,
    activeAccount: state.evm.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setChain,
  resetChain,
  loadEvmActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainDropdownComponent = connector(ChainDropdown);

import { EvmEventName } from '@interfaces/evm-provider.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { sendEvmEventGlobal } from 'src/content-scripts/hive/web-interface/response.logic';
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
      return {
        key: c.chainId,
        label: c.name,
        value: c,
        img: c.logo,
        imgChip: c.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
      };
    });
    setOptions(optionItems);
  };

  const handleOnAddBlockchainClicked = () => {
    resetChain();
  };

  const selectChain = async (chain: Chain) => {
    if (chain.type === ChainType.EVM) {
      await EvmLightNodeUtils.registerAddress(
        chain.chainId,
        activeAccount.address,
        false,
      );
    }
    sendEvmEventGlobal(EvmEventName.CHAIN_CHANGED, chain.chainId);
    setChain(chain);
  };

  return (
    <>
      {options && chain && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          options={options}
          selectedItem={{
            key: chain.chainId,
            label: chain.name,
            value: chain,
            img: chain.logo,
            imgChip: chain.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
          }}
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
          showOverlay
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

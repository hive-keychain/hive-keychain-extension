import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { resetChain, setChain } from '@popup/multichain/actions/chain.actions';
import { Chain, ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
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
    const optionItems: OptionItem[] = chains.map((c) => {
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

  const handleOnManageChainsClicked = () => {
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
    setChain(chain);
  };

  return (
    <>
      {options && chain && (
        <ComplexeCustomSelect
          additionalClassname="chain-selector"
          ariaLabel="Chain dropdown"
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
              className="manage-chains-panel"
              onClick={handleOnManageChainsClicked}>
              <SVGIcon icon={SVGIcons.MENU_ADVANCED_SETTINGS_RPC_NODE} />
              <div className="text">
                {chrome.i18n.getMessage('html_popup_manage_chains')}
              </div>
            </div>
          }
          renderOnlyIcon
          showOverlay
          generateImageIfNull
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

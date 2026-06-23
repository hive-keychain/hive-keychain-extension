import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { Chain, ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
const ChainDropdown = ({
  chain,
  activeAccount,
  setChain,
  navigateTo,
  loadEvmActiveAccount,
}: PropsFromRedux) => {
  const [options, setOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const chains = (await ChainUtils.getSetupChains(true)).filter(
        (setupChain) => setupChain.type !== ChainType.HIVE,
      );
      if (cancelled) return;

      if (
        chain.type !== ChainType.HIVE &&
        !chains.find((e) => e.chainId === chain.chainId)
      ) {
        chains.push(chain);
      }
      const optionItems: OptionItem[] = chains.map((c) => {
        return {
          key: c.chainId,
          label: c.name,
          value: c,
          img: c.logo,
          imgChainName: c.name,
          imgChip: c.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
        };
      });
      setOptions(optionItems);
    };

    if (chain.name.length > 0) void init();

    return () => {
      cancelled = true;
    };
  }, [chain]);

  const handleOnManageChainsClicked = () => {
    navigateTo(EvmScreen.EVM_CUSTOM_CHAINS);
  };

  const selectChain = async (chain: Chain) => {
    if (chain.type === ChainType.EVM) {
      await EvmLightNodeUtils.registerAddress(
        chain.chainId,
        activeAccount.address,
        false,
      );
    }
    setChain(chain, { syncProviderNetwork: true });
  };

  const getChainIdsFromOptions = (optionItems: OptionItem[]) => {
    return optionItems.map((option) => {
      const chainValue = option.value as Chain;
      return option.key ?? chainValue.chainId;
    });
  };

  const handleOptionsReorder = async (reorderedOptions: OptionItem[]) => {
    setOptions(reorderedOptions);
    await ChainUtils.reorderSetupChains(getChainIdsFromOptions(reorderedOptions));
  };

  if (chain.type === ChainType.HIVE) {
    return null;
  }

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
            imgChainName: chain.name,
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
                {I18nUtils.getMessage('html_popup_manage_chains')}
              </div>
            </div>
          }
          renderOnlyIcon
          showOverlay
          generateImageIfNull
          enableDragAndDrop
          droppableId="chain-dropdown-options"
          onOptionsReorder={handleOptionsReorder}
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
  navigateTo,
  loadEvmActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ChainDropdownComponent = connector(ChainDropdown);

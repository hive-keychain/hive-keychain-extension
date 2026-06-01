import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { EvmRpcNodesComponent } from '@popup/evm/pages/home/settings/evm-advanced-settings/evm-rpc-nodes/evm-rpc-nodes.component';
import { RpcNodesComponent } from '@popup/hive/pages/app-container/settings/advanced-settings/rpc-nodes/rpc-nodes.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  getSettingsChainOptions,
  SettingsChainOption,
} from 'src/popup/multichain/pages/settings/settings-chain-select.utils';

const SettingsNetworkPage = ({
  hasHiveAccounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [options, setOptions] = useState<SettingsChainOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SettingsChainOption>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_network',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    initOptions();
  }, []);

  const initOptions = async () => {
    const nextOptions = await getSettingsChainOptions(hasHiveAccounts);
    setOptions(nextOptions);
    setSelectedOption(nextOptions[0]);
  };

  const handleSelectedOption = (option: OptionItem) => {
    setSelectedOption(option as SettingsChainOption);
  };

  return (
    <div
      className="settings-shared-page settings-network-page"
      data-testid="SETTINGS_NETWORK-page">
      {selectedOption && options.length > 1 && (
        <div className="settings-chain-select-panel">
          <ComplexeCustomSelect
            options={options}
            selectedItem={selectedOption}
            setSelectedItem={handleSelectedOption}
            background="white"
            generateImageIfNull
          />
        </div>
      )}
      {selectedOption?.value.type === ChainType.HIVE && (
        <RpcNodesComponent titleMessageKey="popup_html_network" />
      )}
      {selectedOption?.value.type === ChainType.EVM && (
        <EvmRpcNodesComponent
          key={selectedOption.value.chain.chainId}
          chainOverride={selectedOption.value.chain}
          hideChainSelector
          titleMessageKey="popup_html_network"
        />
      )}
    </div>
  );
};

const connector = connect(
  (state: RootState) => ({
    hasHiveAccounts: state.hive.accounts.length > 0,
  }),
  {
    setTitleContainerProperties,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsNetworkPageComponent = connector(SettingsNetworkPage);

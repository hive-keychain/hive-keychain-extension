import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { EvmDappsConnectionsComponent } from '@popup/evm/pages/home/settings/evm-dapps-connections/evm-dapps-connections.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { resolveDefaultChainTypeSettingsOption } from 'src/popup/multichain/pages/settings/settings-chain-select.utils';
import { SettingsHiveDappsPageComponent } from 'src/popup/multichain/pages/settings/settings-hive-dapps-page.component';

type DappSettingsOption = OptionItem & {
  value: ChainType.HIVE | ChainType.EVM;
};

const SettingsConnectedDappsPage = ({
  activeChain,
  hasEvmAccounts,
  hasHiveAccounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [options, setOptions] = useState<DappSettingsOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DappSettingsOption>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_connected_dapps',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    const nextOptions: DappSettingsOption[] = [];
    if (hasHiveAccounts) {
      nextOptions.push({
        label: 'Hive',
        value: ChainType.HIVE as ChainType.HIVE,
        img: SVGIcons.BLOCKCHAIN_HIVE,
      });
    }
    if (hasEvmAccounts) {
      nextOptions.push({
        label: 'EVM',
        value: ChainType.EVM as ChainType.EVM,
        img: SVGIcons.BLOCKCHAIN_ETHEREUM,
      });
    }
    setOptions(nextOptions);
    setSelectedOption(
      resolveDefaultChainTypeSettingsOption(nextOptions, activeChain),
    );
  }, [activeChain, hasEvmAccounts, hasHiveAccounts]);

  const handleSelectedOption = (option: OptionItem) => {
    setSelectedOption(option as DappSettingsOption);
  };

  return (
    <div
      className="settings-shared-page settings-connected-dapps-page"
      data-testid="SETTINGS_CONNECTED_DAPPS-page">
      {selectedOption && options.length > 1 && (
        <div className="settings-chain-select-panel">
          <ComplexeCustomSelect
            options={options}
            selectedItem={selectedOption}
            setSelectedItem={handleSelectedOption}
            background="white"
          />
        </div>
      )}
      {selectedOption?.value === ChainType.HIVE && (
        <SettingsHiveDappsPageComponent />
      )}
      {selectedOption?.value === ChainType.EVM && (
        <EvmDappsConnectionsComponent titleMessageKey="popup_html_connected_dapps" />
      )}
    </div>
  );
};

const connector = connect(
  (state: RootState) => ({
    activeChain: state.chain as Chain,
    hasEvmAccounts: state.evm.accounts.length > 0,
    hasHiveAccounts: state.hive.accounts.length > 0,
  }),
  {
    setTitleContainerProperties,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsConnectedDappsPageComponent = connector(
  SettingsConnectedDappsPage,
);

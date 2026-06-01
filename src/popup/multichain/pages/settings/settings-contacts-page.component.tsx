import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { EvmContactsComponent } from '@popup/evm/pages/home/settings/evm-contacts/evm-contacts.component';
import { FavoriteAccountsComponent } from '@popup/hive/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  getSettingsChainOptions,
  SettingsChainOption,
} from 'src/popup/multichain/pages/settings/settings-chain-select.utils';

const SettingsContactsPage = ({
  hasHiveAccounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [options, setOptions] = useState<SettingsChainOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<SettingsChainOption>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_contacts',
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
      className="settings-shared-page settings-contacts-page"
      data-testid="SETTINGS_CONTACTS-page">
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
        <FavoriteAccountsComponent titleMessageKey="popup_html_contacts" />
      )}
      {selectedOption?.value.type === ChainType.EVM && (
        <EvmContactsComponent
          key={selectedOption.value.chain.chainId}
          chainOverride={selectedOption.value.chain}
          hideChainSelector
          titleMessageKey="popup_html_contacts"
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

export const SettingsContactsPageComponent = connector(SettingsContactsPage);

import { MenuComponent } from '@common-ui/menu/menu.component';
import { getEvmAdvancedSettingsMenuItems } from '@popup/evm/pages/home/settings/evm-advanced-settings/evm-advanced-settings-menu-items.list';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EvmAdvancedSettings = ({
  isLedgerSupported,
  setTitleContainerProperties,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_advanced',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, []);

  return (
    <div className="evm-advanced-settings-page">
      <MenuComponent
        title="popup_html_advanced_settings"
        isBackButtonEnable={true}
        menuItems={getEvmAdvancedSettingsMenuItems(
          isLedgerSupported,
        )}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    isLedgerSupported: false,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});

type PropsType = ConnectedProps<typeof connector>;

export const EvmAdvancedSettingsComponent = connector(EvmAdvancedSettings);

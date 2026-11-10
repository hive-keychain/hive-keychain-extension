import { Screen } from '@interfaces/screen.interface';
import { forgetMk } from '@popup/multichain/actions/mk.actions';
import { resetNav } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import { getSettingsMainPageMenuItems } from 'src/popup/multichain/pages/settings/settings-main-page-menu-items';

const SettingsMainPage = ({
  evmAccountsCount,
  forgetMk,
  hiveAccountsCount,
  resetNav,
}: PropsFromRedux) => {
  const logout = () => {
    resetNav();
    forgetMk();
  };

  return (
    <div
      className="settings-main-page"
      data-testid={`${Screen.SETTINGS_MAIN_PAGE}-page`}>
      <MenuComponent
        title="popup_html_settings"
        isBackButtonEnable={true}
        rightAction={{
          icon: SVGIcons.MENU_LOGOUT,
          callback: logout,
          className: 'menu-logout',
          dataTestId: 'log-out-button',
          tooltipMessage: 'popup_html_logout',
        }}
        isCloseButtonDisabled
        menuItems={getSettingsMainPageMenuItems({
          hasEvmAccounts: evmAccountsCount > 0,
          hasHiveAccounts: hiveAccountsCount > 0,
        })}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    evmAccountsCount: state.evm.accounts.length,
    hiveAccountsCount: state.hive.accounts.length,
  };
};

const connector = connect(mapStateToProps, {
  forgetMk,
  resetNav,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const UnifiedSettingsMainPageComponent = connector(SettingsMainPage);

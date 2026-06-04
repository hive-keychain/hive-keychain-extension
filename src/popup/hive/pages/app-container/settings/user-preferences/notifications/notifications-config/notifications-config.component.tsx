import { ActiveAccount } from '@interfaces/active-account.interface';
import { KeyType } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  resetNav,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';

import { I18nUtils } from 'src/utils/i18n.utils';
type HiveAccountOption = OptionItem & {
  value: string;
};

const NotificationConfigPage = ({
  accounts,
  activeAccountName,
  setTitleContainerProperties,
  resetNav,
  navigateTo,
  setErrorMessage,
}: PropsFromRedux) => {
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
  );
  const [isActive, setActive] = useState(false);
  const [userHasConfig, setUserHasConfig] = useState<boolean>();

  const [ready, setReady] = useState(false);

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  const getSelectedAccountForSigning = (): ActiveAccount | undefined => {
    const localAccount = accounts.find(
      (account) => account.name === selectedAccountName,
    );
    if (!localAccount) {
      return undefined;
    }

    return {
      name: localAccount.name,
      keys: localAccount.keys,
    } as ActiveAccount;
  };

  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_settings_notifications',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (!selectedAccountName && activeAccountName) {
      setSelectedAccountName(activeAccountName);
    }
  }, [activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (
      selectedAccountName &&
      accountOptions.some(
        (accountOption) => accountOption.value === selectedAccountName,
      )
    ) {
      return;
    }

    setSelectedAccountName(activeAccountName ?? accounts[0]?.name);
  }, [accounts, activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (!selectedAccountName) {
      return;
    }

    setReady(false);
    initConfig(selectedAccountName);
  }, [selectedAccountName]);

  const initConfig = async (activeAccountName: string) => {
    const userConfig = await PeakDNotificationsUtils.getAccountConfig(
      activeAccountName,
    );

    setUserHasConfig(!!userConfig);
    setActive(!!userConfig);
    setReady(true);
  };

  const openAdvancedConfiguration = async () => {
    chrome.tabs.create({
      url: `peak-open-notifications-config.html`,
    });
  };

  const handleSubmitClick = async () => {
    const selectedAccount = getSelectedAccountForSigning();
    if (!selectedAccount) {
      return;
    }

    if (isActive === userHasConfig) {
      setErrorMessage('notification_settings_nothing_has_changed');
      return;
    }

    if (isActive) {
      await PeakDNotificationsUtils.saveDefaultConfig(selectedAccount);
    } else {
      setReady(false);
      await PeakDNotificationsUtils.deleteAccountConfig(selectedAccount);
    }
    resetNav();
    navigateTo(Screen.HOME_PAGE, true);
  };

  return (
    <>
      {ready && (
        <div
          data-testid={`${Screen.SETTINGS_NOTIFICATIONS_CONFIGURATION}-page`}
          className={`notifications-config-page`}>
          <div className="caption">
            {I18nUtils.getMessage(
              'html_popup_settings_notifications_caption',
            )}
          </div>

          {selectedAccountOption && (
            <div className="settings-hive-account-select-panel">
              <ComplexeCustomSelect
                options={accountOptions}
                selectedItem={selectedAccountOption}
                setSelectedItem={(option) =>
                  setSelectedAccountName(option.value)
                }
                background="white"
              />
            </div>
          )}

          <CheckboxPanelComponent
            checked={isActive}
            onChange={setActive}
            backgroundType={BackgroundType.FILLED}
            title="html_popup_settings_notifications_activated"
          />
          <div
            className="link-to-advanced-settings"
            onClick={openAdvancedConfiguration}>
            {I18nUtils.getMessage('notification_settings_advanced_settings')}
          </div>

          <div className="fill-space"></div>

          <OperationButtonComponent
            key={KeyType.POSTING}
            onClick={handleSubmitClick}
            label={'popup_html_save'}
          />
        </div>
      )}
      {!ready && <LoadingComponent />}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  accounts: state.hive.accounts,
  activeAccountName: state.hive.activeAccount.name,
});
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  resetNav,
  navigateTo,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NotificationsConfigComponent = connector(NotificationConfigPage);

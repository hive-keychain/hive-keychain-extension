import { KeyType } from '@interfaces/keys.interface';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  resetNav,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';

const NotificationConfigPage = ({
  activeAccount,
  setTitleContainerProperties,
  resetNav,
  navigateTo,
  setErrorMessage,
}: PropsFromRedux) => {
  const [isActive, setActive] = useState(false);
  const [userHasConfig, setUserHasConfig] = useState<boolean>();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_settings_notifications',
      isBackButtonEnabled: true,
    });
    if (activeAccount && activeAccount.name) initConfig(activeAccount.name);
  }, [activeAccount.name]);

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
    if (isActive === userHasConfig) {
      setErrorMessage('notification_settings_nothing_has_changed');
      return;
    }

    if (isActive) {
      await PeakDNotificationsUtils.saveDefaultConfig(activeAccount);
    } else {
      setReady(false);
      await PeakDNotificationsUtils.deleteAccountConfig(activeAccount);
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
            {chrome.i18n.getMessage(
              'html_popup_settings_notifications_caption',
            )}
          </div>

          <SelectAccountSectionComponent
            fullSize
            background="white"></SelectAccountSectionComponent>

          <CheckboxPanelComponent
            checked={isActive}
            onChange={setActive}
            backgroundType={BackgroundType.FILLED}
            title="html_popup_settings_notifications_activated"
          />
          <div
            className="link-to-advanced-settings"
            onClick={openAdvancedConfiguration}>
            {chrome.i18n.getMessage('notification_settings_advanced_settings')}
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

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.hive.activeAccount };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  resetNav,
  navigateTo,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const NotificationsConfigComponent = connector(NotificationConfigPage);

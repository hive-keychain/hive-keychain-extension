import { DynamicGlobalProperties } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Notification } from '@interfaces/notifications.interface';
import { NotificationPanelComponent } from '@popup/hive/pages/app-container/home/notifications/notification-panel.component';
import { NotificationsUtils } from '@popup/hive/utils/notifications/notifications.utils';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface NotificationsProps {
  globalProperties: GlobalProperties;
  activeAccount: ActiveAccount;
}

const Notifications = ({
  globalProperties,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [notifications, setNotifications] = useState<Notification[]>();
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);

  useEffect(() => {
    if (globalProperties.globals && activeAccount.name) {
      initNotifications(activeAccount.name!, globalProperties.globals);
    }
  }, [activeAccount.name, globalProperties]);

  const initNotifications = async (
    username: string,
    dynamicGlobalProperties: DynamicGlobalProperties,
  ) => {
    setNotifications([]);
    setHasMoreData(false);
    const userConfig = await PeakDNotificationsUtils.getAccountConfig(username);
    if (userConfig) {
      const { notifs, hasMore } = await NotificationsUtils.getNotifications(
        username,
        dynamicGlobalProperties,
      );
      setNotifications(notifs);
      setHasMoreData(hasMore);
    }
  };

  const toggleNotificationPanel = () => {
    setNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const markAllAsRead = async () => {
    addToLoadingList('notification_setting_all_as_read');
    await NotificationsUtils.markAllAsRead(activeAccount);
    removeFromLoadingList('notification_setting_all_as_read');
    setNotifications(
      notifications?.map((notif) => {
        notif.read = true;
        return notif;
      }),
    );
  };

  const loadMore = async () => {
    const { notifs, hasMore } = await NotificationsUtils.getNotifications(
      activeAccount.name!,
      globalProperties.globals!,
      notifications,
    );
    setNotifications(notifs);
    setHasMoreData(hasMore);
  };

  return (
    <>
      {notifications && notifications.length > 0 && (
        <div className="notifications-button-container">
          <SVGIcon
            icon={SVGIcons.TOP_BAR_NOTIFICATION_BUTTON}
            dataTestId="notification-button"
            className="notification-button"
            onClick={() => toggleNotificationPanel()}
            hoverable
          />
          {notifications.filter((notif) => !notif.read).length > 0 && (
            <div className="notifications-count">
              {notifications.filter((notif) => !notif.read).length}
            </div>
          )}
        </div>
      )}
      {notifications && notifications.length > 0 && (
        <NotificationPanelComponent
          notifications={notifications}
          isPanelOpened={isNotificationPanelOpen}
          onMarkAllAsRead={() => markAllAsRead()}
          loadMore={loadMore}
          hasMoreData={hasMoreData}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector> & NotificationsProps;

export const NotificationsComponent = connector(Notifications);

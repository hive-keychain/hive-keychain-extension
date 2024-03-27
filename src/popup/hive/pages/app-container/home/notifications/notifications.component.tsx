import { DynamicGlobalProperties } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { GlobalProperties } from '@interfaces/global-properties.interface';
import { Notification } from '@interfaces/notifications.interface';
import { NotificationPanelComponent } from '@popup/hive/pages/app-container/home/notifications/notification-panel.component';
import { RootState } from '@popup/hive/store';
import { NotificationsUtils } from '@popup/hive/utils/notifications/notifications.utils';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface NotificationsProps {
  globalProperties: GlobalProperties;
  activeAccount: ActiveAccount;
}

const Notifications = ({
  globalProperties,
  activeAccount,
}: NotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>();
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

  useEffect(() => {
    if (globalProperties.globals && activeAccount.name)
      initNotifications(activeAccount.name!, globalProperties.globals);
  }, [activeAccount.name, globalProperties]);

  const initNotifications = async (
    username: string,
    dynamicGlobalProperties: DynamicGlobalProperties,
  ) => {
    const notifs = await NotificationsUtils.getNotifications(
      username,
      dynamicGlobalProperties,
    );
    setNotifications(notifs);
  };

  const toggleNotificationPanel = () => {
    setNotificationPanelOpen(!isNotificationPanelOpen);
  };

  const loadMore = async () => {
    console.log('loading more');
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
          <div className="notifications-count">
            {notifications.filter((notif) => !notif.read).length}
          </div>
        </div>
      )}
      {notifications && notifications.length > 0 && (
        <NotificationPanelComponent
          notifications={notifications}
          isPanelOpened={isNotificationPanelOpen}
          onSetAllAsRead={() => setNotifications([])}
          loadMore={() => loadMore()}
        />
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {});

export const NotificationsComponent = connector(Notifications);

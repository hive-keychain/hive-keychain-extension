import { Notification } from '@interfaces/notifications.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import { RootState } from '@popup/hive/store';
import { NotificationsUtils } from '@popup/hive/utils/notifications/notifications.utils';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { Separator } from 'src/common-ui/separator/separator.component';

interface NotificationPanelProps {
  isPanelOpened: boolean;
  notifications: Notification[];
  onSetAllAsRead: () => void;
  loadMore: () => void;
}

export const NotificationPanel = ({
  isPanelOpened,
  notifications,
  activeAccount,
  onSetAllAsRead,
  addToLoadingList,
  removeFromLoadingList,
  loadMore,
}: PropsFromRedux) => {
  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);
  const notificationList = useRef<HTMLDivElement>(null);

  const markAllAsRead = async () => {
    addToLoadingList('notification_setting_all_as_read');
    await NotificationsUtils.markAllAsRead(activeAccount);
    await onSetAllAsRead();
    removeFromLoadingList('notification_setting_all_as_read');
  };

  const clickOnNotification = (notification: Notification) => {
    if (notification.externalUrl) {
      chrome.tabs.create({
        url: notification.externalUrl,
      });
    } else if (notification.txUrl) {
      chrome.tabs.create({
        url: notification.txUrl,
      });
    }
  };

  const handleScroll = (event: any) => {
    // if (
    //   transactions.list[transactions.list.length - 1]?.last === true ||
    //   transactions.lastUsedStart === 0
    // )
    //   return;
    setDisplayedScrollToTop(event.target.scrollTop !== 0);

    if (
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight
    ) {
      loadMore();
    }
  };

  return (
    <div
      className={`notifications-panel ${isPanelOpened ? 'opened' : 'closed'}`}>
      <div
        className="notification-list"
        ref={notificationList}
        onScroll={handleScroll}>
        {isPanelOpened && (
          <>
            <ButtonComponent
              type={ButtonType.ALTERNATIVE}
              label="notification_set_all_as_read"
              onClick={markAllAsRead}
              additionalClass="set-all-as-read"
            />
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <div
                  className={`notification-item ${
                    notif.txUrl || notif.externalUrl ? 'clickable' : ''
                  }`}
                  onClick={() => {
                    clickOnNotification(notif);
                  }}>
                  <div
                    className={`notification-dot ${
                      notif.read ? 'read' : ''
                    }`}></div>
                  <div className="notification-content">
                    <div
                      className="message"
                      dangerouslySetInnerHTML={{
                        __html: chrome.i18n.getMessage(
                          notif.message,
                          notif.messageParams,
                        ),
                      }}></div>
                    <div className="date">
                      {moment(notif.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
                {index !== notifications.length - 1 && (
                  <Separator type="horizontal" />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>
      {displayScrollToTop && <BackToTopButton element={notificationList} />}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector> & NotificationPanelProps;

export const NotificationPanelComponent = connector(NotificationPanel);

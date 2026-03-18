import { Notification } from '@interfaces/notifications.interface';
import { RootState } from '@popup/multichain/store';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { BackToTopButton } from 'src/common-ui/back-to-top-button/back-to-top-button.component';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { renderLocalizedNotificationMessage } from 'src/popup/hive/pages/app-container/home/notifications/notification-message.utils';

interface NotificationPanelProps {
  isPanelOpened: boolean;
  notifications: Notification[];
  hasMoreData: boolean;
  onMarkAllAsRead: () => void;
  loadMore: () => Promise<void>;
}

export const NotificationPanel = ({
  isPanelOpened,
  notifications,
  hasMoreData,
  onMarkAllAsRead,
  loadMore,
}: PropsFromRedux) => {
  const [displayScrollToTop, setDisplayedScrollToTop] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allRead, setAllRead] = useState(false);

  const notificationList = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllRead(notifications.every((notif) => notif.read));
  }, [notifications]);

  const openUrl = (url: string) => {
    chrome.tabs.create({
      url,
    });
  };

  const clickOnNotification = (notification: Notification) => {
    if (notification.externalUrl) {
      openUrl(notification.externalUrl);
    } else if (notification.txUrl) {
      openUrl(notification.txUrl);
    }
  };

  const renderMessage = (notification: Notification) => {
    const localizedMessage = chrome.i18n.getMessage(
      notification.message,
      notification.messageParams,
    );

    if (!notification.linkUrl || !notification.linkLabel) {
      return localizedMessage;
    }

    const notificationLinkUrl = notification.linkUrl;
    return renderLocalizedNotificationMessage(
      localizedMessage,
      <a
        className="notification-link"
        href={notificationLinkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openUrl(notificationLinkUrl);
        }}>
        {notification.linkLabel}
      </a>,
    );
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

  const handleScroll = (event: any) => {
    if (isLoadingMore || !hasMoreData) return;
    setDisplayedScrollToTop(event.target.scrollTop !== 0);

    if (
      event.target.scrollHeight - event.target.scrollTop ===
      event.target.clientHeight
    ) {
      handleLoadMore();
    }
  };

  return (
    <div
      className={`notifications-panel ${isPanelOpened ? 'opened' : 'closed'}`}>
      {isPanelOpened && (
        <div className="notification-list-container">
          {!allRead && (
            <ButtonComponent
              type={ButtonType.ALTERNATIVE}
              label="notification_set_all_as_read"
              onClick={onMarkAllAsRead}
              additionalClass="set-all-as-read"
            />
          )}
          <div
            className="notification-list"
            ref={notificationList}
            onScroll={handleScroll}>
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
                    <div className="message">{renderMessage(notif)}</div>
                    <div className="date">
                      {moment(notif.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
                {index !== notifications.length - 1 && (
                  <Separator type="horizontal" />
                )}
                {isLoadingMore && index === notifications.length - 1 && (
                  <div className="load-more-panel">
                    <RotatingLogoComponent />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {displayScrollToTop && <BackToTopButton element={notificationList} />}
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector> & NotificationPanelProps;

export const NotificationPanelComponent = connector(NotificationPanel);

import { Notification } from '@interfaces/notifications.interface';
import moment from 'moment';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { Separator } from 'src/common-ui/separator/separator.component';

interface NotificationPanelProps {
  isPanelOpened: boolean;
  notifications: Notification[];
  clickOnNotification: (notif: Notification) => void;
}

export const NotificationPanel = ({
  isPanelOpened,
  notifications,
  clickOnNotification,
}: NotificationPanelProps) => {
  const setAllAsRead = async () => {};

  return (
    <div
      className={`notifications-panel ${isPanelOpened ? 'opened' : 'closed'}`}>
      <ButtonComponent
        type={ButtonType.ALTERNATIVE}
        label="notification_set_all_as_read"
        onClick={setAllAsRead}
        additionalClass="set-all-as-read"
      />
      <div className="notification-list">
        {isPanelOpened &&
          notifications.map((notif, index) => (
            <React.Fragment key={notif.id}>
              <div
                className={`notification-item ${notif.txId ? 'clickable' : ''}`}
                onClick={() => {
                  clickOnNotification(notif);
                }}>
                <div
                  className="message"
                  dangerouslySetInnerHTML={{
                    __html: chrome.i18n.getMessage(
                      notif.message,
                      notif.messageParams,
                    ),
                  }}></div>
                <div className="date">{moment(notif.createdAt).fromNow()}</div>
              </div>
              {index !== notifications.length - 1 && (
                <Separator type="horizontal" />
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

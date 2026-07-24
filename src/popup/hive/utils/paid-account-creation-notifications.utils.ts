import { I18nUtils } from 'src/utils/i18n.utils';
import Logger from 'src/utils/logger.utils';

const NOTIFICATION_ID_PREFIX = 'hive-account-creation';

const getNotificationId = (requestId: string) =>
  `${NOTIFICATION_ID_PREFIX}:${requestId}`;

const showAccountCreatedNotification = async (
  username: string,
  requestId: string,
): Promise<void> => {
  const formattedUsername = username.startsWith('@') ? username : `@${username}`;
  const [title, message] = await Promise.all([
    I18nUtils.getMessage('paid_hive_account_creation_notification_title'),
    I18nUtils.getMessage('paid_hive_account_creation_notification_message', [
      formattedUsername,
    ]),
  ]);

  await new Promise<void>((resolve) => {
    chrome.notifications.create(
      getNotificationId(requestId),
      {
        type: 'basic',
        iconUrl: '/assets/images/iconhive.png',
        title,
        message,
        priority: 0,
      },
      () => {
        if (chrome.runtime.lastError) {
          Logger.error(
            'Unable to show paid Hive account creation notification',
            chrome.runtime.lastError,
          );
        }
        resolve();
      },
    );
  });
};

export const PaidAccountCreationNotificationsUtils = {
  showAccountCreatedNotification,
};

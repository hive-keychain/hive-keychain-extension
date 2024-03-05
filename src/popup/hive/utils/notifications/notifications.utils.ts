import { DynamicGlobalProperties } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';

const getNotifications = async (
  username: string,
  globalProperties: DynamicGlobalProperties,
) => {
  const peakDNotifications = await PeakDNotificationsUtils.getNotifications(
    username,
    globalProperties,
  );

  const finalNotifications = [...peakDNotifications];
  finalNotifications.sort((a, b) => {
    if (a.createdAt < b.createdAt) return -1;
    else if (a.createdAt > b.createdAt) return 1;
    else return 0;
  });
  return [...peakDNotifications];
};

const markAllAsRead = async (activeAccount: ActiveAccount) => {
  await PeakDNotificationsUtils.markAllAsRead(activeAccount);
};

export const NotificationsUtils = {
  getNotifications,
  markAllAsRead,
};

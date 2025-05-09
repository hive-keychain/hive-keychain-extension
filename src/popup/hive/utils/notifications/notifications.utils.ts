import type { DynamicGlobalProperties } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import {
  Notification,
  NotificationType,
} from '@interfaces/notifications.interface';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';

const getNotifications = async (
  username: string,
  globalProperties: DynamicGlobalProperties,
  initialList: Notification[] = [],
) => {
  const peakDNotifications = await PeakDNotificationsUtils.getNotifications(
    username,
    globalProperties,
    initialList.filter((n) => n.type === NotificationType.PEAKD),
  );
  const peakdHasMore =
    peakDNotifications.length === 0
      ? false
      : !peakDNotifications[peakDNotifications.length - 1].isTypeLast;

  const finalNotifications = [...initialList, ...peakDNotifications];
  finalNotifications.sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    else if (a.createdAt < b.createdAt) return 1;
    else return 0;
  });
  return { notifs: finalNotifications, hasMore: peakdHasMore };
};

const markAllAsRead = async (activeAccount: ActiveAccount) => {
  await PeakDNotificationsUtils.markAllAsRead(activeAccount);
};

export const NotificationsUtils = {
  getNotifications,
  markAllAsRead,
};

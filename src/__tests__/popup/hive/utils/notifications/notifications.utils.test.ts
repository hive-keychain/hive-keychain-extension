import type { DynamicGlobalProperties } from '@hiveio/dhive';
import moment from 'moment';
import {
  Notification,
  NotificationType,
} from '@interfaces/notifications.interface';
import { PeakDNotificationsUtils } from '@popup/hive/utils/notifications/peakd-notifications.utils';
import { NotificationsUtils } from 'src/popup/hive/utils/notifications/notifications.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';

jest.mock('@popup/hive/utils/notifications/peakd-notifications.utils', () => ({
  PeakDNotificationsUtils: {
    getNotifications: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

describe('notifications.utils', () => {
  const globals = dynamic.globalProperties as unknown as DynamicGlobalProperties;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merges PeakD notifications, sorts by createdAt, and computes hasMore', async () => {
    const older = moment('2024-01-01');
    const newer = moment('2024-06-01');

    const initial: Notification[] = [
      {
        type: NotificationType.PEAKD,
        isTypeLast: false,
        id: 'a',
        message: 'x',
        messageParams: [],
        createdAt: older,
        read: false,
      },
    ];

    (PeakDNotificationsUtils.getNotifications as jest.Mock).mockResolvedValueOnce([
      {
        type: NotificationType.PEAKD,
        isTypeLast: false,
        id: 'b',
        message: 'y',
        messageParams: [],
        createdAt: newer,
        read: false,
      },
    ]);

    const { notifs, hasMore } = await NotificationsUtils.getNotifications(
      'alice',
      globals,
      initial,
    );

    expect(hasMore).toBe(true);
    expect(notifs[0].id).toBe('b');
    expect(notifs[1].id).toBe('a');
    expect(PeakDNotificationsUtils.getNotifications).toHaveBeenCalledWith(
      'alice',
      globals,
      initial,
    );
  });

  it('sets hasMore to false when PeakD returns no rows', async () => {
    (PeakDNotificationsUtils.getNotifications as jest.Mock).mockResolvedValueOnce([]);

    const { notifs, hasMore } = await NotificationsUtils.getNotifications(
      'bob',
      globals,
      [],
    );

    expect(hasMore).toBe(false);
    expect(notifs).toEqual([]);
  });

  it('sets hasMore to false when the last PeakD row is the final page', async () => {
    const t = moment('2024-03-01');
    (PeakDNotificationsUtils.getNotifications as jest.Mock).mockResolvedValueOnce([
      {
        type: NotificationType.PEAKD,
        isTypeLast: true,
        id: 'last',
        message: 'm',
        messageParams: [],
        createdAt: t,
        read: true,
      },
    ]);

    const { hasMore } = await NotificationsUtils.getNotifications('u', globals, []);
    expect(hasMore).toBe(false);
  });

  it('passes only PEAKD items from initialList into PeakD utils', async () => {
    (PeakDNotificationsUtils.getNotifications as jest.Mock).mockResolvedValueOnce([]);
    const peakdOnly = moment('2024-01-02');
    const initial: Notification[] = [
      {
        type: NotificationType.PEAKD,
        isTypeLast: true,
        id: 'p',
        message: '',
        messageParams: [],
        createdAt: peakdOnly,
        read: false,
      },
      {
        type: 'OTHER' as unknown as NotificationType,
        isTypeLast: true,
        id: 'o',
        message: '',
        messageParams: [],
        createdAt: moment('2024-01-01'),
        read: false,
      },
    ];

    await NotificationsUtils.getNotifications('alice', globals, initial);

    expect(PeakDNotificationsUtils.getNotifications).toHaveBeenCalledWith(
      'alice',
      globals,
      [initial[0]],
    );
  });

  it('delegates markAllAsRead to PeakD utils', async () => {
    const account = {
      name: 'u',
      keys: { posting: 'k' },
    } as any;

    await NotificationsUtils.markAllAsRead(account);
    expect(PeakDNotificationsUtils.markAllAsRead).toHaveBeenCalledWith(account);
  });
});

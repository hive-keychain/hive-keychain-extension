import { HiveNotificationOperationLabelUtils } from '@popup/hive/utils/notifications/hive-notification-operation-label.utils';

describe('HiveNotificationOperationLabelUtils', () => {
  it('formats operation names for display', () => {
    expect(
      HiveNotificationOperationLabelUtils.formatNotificationOperationLabel(
        'account_update',
      ),
    ).toBe('Account Update');
    expect(
      HiveNotificationOperationLabelUtils.formatNotificationOperationLabel(
        'fill_recurrent_transfer',
      ),
    ).toBe('Fill Recurrent Transfer');
    expect(
      HiveNotificationOperationLabelUtils.formatNotificationOperationLabel(
        'transfer',
      ),
    ).toBe('Transfer');
  });
});

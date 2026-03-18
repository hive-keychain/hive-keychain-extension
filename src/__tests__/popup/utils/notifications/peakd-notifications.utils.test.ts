import { PeakDNotificationsApi } from '@api/peakd-notifications';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import { PeakDNotificationsUtils } from 'src/popup/hive/utils/notifications/peakd-notifications.utils';

describe('PeakDNotificationsUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('encodes generated notification URLs', async () => {
    jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
      {
        id: '1',
        created: '2024-01-01T00:00:00',
        read_at: '2024-01-01T00:00:00',
        payload: JSON.stringify({
          voter: 'alice',
          author: 'bob',
          permlink: 'unsafe path/?x=<tag>',
        }),
        operation: 'vote',
        operation_type: 'vote',
        sender: 'alice',
        account: 'bob',
        trigger: '',
        trx_id: 'abc/123',
      },
    ]);

    const [notification] = await PeakDNotificationsUtils.getNotifications(
      'quentin',
      dynamic.globalProperties,
    );

    expect(notification.externalUrl).toBe(
      'https://peakd.com/@bob/unsafe%20path%2F%3Fx%3D%3Ctag%3E',
    );
    expect(notification.linkUrl).toBe(notification.externalUrl);
    expect(notification.linkLabel).toBe('@bob/unsafe path/?x=<tag>');
    expect(notification.txUrl).toBe('https://hivehub.dev/tx/abc%2F123');
  });

  it('keeps reblog notifications linkable without relying on translated HTML', async () => {
    jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
      {
        id: '2',
        created: '2024-01-01T00:00:00',
        read_at: '2024-01-01T00:00:00',
        payload: JSON.stringify({
          json: [
            'reblog',
            {
              account: 'alice',
              author: 'bob',
              permlink: 'post with spaces',
              delete: false,
            },
          ],
        }),
        operation: 'custom_json',
        operation_type: 'custom_json.reblog',
        sender: 'alice',
        account: 'bob',
        trigger: '',
        trx_id: undefined,
      },
    ]);

    const [notification] = await PeakDNotificationsUtils.getNotifications(
      'quentin',
      dynamic.globalProperties,
    );

    expect(notification.linkUrl).toBe('https://peakd.com/@bob/post%20with%20spaces');
    expect(notification.linkLabel).toBe('bob/post with spaces');
    expect(notification.externalUrl).toBeUndefined();
  });
});

import { PeakDNotificationsApi } from '@api/peakd-notifications';
import { KeyType } from '@interfaces/keys.interface';
import type { ActiveAccount } from '@interfaces/active-account.interface';
import type { LocalAccount } from '@interfaces/local-account.interface';
import { CustomJsonUtils } from '@popup/hive/utils/custom-json.utils';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import { PeakDNotificationsUtils } from 'src/popup/hive/utils/notifications/peakd-notifications.utils';

describe('PeakDNotificationsUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const gp = dynamic.globalProperties;

  const baseRaw = (overrides: Record<string, unknown> = {}) => ({
    id: '1',
    created: '2024-01-01T00:00:00',
    read_at: '2024-01-01T00:00:00',
    payload: '{}',
    operation: 'transfer',
    operation_type: 'transfer',
    sender: 'alice',
    account: 'bob',
    trigger: '',
    trx_id: 'txplain',
    ...overrides,
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

  it('maps notification config into editable form rows', () => {
    const form = PeakDNotificationsUtils.initializeForm([
      {
        operation: 'transfer',
        conditions: {
          to: { '==': 'recipient' },
          amount: { '>': '0' },
        },
      },
    ]);

    expect(form).toHaveLength(1);
    expect(form[0].operation).toBe('transfer');
    expect(form[0].conditions).toEqual([
      { field: 'to', operand: '==', value: 'recipient' },
      { field: 'amount', operand: '>', value: '0' },
    ]);
  });

  it('getSuggestedConfig targets the username for transfers and mentions', () => {
    const form = PeakDNotificationsUtils.getSuggestedConfig('myuser');
    expect(form[0]).toMatchObject({
      operation: 'transfer',
      conditions: [{ field: 'to', operand: '==', value: 'myuser' }],
    });
    expect(form[1]).toMatchObject({
      operation: 'comment',
      conditions: [
        { field: 'body', operand: 'regex', value: '@myuser' },
      ],
    });
    expect(PeakDNotificationsUtils.operationFieldList.some((o) => o.name === 'transfer')).toBe(
      true,
    );
    expect(PeakDNotificationsUtils.operandList).toContain('contains');
    expect(PeakDNotificationsUtils.prefixMap.core).toBe('');
  });

  it('exposes default subscription and condition label maps', () => {
    expect(PeakDNotificationsUtils.defaultActiveSubs).toContain('transfer');
    expect(PeakDNotificationsUtils.conditionNames['==']).toContain('equals');
    expect(PeakDNotificationsUtils.prefixMap.splinterlands).toBe('sm_');
  });

  it('getAccountConfig loads user config from PeakD API', async () => {
    jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValue({ ok: true });

    await expect(PeakDNotificationsUtils.getAccountConfig('alice')).resolves.toEqual({
      ok: true,
    });
    expect(PeakDNotificationsApi.get).toHaveBeenCalledWith('users/alice');
  });

  describe('initializeForm / saveConfiguration', () => {
    it('initializes rows without conditions when omitted', () => {
      const form = PeakDNotificationsUtils.initializeForm([{ operation: 'vote' }]);
      expect(form).toEqual([{ operation: 'vote', conditions: [] }]);
    });

    it('persists formatted config via CustomJson', async () => {
      const send = jest.spyOn(CustomJsonUtils, 'send').mockResolvedValue({} as never);
      const account = {
        name: 'alice',
        keys: { posting: 'postingKey' },
      } as LocalAccount;

      await PeakDNotificationsUtils.saveConfiguration(
        [
          {
            operation: 'transfer',
            conditions: [
              { field: 'to', operand: '==', value: 'bob' },
              { field: '', operand: '', value: 'ignored' },
            ],
          },
        ],
        account,
      );

      expect(send).toHaveBeenCalledWith(
        [
          'update_account',
          {
            config: [
              {
                operation: 'transfer',
                conditions: { to: { '==': 'bob' } },
              },
            ],
          },
        ],
        'alice',
        'postingKey',
        KeyType.POSTING,
        'notify',
      );
    });
  });

  describe('markAllAsRead / deleteAccountConfig / saveDefaultConfig', () => {
    it('markAllAsRead sends setLastRead', async () => {
      const send = jest.spyOn(CustomJsonUtils, 'send').mockResolvedValue({} as never);
      const active = {
        name: 'alice',
        keys: { posting: 'pk' },
      } as ActiveAccount;

      await PeakDNotificationsUtils.markAllAsRead(active);

      expect(send).toHaveBeenCalledWith(
        ['setLastRead', { date: expect.any(Date) }],
        'alice',
        'pk',
        KeyType.POSTING,
        'notify',
      );
    });

    it('deleteAccountConfig sends delete_account', async () => {
      const send = jest.spyOn(CustomJsonUtils, 'send').mockResolvedValue({} as never);
      const active = { name: 'bob', keys: { posting: 'pk' } } as ActiveAccount;

      await PeakDNotificationsUtils.deleteAccountConfig(active);

      expect(send).toHaveBeenCalledWith(
        ['delete_account', {}],
        'bob',
        'pk',
        KeyType.POSTING,
        'notify',
      );
    });

    it('saveDefaultConfig pushes suggested rules through update_account', async () => {
      const send = jest.spyOn(CustomJsonUtils, 'send').mockResolvedValue({} as never);
      const active = { name: 'carol', keys: { posting: 'pk' } } as ActiveAccount;

      await PeakDNotificationsUtils.saveDefaultConfig(active);

      expect(send).toHaveBeenCalledWith(
        [
          'update_account',
          {
            config: expect.arrayContaining([
              expect.objectContaining({
                operation: 'transfer',
                conditions: { to: { '==': 'carol' } },
              }),
            ]),
          },
        ],
        'carol',
        'pk',
        KeyType.POSTING,
        'notify',
      );
    });
  });

  describe('getNotifications pagination', () => {
    it('fetches the next page while the last batch is entirely unread', async () => {
      const unread = {
        ...baseRaw({ id: 'u1', read_at: null }),
        payload: JSON.stringify({ from: 'a', to: 'b', amount: '1.000 HIVE' }),
      };
      const get = jest.spyOn(PeakDNotificationsApi, 'get').mockImplementation((url: string) => {
        if (url.includes('offset=0')) {
          return Promise.resolve([unread]);
        }
        if (url.includes('offset=100')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(get).toHaveBeenCalledTimes(2);
      expect(get.mock.calls[0][0]).toContain('offset=0');
      expect(get.mock.calls[1][0]).toContain('offset=100');
    });

    it('stops after one page when some notifications are already read', async () => {
      const get = jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValue([
        {
          ...baseRaw(),
          read_at: '2024-01-02T00:00:00',
          payload: JSON.stringify({ from: 'a', to: 'b', amount: '1.000 HIVE' }),
        },
      ]);

      await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(get).toHaveBeenCalledTimes(1);
    });

    it('starts at offset matching prior list length', async () => {
      const prior = [{ id: 'old' }] as any[];
      const get = jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValue([]);

      await PeakDNotificationsUtils.getNotifications('quentin', gp, prior);

      expect(get).toHaveBeenCalledWith(
        expect.stringContaining('notifications/quentin?limit=100&offset=1'),
      );
    });
  });

  describe('getNotifications message mapping', () => {
    it('maps follow vs unfollow from custom_json.follow', async () => {
      const followPayload = {
        json: ['follow', { follower: 'a', following: 'b', what: ['blog'] }],
      };
      const unfollowPayload = {
        json: ['follow', { follower: 'a', following: 'b', what: [] }],
      };

      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation: 'custom_json',
            operation_type: 'custom_json.follow',
            payload: JSON.stringify(followPayload),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation: 'custom_json',
            operation_type: 'custom_json.follow',
            payload: JSON.stringify(unfollowPayload),
          }),
        },
      ]);

      const [n1, n2] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(n1.message).toBe('notification_follow');
      expect(n1.messageParams).toEqual(['a', 'b']);
      expect(n2.message).toBe('notification_unfollow');
    });

    it('maps transfer in vs out for the viewing account', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            payload: JSON.stringify({
              from: 'alice',
              to: 'quentin',
              amount: '10.000 HIVE',
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            payload: JSON.stringify({
              from: 'quentin',
              to: 'bob',
              amount: '1.000 HIVE',
            }),
          }),
        },
      ]);

      const [incoming, outgoing] = await PeakDNotificationsUtils.getNotifications(
        'quentin',
        gp,
      );

      expect(incoming.message).toBe('popup_html_wallet_info_transfer_in');
      expect(incoming.messageParams[1]).toBe('alice');
      expect(outgoing.message).toBe('popup_html_wallet_info_transfer_out');
      expect(outgoing.messageParams[1]).toBe('bob');
    });

    it('normalizes NAI amount objects for transfers', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            payload: JSON.stringify({
              from: 'a',
              to: 'quentin',
              amount: { amount: '5000', precision: 3, nai: '@@000000021' },
            }),
          }),
        },
      ]);

      const [n] = await PeakDNotificationsUtils.getNotifications('quentin', gp);
      expect(n.message).toBe('popup_html_wallet_info_transfer_in');
      expect(n.messageParams[0]).toMatch(/\d/);
    });

    it('maps comment reply vs mention from trigger', async () => {
      const body = { parent_author: '', parent_permlink: '', author: 'bob', permlink: 'p', title: '', body: 'hi', json_metadata: '' };
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation: 'comment',
            operation_type: 'comment',
            sender: 'alice',
            account: 'bob',
            trigger: `"parent_author":{"==":"quentin"}`,
            payload: JSON.stringify(body),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation: 'comment',
            operation_type: 'comment',
            sender: 'alice',
            account: 'bob',
            trigger: '',
            payload: JSON.stringify(body),
          }),
        },
      ]);

      const [reply, mention] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(reply.message).toBe('notification_answer');
      expect(mention.message).toBe('notification_mention');
    });

    it('omits tx URL when trx_id is missing or virtual', async () => {
      const votePayload = JSON.stringify({
        voter: 'v',
        author: 'a',
        permlink: 'p',
        weight: 100,
      });
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            trx_id: undefined,
            operation: 'vote',
            operation_type: 'vote',
          }),
          payload: votePayload,
        },
        {
          ...baseRaw({
            id: '2',
            trx_id: 'v123',
            operation: 'vote',
            operation_type: 'vote',
          }),
          payload: votePayload,
        },
      ]);

      const [a, b] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(a.txUrl).toBeUndefined();
      expect(b.txUrl).toBeUndefined();
    });

    it('marks isTypeLast on the final notification in a short list', async () => {
      const votePayload = JSON.stringify({
        voter: 'v',
        author: 'a',
        permlink: 'p',
        weight: 100,
      });
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({ id: '1', operation: 'vote', operation_type: 'vote' }),
          payload: votePayload,
        },
        {
          ...baseRaw({ id: '2', operation: 'vote', operation_type: 'vote' }),
          payload: votePayload,
        },
      ]);

      const list = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(list[0].isTypeLast).toBe(false);
      expect(list[1].isTypeLast).toBe(true);
    });

    it('maps delegation vs cancel delegation by vesting amount', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation_type: 'delegate_vesting_shares',
            payload: JSON.stringify({
              delegator: 'a',
              delegatee: 'b',
              vesting_shares: '100.000000 VESTS',
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation_type: 'delegate_vesting_shares',
            payload: JSON.stringify({
              delegator: 'a',
              delegatee: 'b',
              vesting_shares: '0.000000 VESTS',
            }),
          }),
        },
      ]);

      const [del, cancel] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(del.message).toBe('notification_delegation');
      expect(cancel.message).toBe('notification_cancel_delegation');
    });

    it('maps fill_transfer_from_savings for self vs other recipient', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation_type: 'fill_transfer_from_savings',
            payload: JSON.stringify({
              from: 'alice',
              to: 'alice',
              amount: '1.000 HBD',
              memo: '',
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation_type: 'fill_transfer_from_savings',
            payload: JSON.stringify({
              from: 'alice',
              to: 'bob',
              amount: '2.000 HBD',
              memo: '',
            }),
          }),
        },
      ]);

      const [self, other] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(self.message).toBe('notification_fill_transfer_from_savings');
      expect(other.message).toBe('notification_fill_transfer_from_savings_from_other_account');
    });

    it('maps fill_vesting_withdraw by whether user is from_account', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation_type: 'fill_vesting_withdraw',
            payload: JSON.stringify({
              from_account: 'quentin',
              to_account: 'bob',
              withdrawn: '10.000000 VESTS',
              deposited: '0 VESTS',
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation_type: 'fill_vesting_withdraw',
            payload: JSON.stringify({
              from_account: 'alice',
              to_account: 'quentin',
              withdrawn: '5.000000 VESTS',
              deposited: '0 VESTS',
            }),
          }),
        },
      ]);

      const [asFrom, asTo] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(asFrom.message).toBe('notification_fill_power_down');
      expect(asTo.message).toBe('notification_fill_power_down_other_account');
    });

    it('maps power up to self vs other account', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation_type: 'transfer_to_vesting',
            payload: JSON.stringify({
              from: 'alice',
              to: 'quentin',
              amount: '10.000 HIVE',
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation_type: 'transfer_to_vesting',
            payload: JSON.stringify({
              from: 'quentin',
              to: 'bob',
              amount: '1.000 HIVE',
            }),
          }),
        },
      ]);

      const [self, other] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(self.message).toBe('popup_html_wallet_info_power_up');
      expect(other.message).toBe('popup_html_wallet_info_power_up_other_account');
    });

    it('maps fill_recurrent_transfer in vs out', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation_type: 'fill_recurrent_transfer',
            payload: JSON.stringify({
              from: 'a',
              to: 'quentin',
              amount: '1.000 HBD',
              memo: '',
              remaining_executions: 3,
            }),
          }),
        },
        {
          ...baseRaw({
            id: '2',
            operation_type: 'fill_recurrent_transfer',
            payload: JSON.stringify({
              from: 'quentin',
              to: 'b',
              amount: '1.000 HBD',
              memo: '',
              remaining_executions: 2,
            }),
          }),
        },
      ]);

      const [inn, out] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(inn.message).toBe('popup_html_wallet_info_fill_recurrent_transfer_in');
      expect(out.message).toBe('popup_html_wallet_info_fill_recurrent_transfer_out');
    });

    it('defaults message when operation_type is unknown', async () => {
      jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
        {
          ...baseRaw({
            operation: 'feed_publish',
            operation_type: 'feed_publish',
            payload: JSON.stringify({ publisher: 'p', exchange_rate: {} }),
          }),
        },
      ]);

      const [n] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

      expect(n.message).toBe('notification_feed_publish');
    });

    it.each([
      [
        'account_update',
        'account_update',
        { account: 'alice', owner: {}, active: {}, posting: {}, memo_key: '', json_metadata: '' },
        'notification_account_update',
        ['alice'],
      ],
      [
        'account_update2',
        'account_update2',
        { account: 'alice', owner: {}, active: {}, posting: {}, memo_key: '', json_metadata: '', posting_json_metadata: '', extensions: [] },
        'notification_account_update',
        ['alice'],
      ],
      [
        'account_witness_proxy',
        'account_witness_proxy',
        { account: 'alice', proxy: 'wit' },
        'notification_account_witness_proxy',
        ['alice', 'wit'],
      ],
      [
        'account_witness_vote',
        'account_witness_vote',
        { account: 'alice', witness: 'wit', approve: true },
        'notification_account_witness_vote',
        ['alice', 'wit'],
      ],
      [
        'account_witness_unvote',
        'account_witness_vote',
        { account: 'alice', witness: 'wit', approve: false },
        'notification_account_witness_unvote',
        ['alice', 'wit'],
      ],
      [
        'change_recovery_account',
        'change_recovery_account',
        { account_to_recover: 'a', new_recovery_account: 'b', extensions: [] },
        'notification_change_recovery_account',
        ['a', 'b'],
      ],
      ['claim_account', 'claim_account', { creator: 'c', fee: '0 HIVE', extensions: [] }, 'popup_html_wallet_info_claim_account', []],
      [
        'recover_account',
        'recover_account',
        {
          account_to_recover: 'a',
          new_owner_authority: {},
          recent_owner_authority: {},
          recovery_account: 'rec',
          extensions: [],
        },
        'notification_requested_account_recovery',
        ['a', 'rec'],
      ],
      [
        'request_account_recovery',
        'request_account_recovery',
        { recovery_account: 'r', account_to_recover: 'a', new_owner_authority: {}, extensions: [] },
        'notification_recovered_account',
        ['a'],
      ],
      [
        'set_withdraw_vesting_route',
        'set_withdraw_vesting_route',
        { from_account: 'a', to_account: 'b', percent: 100, auto_vest: false },
        'notification_set_power_down_route',
        ['a', 'b'],
      ],
      [
        'transfer_from_savings',
        'transfer_from_savings',
        { from: 'a', to: 'b', amount: '1.000 HBD', memo: '', request_id: 1 },
        'popup_html_wallet_info_withdraw_savings',
        [expect.stringMatching(/\d/)],
      ],
      [
        'transfer_to_savings',
        'transfer_to_savings',
        { from: 'a', to: 'b', amount: '1.000 HBD', memo: '', request_id: 0 },
        'popup_html_wallet_info_deposit_savings',
        [expect.stringMatching(/\d/)],
      ],
      [
        'withdraw_vesting',
        'withdraw_vesting',
        { account: 'alice', vesting_shares: '10.000000 VESTS' },
        'bgd_ops_pd',
        [expect.any(String), 'alice'],
      ],
      [
        'recurrent_transfer',
        'recurrent_transfer',
        {
          from: 'a',
          to: 'b',
          amount: '1.000 HBD',
          memo: '',
          executions: 10,
          recurrence: 24,
          extensions: [],
        },
        'notification_recurrent_transfer',
        ['a', expect.stringMatching(/\d/), 'b', 10, 24],
      ],
      [
        'fill_convert_request',
        'fill_convert_request',
        { owner: 'o', amount_in: '1.000 HIVE', amount_out: '0.500 HBD' },
        'notification_fill_convert',
        ['o', expect.stringMatching(/\d/), expect.stringMatching(/\d/)],
      ],
      [
        'author_reward',
        'author_reward',
        {
          author: 'a',
          permlink: 'p',
          hbd_payout: '1.000 HBD',
          hive_payout: '0 HIVE',
          vesting_payout: '1.000000 VESTS',
          curators_vesting_payout: '0 VESTS',
        },
        'notification_author_reward',
        ['a', expect.stringMatching(/\d/), expect.stringMatching(/\d/), expect.any(String), 'p'],
      ],
      [
        'curation_reward',
        'curation_reward',
        {
          curator: 'c',
          reward: '1.000000 VESTS',
          comment_author: 'auth',
          comment_permlink: 'cp',
        },
        'notification_curation_reward',
        ['c', expect.any(String), 'auth', 'cp'],
      ],
      [
        'comment_reward',
        'comment_reward',
        {
          author: 'a',
          permlink: 'p',
          payout: '1.000 HBD',
          author_rewards: '0 HBD',
          total_payout_value: '1 HBD',
          curator_payout_value: '0 HBD',
          beneficiary_payout_value: '0 HBD',
        },
        'notification_comment_reward',
        ['a', expect.stringMatching(/\d/), 'p'],
      ],
      [
        'interest',
        'interest',
        { owner: 'o', interest: '0.100 HBD' },
        'notification_hbd_interest',
        ['o', expect.stringMatching(/\d/)],
      ],
      [
        'fill_order',
        'fill_order',
        {
          current_owner: 'a',
          current_orderid: 1,
          current_pays: '1 HIVE',
          open_owner: 'b',
          open_orderid: 2,
          open_pays: '2 HBD',
        },
        'notification_fill_order',
        ['a', 'b', expect.stringMatching(/\d/), expect.stringMatching(/\d/)],
      ],
      [
        'return_vesting_delegation',
        'return_vesting_delegation',
        { account: 'acc', vesting_shares: '5.000000 VESTS' },
        'notification_returned_vesting_delegation',
        ['acc', expect.any(String)],
      ],
      [
        'comment_benefactor_reward',
        'comment_benefactor_reward',
        {
          benefactor: 'ben',
          author: 'a',
          permlink: 'p',
          hbd_payout: '0 HBD',
          hive_payout: '0 HIVE',
          vesting_payout: '1.000000 VESTS',
        },
        'notification_comment_benefactor_reward',
        ['ben', expect.stringMatching(/\d/), expect.stringMatching(/\d/), expect.any(String), 'a', 'p'],
      ],
      [
        'producer_reward',
        'producer_reward',
        { producer: 'wit', vesting_shares: '2.000000 VESTS' },
        'notification_producer_reward',
        ['wit', expect.any(String)],
      ],
      [
        'changed_recovery_account',
        'changed_recovery_account',
        { account: 'a', old_recovery_account: 'old', new_recovery_account: 'new' },
        'notification_changed_recovery_account',
        ['a', 'old', 'new'],
      ],
      [
        'fill_collateralized_convert_request',
        'fill_collateralized_convert_request',
        { owner: 'o', amount_in: '1.000 HBD', amount_out: '0.500 HIVE', excess_collateral: '0 HBD' },
        'notification_fill_collateralized_convert_request',
        ['o', expect.stringMatching(/\d/), expect.stringMatching(/\d/)],
      ],
      [
        'failed_recurrent_transfer',
        'failed_recurrent_transfer',
        {
          from: 'a',
          to: 'b',
          amount: '1.000 HBD',
          memo: '',
          consecutive_failures: 2,
          remaining_executions: 1,
          deleted: false,
        },
        'notification_failed_recurrent_transfer',
        [expect.stringMatching(/\d/), 'a', 'b'],
      ],
    ] as const)(
      'maps %s operation_type',
      async (_label, operationType, payload, expectedMessage, expectedParams) => {
        jest.spyOn(PeakDNotificationsApi, 'get').mockResolvedValueOnce([
          {
            ...baseRaw({
              operation: operationType,
              operation_type: operationType,
              payload: JSON.stringify(payload),
            }),
          },
        ]);

        const [n] = await PeakDNotificationsUtils.getNotifications('quentin', gp);

        expect(n.message).toBe(expectedMessage);
        expect(n.messageParams).toEqual(expectedParams);
      },
    );
  });
});

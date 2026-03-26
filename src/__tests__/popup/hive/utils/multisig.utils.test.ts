import type { ExtendedAccount, Transaction } from '@hiveio/dhive';
import { KeychainKeyTypes } from 'hive-keychain-commons';
import AccountUtils from '@popup/hive/utils/account.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import type { MultisigAccountConfig } from '@interfaces/multisig.interface';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import { KeysUtils } from '@hiveapp/utils/keys.utils';

describe('multisig.utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveMultisigConfig / getMultisigAccountConfig', () => {
    const sampleConfig: MultisigAccountConfig = {
      isEnabled: true,
      active: { isEnabled: true, publicKey: 'STMa', message: 'm1' },
      posting: { isEnabled: false, publicKey: 'STMp', message: 'm2' },
    };

    it('merges account config into stored MULTISIG_CONFIG', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
        other: sampleConfig,
      });
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await MultisigUtils.saveMultisigConfig('alice', sampleConfig);

      expect(save).toHaveBeenCalledWith(LocalStorageKeyEnum.MULTISIG_CONFIG, {
        other: sampleConfig,
        alice: sampleConfig,
      });
    });

    it('returns stored config for an account', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
        alice: sampleConfig,
      });

      await expect(
        MultisigUtils.getMultisigAccountConfig('alice'),
      ).resolves.toEqual(sampleConfig);
    });

    it('returns null when multisig storage is empty', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(null);
      await expect(MultisigUtils.getMultisigAccountConfig('ghost')).resolves.toBeNull();
    });

    it('initializes storage when no multisig config exists yet', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(null);
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await MultisigUtils.saveMultisigConfig('first', sampleConfig);

      expect(save).toHaveBeenCalledWith(LocalStorageKeyEnum.MULTISIG_CONFIG, {
        first: sampleConfig,
      });
    });
  });

  describe('get2FAAccounts', () => {
    it('returns co-signer accounts whose json_metadata marks isMultisigBot', async () => {
      jest.spyOn(AccountUtils, 'getExtendedAccounts').mockResolvedValue([
        {
          name: 'bot1',
          json_metadata: JSON.stringify({ isMultisigBot: true }),
        },
        {
          name: 'plain',
          json_metadata: JSON.stringify({ isMultisigBot: false }),
        },
        {
          name: 'badjson',
          json_metadata: '{',
        },
      ] as ExtendedAccount[]);

      const account = {
        active: {
          account_auths: [
            ['bot1', 1],
            ['plain', 1],
            ['badjson', 1],
          ],
          key_auths: [],
        },
        posting: { account_auths: [], key_auths: [] },
      } as ExtendedAccount;

      await expect(
        MultisigUtils.get2FAAccounts(account, KeychainKeyTypes.active),
      ).resolves.toEqual(['bot1']);
    });

    it('uses posting authority when method is posting', async () => {
      jest.spyOn(AccountUtils, 'getExtendedAccounts').mockResolvedValue([
        {
          name: 'botp',
          json_metadata: JSON.stringify({ isMultisigBot: true }),
        },
      ] as ExtendedAccount[]);

      const account = {
        active: { account_auths: [], key_auths: [] },
        posting: {
          account_auths: [['botp', 1]],
          key_auths: [],
        },
      } as ExtendedAccount;

      await expect(
        MultisigUtils.get2FAAccounts(account, KeychainKeyTypes.posting),
      ).resolves.toEqual(['botp']);
    });

    it('returns empty list when method is not active or posting (e.g. memo)', async () => {
      const account = {
        active: { account_auths: [['bot1', 1]], key_auths: [] },
        posting: { account_auths: [], key_auths: [] },
      } as ExtendedAccount;

      await expect(
        MultisigUtils.get2FAAccounts(account, KeychainKeyTypes.memo),
      ).resolves.toEqual([]);
    });
  });

  describe('encodeTransaction / decodeTransaction / encodeMetadata', () => {
    it('round-trips a transaction through memo encode/decode', async () => {
      const payload = { ref_block_num: 1, ref_block_prefix: 2 };
      const fromPriv = userData.one.nonEncryptKeys.memo;
      const toPub = userData.two.keys.postingPubkey;
      const toPriv = userData.two.keys.posting;

      const encoded = await MultisigUtils.encodeTransaction(payload, fromPriv, toPub);
      expect(typeof encoded).toBe('string');

      const decoded = await MultisigUtils.decodeTransaction(encoded, toPriv);
      expect(decoded).toEqual(payload);
    });

    it('encodeMetadata encodes the same JSON shape as encodeTransaction (nonce differs)', async () => {
      const fromPriv = userData.one.nonEncryptKeys.memo;
      const toPub = userData.two.keys.postingPubkey;
      const toPriv = userData.two.keys.posting;
      const meta = { version: 1, bot: 'x' };

      const encTx = await MultisigUtils.encodeTransaction(meta, fromPriv, toPub);
      const encMeta = await MultisigUtils.encodeMetadata(meta, fromPriv, toPub);
      expect(encTx.startsWith('#')).toBe(true);
      expect(encMeta.startsWith('#')).toBe(true);

      const decTx = await MultisigUtils.decodeTransaction(encTx, toPriv);
      const decMeta = await MultisigUtils.decodeTransaction(encMeta, toPriv);
      expect(decTx).toEqual(decMeta);
      expect(decMeta).toEqual(meta);
    });

    it('logs when decode fails', async () => {
      const log = jest.spyOn(Logger, 'error').mockImplementation(() => {});

      await MultisigUtils.decodeTransaction(
        'not-a-valid-encoded-memo',
        userData.one.nonEncryptKeys.memo,
      );

      expect(log).toHaveBeenCalledWith(
        'Error while decoding the transaction',
        expect.anything(),
      );
    });
  });

  describe('getTwoFaBotUserConfig', () => {
    it('resolves JSON when fetch returns 200', async () => {
      const payload = { bot: true };
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        json: async () => payload,
      });

      await expect(
        MultisigUtils.getTwoFaBotUserConfig(
          'https://example.com/bots/:username.json',
          'alice',
        ),
      ).resolves.toEqual(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/bots/alice.json',
        expect.objectContaining({ method: 'GET' }),
      );
    });

    it('resolves undefined when response is not 200', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 404,
        json: async () => ({}),
      });

      await expect(
        MultisigUtils.getTwoFaBotUserConfig('https://x/:username', 'u'),
      ).resolves.toBeUndefined();
    });

    it('rejects when fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network'));

      await expect(
        MultisigUtils.getTwoFaBotUserConfig('https://x/:username', 'u'),
      ).rejects.toThrow('network');
    });
  });

  describe('getPotentialSigners', () => {
    it('excludes the caller public key from receiver list', async () => {
      const priv = userData.one.nonEncryptKeys.active;
      const selfPub = KeysUtils.getPublicKeyFromPrivateKeyString(priv)!;

      jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({
        name: 'peer',
        active: {
          key_auths: [
            [selfPub, 1],
            ['STM1111111111111111111111111111111114T1Anm', 1],
          ],
        },
        posting: { key_auths: [] },
      } as ExtendedAccount);

      const account = {
        name: 'alice',
        active: {
          weight_threshold: 10,
          account_auths: [['peer', 1]],
          key_auths: [[selfPub, 1]],
        },
        posting: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [],
        },
      } as ExtendedAccount;

      const receivers = await MultisigUtils.getPotentialSigners(
        account,
        priv,
        KeychainKeyTypes.active,
      );

      expect(receivers.map((r) => r[0])).toContain('STM1111111111111111111111111111111114T1Anm');
      expect(receivers.map((r) => r[0])).not.toContain(selfPub);
    });

    it('does not add account-authed peers when key type is memo (getPublicKeys default)', async () => {
      const priv = userData.one.nonEncryptKeys.posting;
      const peerPub = 'STM1111111111111111111111111111111114T1Anm';

      jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({
        name: 'peer',
        active: { key_auths: [] },
        posting: { key_auths: [[peerPub, 1]] },
      } as ExtendedAccount);

      const account = {
        name: 'alice',
        posting: {
          weight_threshold: 10,
          account_auths: [['peer', 1]],
          key_auths: [[peerPub, 1]],
        },
        active: { weight_threshold: 1, account_auths: [], key_auths: [] },
      } as ExtendedAccount;

      const receivers = await MultisigUtils.getPotentialSigners(
        account,
        priv,
        KeychainKeyTypes.memo,
      );

      expect(receivers.map((r) => r[0])).toEqual([peerPub]);
    });
  });

  describe('getUsernameFromTransaction', () => {
    it('returns undefined when operations are missing or empty', () => {
      expect(
        MultisigUtils.getUsernameFromTransaction({} as Transaction),
      ).toBeUndefined();
      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [],
        } as Transaction),
      ).toBeUndefined();
    });

    it('returns undefined when an operation entry is malformed', () => {
      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [['transfer', null]] as any,
        }),
      ).toBeUndefined();
    });

    it('resolves claim_reward_balance and vote operations to the acting account', () => {
      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'claim_reward_balance',
              { account: 'alice', reward_hive: '0', reward_hbd: '0', reward_vests: '0' },
            ],
          ],
        } as Transaction),
      ).toBe('alice');

      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'vote',
              {
                voter: 'voter1',
                author: 'a',
                permlink: 'p',
                weight: 10000,
              },
            ],
          ],
        } as Transaction),
      ).toBe('voter1');
    });

    it('returns the signer-related account for a transfer', () => {
      const tx = {
        operations: [
          [
            'transfer',
            {
              from: 'alice',
              to: 'bob',
              amount: '1.000 HIVE',
              memo: '',
            },
          ],
        ],
      } as Transaction;

      expect(MultisigUtils.getUsernameFromTransaction(tx)).toBe('alice');
    });

    it('returns undefined when operations reference different accounts', () => {
      const tx = {
        operations: [
          [
            'transfer',
            {
              from: 'alice',
              to: 'bob',
              amount: '1.000 HIVE',
              memo: '',
            },
          ],
          [
            'transfer',
            {
              from: 'bob',
              to: 'alice',
              amount: '1.000 HIVE',
              memo: '',
            },
          ],
        ],
      } as Transaction;

      expect(MultisigUtils.getUsernameFromTransaction(tx)).toBeUndefined();
    });

    it('resolves common operation types to the primary signer account', () => {
      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'custom_json',
              {
                required_posting_auths: ['alice'],
                id: 'id',
                json: '{}',
              },
            ],
          ],
        } as Transaction),
      ).toBe('alice');

      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'delegate_vesting_shares',
              { delegator: 'alice', delegatee: 'bob', vesting_shares: '1.000000 VESTS' },
            ],
          ],
        } as Transaction),
      ).toBe('alice');

      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'comment',
              {
                parent_author: '',
                parent_permlink: '',
                author: 'alice',
                permlink: 'p',
                title: '',
                body: '',
                json_metadata: '',
              },
            ],
          ],
        } as Transaction),
      ).toBe('alice');

      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'account_witness_vote',
              { account: 'alice', witness: 'wit', approve: true },
            ],
          ],
        } as Transaction),
      ).toBe('alice');

      expect(
        MultisigUtils.getUsernameFromTransaction({
          operations: [
            [
              'withdraw_vesting',
              { account: 'alice', vesting_shares: '1.000000 VESTS' },
            ],
          ],
        } as Transaction),
      ).toBe('alice');
    });

    it.each([
      ['account_create', { creator: 'alice' }, 'alice'],
      ['account_create_with_delegation', { creator: 'alice' }, 'alice'],
      ['account_update', { account: 'alice', owner: {}, active: {}, posting: {} }, 'alice'],
      ['account_update2', { account: 'alice', owner: {}, active: {}, posting: {} }, 'alice'],
      ['account_witness_proxy', { account: 'alice', proxy: '' }, 'alice'],
      ['cancel_transfer_from_savings', { from: 'alice', request_id: 1, to: 'bob', amount: '1 HBD' }, 'alice'],
      ['change_recovery_account', { account_to_recover: 'alice', new_recovery_account: 'b', extensions: [] }, 'alice'],
      ['claim_account', { creator: 'alice', extensions: [] }, 'alice'],
      ['collateralized_convert', { owner: 'alice', amount: '1 HBD' }, 'alice'],
      ['comment_options', { author: 'alice', permlink: 'p', max_accepted_payout: '0 HBD' }, 'alice'],
      ['convert', { owner: 'alice', amount: '1 HBD' }, 'alice'],
      ['create_claimed_account', { creator: 'alice', new_account_name: 'n', extensions: [] }, 'alice'],
      ['create_proposal', { creator: 'alice', receiver: 'r', start_date: '', end_date: '', daily_pay: '1 HBD', subject: 's', permlink: 'p' }, 'alice'],
      ['custom', { required_auths: ['alice'], id: 1, data: '' }, 'alice'],
      [
        'custom_binary',
        { required_owner_auths: ['alice'], id: '', data: '' },
        'alice',
      ],
      ['decline_voting_rights', { account: 'alice', decline: true }, 'alice'],
      ['delete_comment', { author: 'alice', permlink: 'p' }, 'alice'],
      ['escrow_approve', { from: 'a', to: 'b', agent: 'c', who: 'alice', escrow_id: 1 }, 'alice'],
      ['escrow_dispute', { from: 'a', to: 'b', agent: 'c', who: 'alice', escrow_id: 1 }, 'alice'],
      ['escrow_release', { from: 'a', to: 'b', agent: 'c', who: 'alice', escrow_id: 1 }, 'alice'],
      ['escrow_transfer', { from: 'alice', to: 'b', agent: 'c', escrow_id: 1, amount: '1 HBD', fee: '0 HBD' }, 'alice'],
      ['feed_publish', { publisher: 'alice', exchange_rate: { base: '1 HBD', quote: '1 HIVE' } }, 'alice'],
      ['limit_order_cancel', { owner: 'alice', orderid: 1 }, 'alice'],
      ['limit_order_create', { owner: 'alice', orderid: 1, amount_to_sell: '1 HBD', min_to_receive: '1 HIVE', fill_or_kill: false, expiration: '' }, 'alice'],
      ['limit_order_create2', { owner: 'alice', orderid: 1, amount_to_sell: '1 HBD', exchange_amount: '1 HIVE', fill_or_kill: false, expiration: '' }, 'alice'],
      ['pow', { worker_account: 'alice', block_id: '', nonce: '', work: '' }, 'alice'],
      ['recover_account', { account_to_recover: 'alice', new_owner_authority: {}, recent_owner_authority: {} }, 'alice'],
      ['report_over_production', { reporter: 'alice', first_block: '', second_block: '' }, 'alice'],
      ['request_account_recovery', { recovery_account: 'r', account_to_recover: 'alice', new_owner_authority: {}, extensions: [] }, 'alice'],
      ['reset_account', { account_to_reset: 'alice', new_owner_authority: {} }, 'alice'],
      ['set_reset_account', { account: 'alice', current_reset_account: '', reset_account: '' }, 'alice'],
      ['set_withdraw_vesting_route', { from_account: 'alice', to_account: 'b', percent: 100, auto_vest: false }, 'alice'],
      ['transfer_from_savings', { from: 'alice', to: 'b', amount: '1 HBD', memo: '', request_id: 1 }, 'alice'],
      ['transfer_to_savings', { from: 'alice', to: 'b', amount: '1 HBD', memo: '' }, 'alice'],
      ['transfer_to_vesting', { from: 'alice', to: 'b', amount: '1 HIVE' }, 'alice'],
      ['witness_set_properties', { owner: 'alice', props: [], extensions: [] }, 'alice'],
      ['witness_update', { owner: 'alice', url: '', block_signing_key: '', props: [], fee: '0 HIVE' }, 'alice'],
      ['update_proposal', { creator: 'alice', daily_pay: '1 HBD', subject: 's', permlink: 'p', extensions: [] }, 'alice'],
      ['remove_proposal', { proposal_owner: 'alice', proposal_ids: [], extensions: [] }, 'alice'],
      ['update_proposal_votes', { voter: 'alice', proposal_ids: [], extensions: [] }, 'alice'],
      ['recurrent_transfer', { from: 'alice', to: 'b', amount: '1 HBD', memo: '', recurrence: 1, executions: 1 }, 'alice'],
    ] as const)(
      'maps %s to the signer username',
      (opName, payload, expected) => {
        expect(
          MultisigUtils.getUsernameFromTransaction({
            operations: [[opName, payload]] as any,
          } as Transaction),
        ).toBe(expected);
      },
    );
  });

  describe('isMultisigCompatible', () => {
    const originalUa = navigator.userAgent;
    const originalFirefox = process.env.IS_FIREFOX;

    afterEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUa,
        configurable: true,
      });
      if (originalFirefox === undefined) {
        delete process.env.IS_FIREFOX;
      } else {
        process.env.IS_FIREFOX = originalFirefox;
      }
    });

    it('is truthy when IS_FIREFOX is set (string env value is returned as-is)', () => {
      process.env.IS_FIREFOX = 'true';
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0',
        configurable: true,
      });
      expect(MultisigUtils.isMultisigCompatible()).toBe('true');
    });

    it('returns true for Chromium major version >= 116', () => {
      delete process.env.IS_FIREFOX;
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        configurable: true,
      });
      expect(MultisigUtils.isMultisigCompatible()).toBe(true);
    });

    it('returns false for older Chrome when not Firefox', () => {
      delete process.env.IS_FIREFOX;
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/100.0.0.0 Safari/537.36',
        configurable: true,
      });
      expect(MultisigUtils.isMultisigCompatible()).toBe(false);
    });
  });
});

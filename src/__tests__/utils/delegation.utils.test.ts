import { KeychainApi } from '@api/keychain';
import { DelegationUtils } from 'src/utils/delegation.utils';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import mk from 'src/__tests__/utils-for-testing/data/mk';

describe('delegation.utils.ts tests:/n', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('getDelegators cases:\n', () => {
    it('Must return delegator list', async () => {
      KeychainApi.get = jest.fn().mockResolvedValue(delegations.delegators);
      expect(await DelegationUtils.getDelegators(mk.user.one)).toEqual(
        delegations.delegators,
      );
    });

    it('Must return delegator list removing 0 shares records', async () => {
      KeychainApi.get = jest.fn().mockResolvedValue([
        ...delegations.delegators,
        {
          delegation_date: '2017-08-09T15:30:36.000Z',
          delegator: 'quentin',
          vesting_shares: 0,
        },
      ]);
      expect(await DelegationUtils.getDelegators(mk.user.one)).toEqual(
        delegations.delegators,
      );
    });
  });

  describe('getDelegatees cases:\n', () => {
    const delegateeListFiltered = delegations.delegatees.filter(
      (delegatee) =>
        parseFloat(delegatee.vesting_shares.toString().split(' ')[0]) > 0,
    );
    it('Must return delegatees list filtering 0 vests records', async () => {
      HiveTxUtils.getData = jest.fn().mockResolvedValue(delegations.delegatees);
      expect(await DelegationUtils.getDelegatees(mk.user.one)).toEqual(
        delegateeListFiltered,
      );
    });
  });

  describe('getPendingOutgoingUndelegation cases:\n', () => {
    it('Must return adjusted list', async () => {
      HiveTxUtils.getData = jest
        .fn()
        .mockResolvedValue(delegations.pendingOutgoingUndelegationAsset);
      expect(
        await DelegationUtils.getPendingOutgoingUndelegation(mk.user.one),
      ).toEqual(delegations.pendingOutgoingUndelegationAssetExpected);
    });
  });
});

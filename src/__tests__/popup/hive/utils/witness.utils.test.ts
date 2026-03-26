import moment from 'moment';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import WitnessUtils from 'src/popup/hive/utils/witness.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('witness.utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getWitnessVoteOperation', () => {
    it('returns account_witness_vote with approve flag', () => {
      expect(WitnessUtils.getWitnessVoteOperation(true, 'voter1', 'wit')).toEqual([
        'account_witness_vote',
        { account: 'voter1', approve: true, witness: 'wit' },
      ]);
      expect(WitnessUtils.getWitnessVoteOperation(false, 'voter1', 'wit')).toEqual([
        'account_witness_vote',
        { account: 'voter1', approve: false, witness: 'wit' },
      ]);
    });
  });

  describe('getLastSigningKeyForWitness / saveLastSigningKeyForWitness', () => {
    it('returns null when no witness signing keys are stored', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(null);
      await expect(
        WitnessUtils.getLastSigningKeyForWitness('alice'),
      ).resolves.toBeNull();
    });

    it('returns stored key for username', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
        alice: 'STMabc',
      });
      await expect(
        WitnessUtils.getLastSigningKeyForWitness('alice'),
      ).resolves.toBe('STMabc');
    });

    it('merges new key into existing storage map', async () => {
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValueOnce({ bob: 'STMold' });
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await WitnessUtils.saveLastSigningKeyForWitness('alice', 'STMnew');

      expect(save).toHaveBeenCalledWith(LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY, {
        bob: 'STMold',
        alice: 'STMnew',
      });
    });

    it('creates storage map when none exists', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValueOnce(null);
      const save = jest
        .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
        .mockResolvedValue(undefined);

      await WitnessUtils.saveLastSigningKeyForWitness('carol', 'STMx');

      expect(save).toHaveBeenCalledWith(LocalStorageKeyEnum.WITNESS_LAST_SIGNING_KEY, {
        carol: 'STMx',
      });
    });
  });

  describe('wasUpdatedAfterThreshold', () => {
    it('returns true when the feed is older than the configured warning window', () => {
      const limitHours = 5;
      const stale = moment.utc().subtract(limitHours + 2, 'hours');
      expect(WitnessUtils.wasUpdatedAfterThreshold(stale)).toBe(true);
    });

    it('returns false when the feed is recent enough', () => {
      const fresh = moment.utc().subtract(1, 'hours');
      expect(WitnessUtils.wasUpdatedAfterThreshold(fresh)).toBe(false);
    });
  });
});

import { Keys } from '@interfaces/keys.interface';
import AccountUtils from '../../utils/account.utils';
//testing data
const userData = {
  username: 'workerjab1',
  encrypt_keys: {
    owner: 'STM8X56V5jtFwmchDiDfyb4YgMfjfCVrUnPVZYkuqKuWw1ZAm3jV8',
    active: 'STM85Hcqk92kE1AtueigBAtHD2kZRcqji9Gi38ZaiW8xcWcQJLof6',
    posting: 'STM7cfYmyCU6J45NjBSBUwZAV6c2ttZoNjTeaxkWSYq5HDZDWtzC3',
    memo: 'STM6mbGVeyUkC1DZUBW5wx6okDskTqGLm1VgbPCRCGyw6CPSn1VNY',
  },
  non_encrypt_keys: {
    owner: '5KCfdJFryAt2edxqcbsct9RgJKy1kdBL3Sfn5mTQ5ovxxKZfD1P',
    active: '5Jq1oDi61PWMq7DNeJWQUVZV3v85QVFMN9ro3Dnmi1DySjgU1v7',
    posting: '5JGFDQkqQMibxq1w7aJpBpEnozrjyUfaWcQqCaLbFsmKnestVEV',
    memo: '5KWEtbou93CkWUKdz5ubHFXnnAvcjiCUixXTUz1SVYLigQJFu7k',
  },
};
//end testing data

describe('Possible tests on account.utils', () => {
  test('getKeys returns null when passed an encrypted password', async () => {
    const getAccount = await AccountUtils.getKeys(
      userData.username,
      userData.encrypt_keys.active,
    );
    expect(getAccount).toBeNull();
  });

  test('getKeys must returns null if username not found in Hive DB', async () => {
    const userObject: {
      bad_username: string;
      active_password_unencrypted: string;
    } = {
      bad_username: 'workerjaasasdasdasd',
      active_password_unencrypted: userData.non_encrypt_keys.active,
    };
    const resultsGetAcc = await AccountUtils.getKeys(
      userObject.bad_username,
      userObject.active_password_unencrypted,
    );
    expect(resultsGetAcc).toBeNull();
  });

  test('getKeys return a valid object when passed username and password.active in correct formats', async () => {
    const valid_data_user = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.active,
    );
    const expected_obj: Keys = {
      active: userData.non_encrypt_keys.active,
      activePubkey: userData.encrypt_keys.active,
    };
    expect(valid_data_user).toEqual(expected_obj);
  });

  test('getKeys return a valid object when passed username and memo.active in correct format', async () => {
    const valid_data_user = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.memo,
    );
    const expected_obj: Keys = {
      memo: userData.non_encrypt_keys.memo,
      memoPubkey: userData.encrypt_keys.memo,
    };
    console.log('as memo', valid_data_user);
    expect(valid_data_user).toEqual(expected_obj);
  });

  test('getKeys return a valid object when passed username and posting.key in correct format', async () => {
    const valid_data_user_posting_key = await AccountUtils.getKeys(
      userData.username,
      userData.non_encrypt_keys.posting,
    );
    const expected_obj: Keys = {
      posting: userData.non_encrypt_keys.posting,
      postingPubkey: userData.encrypt_keys.posting,
    };
    console.log('as posting', valid_data_user_posting_key);
    expect(valid_data_user_posting_key).toEqual(expected_obj);
  });
});

describe('getPublicMemo function', () => {});

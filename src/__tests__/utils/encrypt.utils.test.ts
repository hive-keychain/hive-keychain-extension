import CryptoJS from 'crypto-js';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import EncryptUtils from 'src/popup/hive/utils/encrypt.utils';

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

describe('encrypt.utils tests:\n', () => {
  const password = mk.user.one;
  const accountPayload = {
    list: [accounts.local.justTwoKeys],
  };
  const legacyPayload =
    '0000009b000000770000005700000029000000ae0000008d000000ae00000046WHrXFxuZRaj4uDwLXR8vFw+tW0M7fUZqAfRqnqga+fvyVCNAEnutR76JDJ+Hi6zfX2bMEkzk2c/fnL2FZb9e+ZNoklar2xYnxvM3tXjkh8Qj0roAbwXfWt+DzjqMfeTvuzHzbgnCzir7r5v6NgDug0pBplvNAsk83kj5Kd3gBmJfhRieDf8VRk18bZ8DUmhGqu0U0EmFn9KqSE6HxOKo/sZFRu0In8090s/05IHro9OLCZQ3vEy6A0GPyzoc5PyL/a7qgNiERpK37e3h3LXZBG9HkmDh0HimY2GoQzBYr7sOKFrrmfZlT7rtIuXWfa0nhQSM1pI9Y1s9Y2GWkoiUlweNRuTuAwFAi+SuEHRHBtmokqkgChUUT4bNs0fGbszm3NuB3rqiCXj27kcVWw/aqglb0qJGT77cv2gqhqSKu3BJkw7KNwkjFRYow/5ScHvh6RP1hUPEpEavIiuYZEi0cMu7cmROyZYbc8XLDry8Jpc=';

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('encrypts new payloads as v2 and decrypts them', async () => {
    const encrypted = await EncryptUtils.encryptJson(accountPayload, password);
    const parsedPayload = JSON.parse(encrypted);

    expect(parsedPayload).toMatchObject({
      version: 2,
      kdf: 'PBKDF2-HMAC-SHA256',
      iterations: 600_000,
    });
    expect(parsedPayload).toHaveProperty('salt');
    expect(parsedPayload).toHaveProperty('iv');
    expect(parsedPayload).toHaveProperty('ciphertext');
    expect(parsedPayload).not.toHaveProperty('hash');
    expect(EncryptUtils.isEncryptedJsonV2(encrypted)).toBe(true);

    expect(await EncryptUtils.decryptToJson(encrypted, password)).toEqual(
      accountPayload,
    );
  });

  it('still decrypts legacy payloads', async () => {
    expect(await EncryptUtils.decryptToJson(legacyPayload, password)).toEqual(
      expect.objectContaining({
        list: expect.arrayContaining([
          expect.objectContaining({
            name: accounts.local.justTwoKeys.name,
            keys: expect.objectContaining({
              active: expect.any(String),
              activePubkey: expect.any(String),
              posting: expect.any(String),
              postingPubkey: expect.any(String),
            }),
          }),
        ]),
        hash: expect.any(String),
      }),
    );
  });

  it('migrated writes do not use the legacy crypto-js write path', async () => {
    const pbkdf2Spy = jest.spyOn(CryptoJS, 'PBKDF2');
    const aesEncryptSpy = jest.spyOn(CryptoJS.AES, 'encrypt');

    await EncryptUtils.encryptJson(accountPayload, password);

    expect(pbkdf2Spy).not.toHaveBeenCalled();
    expect(aesEncryptSpy).not.toHaveBeenCalled();
  });

  it('fails closed when a v2 payload is tampered with', async () => {
    const encrypted = await EncryptUtils.encryptJson(accountPayload, password);
    const parsedPayload = JSON.parse(encrypted);
    const ciphertextBytes = Uint8Array.from(
      atob(parsedPayload.ciphertext),
      (c) => c.charCodeAt(0),
    );
    ciphertextBytes[0] ^= 1;
    parsedPayload.ciphertext = bytesToBase64(ciphertextBytes);

    expect(
      await EncryptUtils.decryptToJson(JSON.stringify(parsedPayload), password),
    ).toBeNull();
  });

  it('fails safely on malformed payloads', async () => {
    expect(await EncryptUtils.decryptToJson('{not valid json', password)).toBe(
      null,
    );
    expect(
      await EncryptUtils.decryptToJson(
        JSON.stringify({
          version: 2,
          kdf: 'PBKDF2-HMAC-SHA256',
          iterations: 600_000,
          salt: '',
          iv: '',
          ciphertext: '',
        }),
        password,
      ),
    ).toBeNull();
  });

  it('fails safely with the wrong password', async () => {
    const encrypted = await EncryptUtils.encryptJson(accountPayload, password);

    expect(await EncryptUtils.decryptToJson(encrypted, 'wrong password')).toBe(
      null,
    );
  });

  it('decryptToJson returns null for empty input', async () => {
    expect(await EncryptUtils.decryptToJson('', password)).toBeNull();
  });

  it('decryptToJsonWithLegacySupport throws on invalid v2 envelope', async () => {
    await expect(
      EncryptUtils.decryptToJsonWithLegacySupport('{not valid json', password),
    ).rejects.toThrow('Invalid encrypted payload');
  });

  it('round-trips encryptNoIV / decryptNoIV for legacy string encryption', () => {
    const secret = 'memo text';
    const enc = EncryptUtils.encryptNoIV(secret, password);
    expect(EncryptUtils.decryptNoIV(enc, password)).toBe(secret);
  });
});

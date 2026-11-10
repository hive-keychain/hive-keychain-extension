import { EvmEncryptedMessageUtils } from 'src/utils/evm/evm-encrypted-message.utils';

const validEncryptedData = {
  version: 'x25519-xsalsa20-poly1305',
  nonce: 'nonce',
  ephemPublicKey: 'ephem-public-key',
  ciphertext: 'ciphertext',
};

const encodeJson = (value: unknown) => {
  return `0x${Buffer.from(JSON.stringify(value), 'utf8').toString('hex')}`;
};

const encodeText = (value: string) => {
  return `0x${Buffer.from(value, 'utf8').toString('hex')}`;
};

describe('EvmEncryptedMessageUtils', () => {
  it('parses valid encrypted message payloads', () => {
    expect(
      EvmEncryptedMessageUtils.parseEncryptedMessage(
        encodeJson(validEncryptedData),
      ),
    ).toEqual(validEncryptedData);
  });

  it.each([
    ['missing hex prefix', '1234'],
    ['empty hex payload', '0x'],
    ['odd-length hex payload', '0x123'],
    ['non-hex payload', '0xzz'],
    ['malformed JSON', encodeText('{invalid-json')],
    [
      'unsupported version',
      encodeJson({ ...validEncryptedData, version: 'unsupported-version' }),
    ],
    [
      'missing nonce',
      encodeJson({ ...validEncryptedData, nonce: undefined }),
    ],
    [
      'missing ephemeral public key',
      encodeJson({ ...validEncryptedData, ephemPublicKey: undefined }),
    ],
    [
      'missing ciphertext',
      encodeJson({ ...validEncryptedData, ciphertext: undefined }),
    ],
  ])('rejects %s', (_label, encryptedMessage) => {
    expect(() =>
      EvmEncryptedMessageUtils.parseEncryptedMessage(encryptedMessage),
    ).toThrow('Invalid encrypted message');
  });
});

import type { EthEncryptedData } from '@metamask/eth-sig-util';

const ENCRYPTED_MESSAGE_VERSION = 'x25519-xsalsa20-poly1305';
const INVALID_ENCRYPTED_MESSAGE_ERROR = 'Invalid encrypted message';
const HEX_REGEX = /^[0-9a-fA-F]+$/;

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const isHexEncodedEncryptedMessage = (message: unknown): message is string => {
  if (typeof message !== 'string' || !message.startsWith('0x')) {
    return false;
  }

  const hexPayload = message.substring(2);
  return (
    hexPayload.length > 0 &&
    hexPayload.length % 2 === 0 &&
    HEX_REGEX.test(hexPayload)
  );
};

const validateEncryptedData = (data: unknown): EthEncryptedData => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(INVALID_ENCRYPTED_MESSAGE_ERROR);
  }

  const encryptedData = data as Partial<EthEncryptedData>;
  if (
    encryptedData.version !== ENCRYPTED_MESSAGE_VERSION ||
    !isNonEmptyString(encryptedData.nonce) ||
    !isNonEmptyString(encryptedData.ephemPublicKey) ||
    !isNonEmptyString(encryptedData.ciphertext)
  ) {
    throw new Error(INVALID_ENCRYPTED_MESSAGE_ERROR);
  }

  return {
    version: encryptedData.version,
    nonce: encryptedData.nonce,
    ephemPublicKey: encryptedData.ephemPublicKey,
    ciphertext: encryptedData.ciphertext,
  };
};

const parseEncryptedMessage = (message: unknown): EthEncryptedData => {
  if (!isHexEncodedEncryptedMessage(message)) {
    throw new Error(INVALID_ENCRYPTED_MESSAGE_ERROR);
  }

  try {
    const encodedMessage = message.substring(2);
    const decodedMessage = Buffer.from(encodedMessage, 'hex').toString('utf8');
    return validateEncryptedData(JSON.parse(decodedMessage));
  } catch (err) {
    throw new Error(INVALID_ENCRYPTED_MESSAGE_ERROR);
  }
};

export const EvmEncryptedMessageUtils = {
  isHexEncodedEncryptedMessage,
  parseEncryptedMessage,
};

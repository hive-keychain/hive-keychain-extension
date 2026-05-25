import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { ProviderRpcError } from '@interfaces/evm-provider.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  validateEvmRequest,
  validateRequest,
} from 'src/content-scripts/evm/evm-request-validation';

const getThrownError = (callback: () => unknown): ProviderRpcError => {
  try {
    callback();
  } catch (error) {
    return error as ProviderRpcError;
  }

  throw new Error('Expected callback to throw');
};

const validTransaction = {
  from: '0x0000000000000000000000000000000000000001',
  to: '0x0000000000000000000000000000000000000002',
  data: '0x',
  type: EvmTransactionType.EIP_1559,
  value: '0x1',
  maxFeePerGas: '0x1',
  maxPriorityFeePerGas: '0x1',
} as ProviderTransactionData;

const validAddChainRequest = {
  chainId: '0x14a34',
  chainName: 'Base Sepolia',
  rpcUrls: ['https://sepolia.base.org'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

const validEncryptedData = {
  version: 'x25519-xsalsa20-poly1305',
  nonce: 'nonce',
  ephemPublicKey: 'ephem-public-key',
  ciphertext: 'ciphertext',
};

const validEvmAddress = '0x0000000000000000000000000000000000000001';

const encodeJson = (value: unknown) => {
  return `0x${Buffer.from(JSON.stringify(value), 'utf8').toString('hex')}`;
};

const encodeText = (value: string) => {
  return `0x${Buffer.from(value, 'utf8').toString('hex')}`;
};

describe('evm-request-validation tests:\n', () => {
  it('normalizes missing params to an empty array', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.GET_CHAIN,
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.GET_CHAIN,
      params: [],
    });
  });

  it('keeps method-level validation permissive for methods without custom checks', () => {
    expect(validateRequest(EvmRequestMethod.WALLET_WATCH_ASSETS, {})).toBe(
      true,
    );
  });

  it('rejects a missing request', () => {
    expect(getThrownError(() => validateEvmRequest(undefined))).toMatchObject({
      code: -32600,
      message: 'Missing request.',
    });
  });

  it('rejects a missing request_id', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          method: EvmRequestMethod.GET_CHAIN,
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32600,
      message: 'Invalid request. Missing or invalid request_id.',
    });
  });

  it('rejects an unknown method', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: 'eth_fakeMethod',
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32601,
    });
  });

  it('rejects non-array params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.GET_CHAIN,
          params: {},
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Params must be an array.',
    });
  });

  it('rejects invalid eth_sendTransaction params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.SEND_TRANSACTION,
          params: [{ ...validTransaction, to: 'not-an-address' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message:
        'Invalid parameter. Receiver address is not valid (receiver: not-an-address)',
    });
  });

  it('rejects missing wallet_switchEthereumChain params', () => {
    expect(
      getThrownError(() =>
        validateRequest(
          EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
          undefined,
        ),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Params must be an array.',
    });
  });

  it('rejects wallet_switchEthereumChain params without chainId', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
          params: [{}],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. ChainId must be a string',
    });
  });

  it('rejects decimal wallet_switchEthereumChain chainId params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
          params: [{ chainId: '1' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message:
        'Invalid parameter. 1 is not a valid chainId. It must be using hexadecimal format',
    });
  });

  it('accepts valid wallet_switchEthereumChain hex chainId params and ignores extra fields', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
        params: [
          {
            chainId: '0x14a34',
            rpcUrls: ['https://sepolia.base.org'],
            chainName: 'Base Sepolia',
          },
        ],
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.WALLET_SWITCH_ETHEREUM_CHAIN,
      params: [
        {
          chainId: '0x14a34',
          rpcUrls: ['https://sepolia.base.org'],
          chainName: 'Base Sepolia',
        },
      ],
    });
  });

  it('accepts wallet_addEthereumChain new-chain requests with HTTPS RPC URLs', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
        params: [validAddChainRequest],
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
      params: [validAddChainRequest],
    });
  });

  it('rejects wallet_addEthereumChain with HTTP RPC URLs', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [
            {
              ...validAddChainRequest,
              rpcUrls: ['http://rpc.example.com'],
            },
          ],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. RPC URLs must use HTTPS.',
    });
  });

  it('rejects wallet_addEthereumChain with HTTP block explorer URLs', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [
            {
              ...validAddChainRequest,
              blockExplorerUrls: ['http://explorer.example.com'],
            },
          ],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Block explorer URLs must use HTTPS.',
    });
  });

  it('rejects wallet_addEthereumChain with missing or empty RPC URLs', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [{ ...validAddChainRequest, rpcUrls: [] }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Missing RPC URLs.',
    });

    const requestWithoutRpcs = {
      chainId: validAddChainRequest.chainId,
      chainName: validAddChainRequest.chainName,
      nativeCurrency: validAddChainRequest.nativeCurrency,
    };
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [requestWithoutRpcs],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Missing RPC URLs.',
    });
  });

  it('rejects wallet_addEthereumChain with non-hex chainId', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [{ ...validAddChainRequest, chainId: '1' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. ChainId must be a hexadecimal string.',
    });
  });

  it('rejects wallet_addEthereumChain with zero chainId', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.WALLET_ADD_ETH_CHAIN,
          params: [{ ...validAddChainRequest, chainId: '0x0' }],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. ChainId must be a hexadecimal string.',
    });
  });

  it('accepts eth_decrypt with valid encrypted message params', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.ETH_DECRYPT,
        params: [encodeJson(validEncryptedData), validEvmAddress],
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.ETH_DECRYPT,
      params: [encodeJson(validEncryptedData), validEvmAddress],
    });
  });

  it('rejects eth_decrypt with missing params', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.ETH_DECRYPT,
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Missing decrypt parameters.',
    });
  });

  it.each([
    ['missing hex prefix', '1234'],
    ['odd-length hex payload', '0x123'],
    ['non-hex payload', '0xzz'],
    ['malformed JSON', encodeText('{invalid-json')],
    [
      'unsupported version',
      encodeJson({ ...validEncryptedData, version: 'unsupported-version' }),
    ],
    [
      'missing ciphertext',
      encodeJson({ ...validEncryptedData, ciphertext: undefined }),
    ],
  ])('rejects eth_decrypt with %s', (_label, encryptedMessage) => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.ETH_DECRYPT,
          params: [encryptedMessage, validEvmAddress],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Encrypted message is invalid.',
    });
  });

  it('rejects eth_decrypt with invalid account address', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.ETH_DECRYPT,
          params: [encodeJson(validEncryptedData), 'not-an-address'],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Account address is not valid.',
    });
  });

  it('accepts eth_getEncryptionPublicKey with a valid account address', () => {
    expect(
      validateEvmRequest({
        request_id: 1,
        method: EvmRequestMethod.GET_ENCRYPTION_KEY,
        params: [validEvmAddress],
      }),
    ).toEqual({
      request_id: 1,
      method: EvmRequestMethod.GET_ENCRYPTION_KEY,
      params: [validEvmAddress],
    });
  });

  it('rejects eth_getEncryptionPublicKey with missing account address', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.GET_ENCRYPTION_KEY,
          params: [],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Missing account address.',
    });
  });

  it('rejects eth_getEncryptionPublicKey with invalid account address', () => {
    expect(
      getThrownError(() =>
        validateEvmRequest({
          request_id: 1,
          method: EvmRequestMethod.GET_ENCRYPTION_KEY,
          params: ['not-an-address'],
        }),
      ),
    ).toMatchObject({
      code: -32602,
      message: 'Invalid parameter. Account address is not valid.',
    });
  });
});

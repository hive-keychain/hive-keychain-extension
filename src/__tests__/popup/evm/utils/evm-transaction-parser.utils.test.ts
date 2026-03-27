import { KeychainApi } from '@api/keychain';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';

describe('evm-transaction-parser.utils proxy tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('normalizes a raw proxy string from verification data', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      contract: { proxy: '0x00000000000000000000000000000000000000bb' },
      domain: {},
      to: {},
    });

    const result = await EvmTransactionParserUtils.verifyTransactionInformation(
      'app.example',
      '0x00000000000000000000000000000000000000aa',
      '0x00000000000000000000000000000000000000cc',
    );

    expect(result.contract.proxy).toEqual({
      target: '0x00000000000000000000000000000000000000bb',
    });
  });

  it('injects backend proxy target into normalized verification data', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      contract: {},
      domain: {},
      to: {},
    });

    const result = await EvmTransactionParserUtils.verifyTransactionInformation(
      'app.example',
      '0x00000000000000000000000000000000000000aa',
      '0x00000000000000000000000000000000000000cc',
      '0x00000000000000000000000000000000000000dd',
    );

    expect(result.contract.proxy).toEqual({
      target: '0x00000000000000000000000000000000000000dd',
    });
  });

  it('surfaces proxy information in smart contract info helper', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);

    const warningAndInfo =
      await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
        '0x00000000000000000000000000000000000000aa',
        '1',
        {
          contract: {
            hasBeenUsedBefore: false,
            isBlacklisted: false,
            proxy: {
              target: '0x00000000000000000000000000000000000000bb',
            },
            verifiedBy: [],
          },
          domain: {
            fuzzy: undefined,
            isBlacklisted: false,
            isTrusted: false,
            isWhitelisted: false,
          },
          to: {
            isBlacklisted: false,
            isWhitelisted: false,
          },
        },
        [],
      );

    expect(warningAndInfo.information).toEqual([
      {
        message: 'evm_transaction_contract_use_proxy',
        messageParams: ['0x00000000000000000000000000000000000000bb'],
      },
    ]);
  });
});

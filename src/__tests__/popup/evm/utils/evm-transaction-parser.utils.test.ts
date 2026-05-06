import { KeychainApi } from '@api/keychain';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { getAbiFromType } from '@popup/evm/reference-data/abi.data';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';

describe('shouldDisplayBalanceChange', () => {
  const erc20Abi = getAbiFromType(EVMSmartContractType.ERC20)!;

  it('returns false for ERC20 approve (allowance only, no balance change)', () => {
    expect(
      EvmTransactionParserUtils.shouldDisplayBalanceChange(
        erc20Abi,
        'approve',
      ),
    ).toBe(false);
  });

  it('returns true for ERC20 transfer', () => {
    expect(
      EvmTransactionParserUtils.shouldDisplayBalanceChange(
        erc20Abi,
        'transfer',
      ),
    ).toBe(true);
  });
});

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

  it('prefills contract whitelist labels with the contract name when available', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(false);

    const warningAndInfo =
      await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
        '0x00000000000000000000000000000000000000aa',
        '1',
        {
          contract: {
            hasBeenUsedBefore: false,
            isBlacklisted: false,
            proxy: {},
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
        {
          type: EVMSmartContractType.ERC20,
          name: 'Example Token',
          symbol: 'EXT',
          logo: '',
          chainId: '1',
          backgroundColor: '',
          priceUsd: null,
          contractAddress: '0x00000000000000000000000000000000000000aa',
          possibleSpam: true,
          verifiedContract: false,
          isProxy: false,
          proxyTarget: null,
          decimals: 18,
          validated: 1,
        },
      );

    expect(warningAndInfo.warnings?.[0].extraData.defaultLabel).toBe(
      'Example Token',
    );
    expect(warningAndInfo.warnings?.[0].extraData.resolveAllLabel).toBe(
      'Example Token',
    );
  });

  it('saves wallet whitelist warnings with chain id before address', async () => {
    const chainId = '1';
    const address = '0x00000000000000000000000000000000000000aa';
    const saveWalletAddress = jest
      .spyOn(EvmAddressesUtils, 'saveWalletAddress')
      .mockResolvedValue();

    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(false);
    jest
      .spyOn(EvmAddressesUtils, 'getEnsDataFromAddress')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EvmAddressesUtils, 'isPotentialSpoofing')
      .mockResolvedValue(undefined);
    jest.spyOn(EvmRequestsUtils, 'getEnsForAddress').mockResolvedValue('');

    const warnings = await EvmTransactionParserUtils.getAddressWarning(
      address,
      chainId,
      {
        contract: {
          hasBeenUsedBefore: false,
          isBlacklisted: false,
          proxy: {},
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

    await warnings[0].onConfirm?.('Saved wallet');

    expect(saveWalletAddress).toHaveBeenCalledWith(
      chainId,
      address,
      'Saved wallet',
    );
  });
});

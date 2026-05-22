import { KeychainApi } from '@api/keychain';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { getAbiFromType } from '@popup/evm/reference-data/abi.data';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmVerificationUtils } from '@popup/evm/utils/evm-verification.utils';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmRequestsUtils } from '@popup/evm/utils/evm-requests.utils';
import { ethers } from 'ethers';

jest.mock('@popup/evm/utils/evm-verification.utils', () => {
  const actual = jest.requireActual('@popup/evm/utils/evm-verification.utils');
  return {
    EvmVerificationUtils: {
      ...actual.EvmVerificationUtils,
      fetchGoPlusVerificationData: jest.fn().mockResolvedValue({}),
    },
  };
});

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

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      to: '0x00000000000000000000000000000000000000aa',
      contract: '0x00000000000000000000000000000000000000cc',
    });

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

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      to: '0x00000000000000000000000000000000000000aa',
      contract: '0x00000000000000000000000000000000000000cc',
      proxyTarget: '0x00000000000000000000000000000000000000dd',
    });

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

  it('merges GoPlus honeypot data into verification result', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      contract: {},
      domain: {},
      to: {},
    });
    (
      EvmVerificationUtils.fetchGoPlusVerificationData as jest.Mock
    ).mockResolvedValue({
      tokenSecurity: { is_honeypot: '1' },
    });

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      chainId: '1',
      tokenContract: '0x00000000000000000000000000000000000000cc',
    });

    expect(result.contract.isHoneypot).toBe(true);
    expect(result.goPlus?.tokenSecurity?.is_honeypot).toBe('1');
  });

  it('getAddressWarning uses per-address verification flags for recipients', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);
    jest
      .spyOn(EvmAddressesUtils, 'isPotentialSpoofing')
      .mockResolvedValue(undefined);

    const warnings = await EvmTransactionParserUtils.getAddressWarning(
      '0x00000000000000000000000000000000000000aa',
      '1',
      {
        contract: { proxy: {}, verifiedBy: [] },
        domain: {},
        to: {},
        addresses: {
          '0x00000000000000000000000000000000000000aa': {
            isMalicious: true,
          },
        },
      },
      [],
    );

    expect(warnings.some((w) => w.message === 'evm_transaction_receiver_malicious')).toBe(
      true,
    );
  });

  it('does not set unableToReach when GoPlus fails but Keychain succeeds', async () => {
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      contract: {},
      domain: {},
      to: {},
    });
    (
      EvmVerificationUtils.fetchGoPlusVerificationData as jest.Mock
    ).mockRejectedValue(new Error('GoPlus down'));

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      chainId: '1',
    });

    expect(result.unableToReach).toBeUndefined();
    expect(result.goPlus?.unavailable).toBe(true);
  });
});

describe('findAbiFromData bundled selectors', () => {
  it('returns ABI JSON for EIP-2612 permit calldata', async () => {
    const iface = new ethers.Interface([
      'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
    ]);
    const data = iface.encodeFunctionData('permit', [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      1n,
      1n,
      27,
      ethers.ZeroHash,
      ethers.ZeroHash,
    ]);
    const abiJson = await EvmTransactionParserUtils.findAbiFromData(data);
    expect(abiJson).toBeDefined();
    expect(abiJson!).toContain('"name":"permit"');
  });

  it('returns ABI JSON for Uniswap V2 swapExactTokensForTokens', async () => {
    const iface = new ethers.Interface([
      'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
    ]);
    const path = [ethers.ZeroAddress, ethers.ZeroAddress];
    const data = iface.encodeFunctionData('swapExactTokensForTokens', [
      1n,
      1n,
      path,
      ethers.ZeroAddress,
      1n,
    ]);
    const abiJson = await EvmTransactionParserUtils.findAbiFromData(data);
    expect(abiJson).toBeDefined();
  });

  it('returns ABI JSON for WETH deposit', async () => {
    const iface = new ethers.Interface(['function deposit() payable']);
    const data = iface.encodeFunctionData('deposit', []);
    const abiJson = await EvmTransactionParserUtils.findAbiFromData(data);
    expect(abiJson).toBeDefined();
  });

  it('returns parsed bundled ABI from selector helper', () => {
    const iface = new ethers.Interface(['function mint(uint256)']);
    const data = iface.encodeFunctionData('mint', [2n]);
    const abi = EvmTransactionParserUtils.getBundledAbiByDataSelector(data);
    expect(Array.isArray(abi)).toBe(true);
    expect(
      abi?.some((item: any) => item.type === 'function' && item.name === 'mint'),
    ).toBe(true);
  });

  it('getAbiFromType ignores PROTOCOL decode-only bucket', () => {
    expect(getAbiFromType(EVMSmartContractType.PROTOCOL)).toBeUndefined();
  });
});

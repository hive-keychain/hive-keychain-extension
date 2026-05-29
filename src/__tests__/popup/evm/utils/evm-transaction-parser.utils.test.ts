import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { getAbiFromType } from '@popup/evm/reference-data/abi.data';
import { EvmTransactionWarningType } from '@popup/evm/interfaces/evm-transactions.interface';
import { getGroupedSecurityDetailReasons } from '@popup/evm/utils/evm-grouped-security-warning.utils';
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
      fetchLightNodeVerificationData: jest.fn().mockResolvedValue({}),
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

describe('getErc20DecodedFieldName', () => {
  it.each([
    ['transfer', 'to', 'evm_operation_to'],
    ['transfer', '_to', 'evm_operation_to'],
    ['transfer', 'recipient', 'evm_operation_to'],
    ['transfer', 'value', 'evm_operation_amount'],
    ['transfer', '_value', 'evm_operation_amount'],
    ['transfer', 'amount', 'evm_operation_amount'],
    ['transferFrom', 'sender', 'evm_operation_from'],
    ['transferFrom', 'recipient', 'evm_operation_to'],
    ['transferFrom', '_to', 'evm_operation_to'],
    ['transferFrom', '_value', 'evm_operation_amount'],
    ['transferFrom', 'amount', 'evm_operation_amount'],
  ])('maps %s.%s to %s', (methodName, inputName, expectedFieldName) => {
    expect(
      EvmTransactionParserUtils.getErc20DecodedFieldName(
        methodName,
        inputName,
      ),
    ).toBe(expectedFieldName);
  });

  it('returns undefined for unrelated ERC20 methods', () => {
    expect(
      EvmTransactionParserUtils.getErc20DecodedFieldName('approve', 'spender'),
    ).toBeUndefined();
  });
});

describe('resolveErc20TransferFromDecodedArgs', () => {
  const recipient = '0x00000000000000000000000000000000000000ab';
  const usdtTransferInputs = [
    { name: '_to', type: 'address' },
    { name: '_value', type: 'uint256' },
  ];

  it('maps USDT-style _to and _value argument names', () => {
    const result = EvmTransactionParserUtils.resolveErc20TransferFromDecodedArgs(
      'transfer',
      usdtTransferInputs,
      [recipient, 1000n],
    );

    expect(result).toEqual({
      receiverAddress: recipient,
      amountRaw: 1000n,
    });
  });

  it('falls back to positional args for standard transfer(address,uint256)', () => {
    const result = EvmTransactionParserUtils.resolveErc20TransferFromDecodedArgs(
      'transfer',
      [
        { name: 'dst', type: 'address' },
        { name: 'wad', type: 'uint256' },
      ],
      [recipient, 1000n],
    );

    expect(result).toEqual({
      receiverAddress: recipient,
      amountRaw: 1000n,
    });
  });

  it('returns null for non-transfer methods', () => {
    expect(
      EvmTransactionParserUtils.resolveErc20TransferFromDecodedArgs(
        'approve',
        usdtTransferInputs,
        [recipient, 1000n],
      ),
    ).toBeNull();
  });
});

describe('evm-transaction-parser.utils proxy tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('injects proxy target into normalized verification data', async () => {
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

  it('does not add wallet whitelist warning when address has security risk', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(false);
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
            securityReasons: ['mixer'],
          },
        },
      },
      [],
    );

    expect(
      warnings.some(
        (w) => w.type === EvmTransactionWarningType.WHITELIST_ADDRESS,
      ),
    ).toBe(false);
  });

  it('keeps wallet whitelist warning when no light-node security risk exists', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(false);
    jest
      .spyOn(EvmAddressesUtils, 'getEnsDataFromAddress')
      .mockResolvedValue(undefined);
    jest
      .spyOn(EvmAddressesUtils, 'isPotentialSpoofing')
      .mockResolvedValue(undefined);
    jest.spyOn(EvmRequestsUtils, 'getEnsForAddress').mockResolvedValue('');

    const warnings = await EvmTransactionParserUtils.getAddressWarning(
      '0x00000000000000000000000000000000000000aa',
      '1',
      {
        contract: { proxy: {}, verifiedBy: [] },
        domain: {},
        to: {},
        addresses: {
          '0x00000000000000000000000000000000000000aa': {},
        },
      },
      [],
    );

    expect(
      warnings.some(
        (w) => w.type === EvmTransactionWarningType.WHITELIST_ADDRESS,
      ),
    ).toBe(true);
  });

  it('does not add contract whitelist warning when contract has security risk', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(false);

    const warningAndInfo =
      await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
        '0x00000000000000000000000000000000000000aa',
        '1',
        {
          contract: {
            proxy: {},
            verifiedBy: [],
            rugPullRisk: true,
            rugPullReasons: ['approval_abuse'],
          },
          domain: {},
          to: {},
        },
        [],
        {
          type: EVMSmartContractType.ERC20,
          name: 'Risk Token',
          symbol: 'RISK',
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

    expect(
      warningAndInfo.warnings?.some(
        (w) => w.type === EvmTransactionWarningType.WHITELIST_ADDRESS,
      ),
    ).toBe(false);
  });

  it('merges light-node contract security into verification result', async () => {
    (
      EvmVerificationUtils.fetchLightNodeVerificationData as jest.Mock
    ).mockResolvedValue({
      contractSecurity: {
        isMalicious: true,
        reasons: ['phishing_activities'],
        stale: false,
      },
    });

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      chainId: '1',
      tokenContract: '0x00000000000000000000000000000000000000cc',
    });

    expect(result.contract.isMalicious).toBe(true);
    expect(result.contract.securityReasons).toEqual(['phishing_activities']);
  });

  it('sets rugPullRisk from light-node security.isRugPull and isRugPullReason', async () => {
    (
      EvmVerificationUtils.fetchLightNodeVerificationData as jest.Mock
    ).mockResolvedValue({
      contractSecurity: {
        isMalicious: false,
        reasons: [],
        stale: false,
        isRugPull: true,
        isRugPullReason: ['approval_abuse', 'blacklist'],
      },
    });

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      chainId: '1',
      tokenContract: '0x00000000000000000000000000000000000000cc',
    });

    expect(result.contract.isMalicious).toBeUndefined();
    expect(result.contract.rugPullRisk).toBe(true);
    expect(result.contract.rugPullReasons).toEqual(['approval_abuse', 'blacklist']);
  });

  it('emits one grouped rug-pull warning with detail reasons', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);

    const warningAndInfo =
      await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
        '0x00000000000000000000000000000000000000aa',
        '1',
        {
          contract: {
            proxy: {},
            verifiedBy: [],
            rugPullRisk: true,
            rugPullReasons: ['approval_abuse', 'blacklist'],
          },
          domain: {},
          to: {},
        },
        [],
        {
          type: EVMSmartContractType.ERC20,
          name: 'Risk Token',
          symbol: 'RISK',
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

    const rugPullWarnings =
      warningAndInfo.warnings?.filter((w) => w.warningKey === 'rugPull') ?? [];
    expect(rugPullWarnings).toHaveLength(1);
    expect(rugPullWarnings[0].type).toBe(EvmTransactionWarningType.GROUPED_SECURITY);
    expect(rugPullWarnings[0].message).toBe('evm_security_reason_rug_pull');
    expect(getGroupedSecurityDetailReasons(rugPullWarnings[0])).toEqual([
      { message: 'evm_security_reason_rug_pull_approval_abuse' },
      { message: 'evm_security_reason_rug_pull_blacklist' },
    ]);
  });

  it('shows rug-pull warnings on contract field from isRugPullReason', async () => {
    jest.spyOn(EvmAddressesUtils, 'isWhitelisted').mockResolvedValue(true);

    const warningAndInfo =
      await EvmTransactionParserUtils.getSmartContractWarningAndInfo(
        '0x00000000000000000000000000000000000000aa',
        '1',
        {
          contract: {
            proxy: {},
            verifiedBy: [],
            rugPullRisk: true,
            rugPullReasons: ['approval_abuse'],
          },
          domain: {},
          to: {},
        },
        [],
        {
          type: EVMSmartContractType.ERC20,
          name: 'Risk Token',
          symbol: 'RISK',
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

    const rugPullWarning = warningAndInfo.warnings?.find(
      (w) => w.warningKey === 'rugPull',
    );
    expect(rugPullWarning?.message).toBe('evm_security_reason_rug_pull');
    expect(getGroupedSecurityDetailReasons(rugPullWarning!)).toEqual([
      { message: 'evm_security_reason_rug_pull_approval_abuse' },
    ]);
  });

  it('emits one grouped address security warning for multiple malicious reasons', async () => {
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
            securityReasons: ['mixer', 'phishing_activities'],
          },
        },
      },
      [],
    );

    const grouped = warnings.find(
      (w) => w.type === EvmTransactionWarningType.GROUPED_SECURITY,
    );
    expect(grouped?.message).toBe('evm_security_reason_grouped_address_risk');
    expect(getGroupedSecurityDetailReasons(grouped!)).toEqual([
      { message: 'evm_security_reason_mixer' },
      { message: 'evm_security_reason_phishing_activities' },
    ]);
    expect(
      warnings.some((w) => w.message === 'evm_security_reason_mixer'),
    ).toBe(false);
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

  it('sets lightNodeSecurityUnavailable when light-node fails', async () => {
    (
      EvmVerificationUtils.fetchLightNodeVerificationData as jest.Mock
    ).mockRejectedValue(new Error('light-node down'));

    const result = await EvmTransactionParserUtils.verifyTransactionInformation({
      domain: 'app.example',
      chainId: '1',
    });

    expect(result.unableToReach).toBeUndefined();
    expect(result.lightNodeSecurityUnavailable).toBe(true);
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

import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmSpendingPermissionUtils } from '@popup/evm/utils/evm-spending-permission.utils';

const SPENDER = '0x00000000000000000000000000000000000000ab';
const TOKEN = '0x00000000000000000000000000000000000000aa';
const SECOND_TOKEN = '0x00000000000000000000000000000000000000ac';
const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);
const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);

describe('EvmSpendingPermissionUtils', () => {
  it('recognizes the uint256 and uint160 maximums', () => {
    expect(EvmSpendingPermissionUtils.isUnlimitedAmount(MAX_UINT256, 256)).toBe(
      true,
    );
    expect(EvmSpendingPermissionUtils.isUnlimitedAmount(BigInt(10), 256)).toBe(
      false,
    );
    expect(EvmSpendingPermissionUtils.isUnlimitedAmount(MAX_UINT160, 160)).toBe(
      true,
    );
    expect(EvmSpendingPermissionUtils.isUnlimitedAmount(MAX_UINT256, 160)).toBe(
      false,
    );
  });

  it('classifies a finite ERC20 approve without a warning', () => {
    const permission = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      args: [SPENDER, BigInt(1000)],
      tokenAddress: TOKEN,
      tokenSymbol: 'USDC',
      tokenType: EVMSmartContractType.ERC20,
    });

    expect(permission?.operationNameKey).toBe('evm_operation_approve');
    expect(permission?.entries[0]).toEqual(
      expect.objectContaining({
        kind: 'erc20-allowance',
        spender: SPENDER,
        amountRaw: BigInt(1000),
        unlimited: false,
        requiresWarning: false,
      }),
    );
  });

  it('classifies a max uint256 approve as unlimited', () => {
    const permission = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'wad', type: 'uint256' },
      ],
      args: [SPENDER, MAX_UINT256],
      tokenAddress: TOKEN,
      tokenSymbol: 'DAI',
      tokenType: EVMSmartContractType.ERC20,
    });

    expect(permission?.operationNameKey).toBe(
      'evm_operation_unlimited_approval',
    );
    expect(permission?.entries[0].unlimited).toBe(true);
    expect(permission?.entries[0].requiresWarning).toBe(true);
    expect(
      EvmSpendingPermissionUtils.buildWarning(permission!.entries[0]),
    ).toEqual(
      expect.objectContaining({
        message: 'evm_warning_unlimited_approval',
        messageParams: [EvmFormatUtils.formatAddress(SPENDER), 'DAI'],
        level: 'high',
        ignored: false,
      }),
    );
  });

  it('classifies setApprovalForAll true as an operator warning and false as a revoke', () => {
    const approved = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'setApprovalForAll',
      inputs: [
        { name: 'operator', type: 'address' },
        { name: 'approved', type: 'bool' },
      ],
      args: [SPENDER, true],
      tokenAddress: TOKEN,
      tokenSymbol: 'TNFT',
      tokenType: EVMSmartContractType.ERC721,
    });
    const revoked = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'setApprovalForAll',
      inputs: [
        { name: 'operator', type: 'address' },
        { name: 'approved', type: 'bool' },
      ],
      args: [SPENDER, false],
      tokenType: EVMSmartContractType.ERC721,
    });

    expect(approved?.operationNameKey).toBe('evm_operation_approve');
    expect(approved?.entries[0].kind).toBe('operator-approval');
    expect(approved?.entries[0].requiresWarning).toBe(true);
    expect(revoked?.operationNameKey).toBe('evm_operation_revoke_operator');
    expect(revoked?.entries[0].requiresWarning).toBe(false);
    expect(
      EvmSpendingPermissionUtils.buildWarning(revoked!.entries[0]),
    ).toBeUndefined();
  });

  it('classifies an ERC721 approve as a single token approval', () => {
    const permission = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'approve',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ],
      args: [SPENDER, BigInt(7)],
      tokenAddress: TOKEN,
      tokenType: EVMSmartContractType.ERC721,
    });

    expect(permission?.operationNameKey).toBe('evm_operation_approve_nft');
    expect(permission?.entries[0]).toEqual(
      expect.objectContaining({
        kind: 'erc721-approve',
        tokenId: '7',
        requiresWarning: false,
      }),
    );
  });

  it('classifies a DAI permit allowed flag', () => {
    const allowed = EvmSpendingPermissionUtils.classifyDecodedCall({
      method: 'permit',
      inputs: [
        { name: 'holder', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'allowed', type: 'bool' },
      ],
      args: [TOKEN, SPENDER, BigInt(1), BigInt(2), true],
      tokenAddress: TOKEN,
      tokenSymbol: 'DAI',
    });
    const cleared = EvmSpendingPermissionUtils.classifyTypedData({
      primaryType: 'Permit',
      domain: { verifyingContract: TOKEN, name: 'DAI' },
      message: {
        holder: TOKEN,
        spender: SPENDER,
        nonce: '1',
        expiry: '2',
        allowed: false,
      },
    });

    expect(allowed?.operationNameKey).toBe('evm_operation_unlimited_approval');
    expect(allowed?.entries[0].spender).toBe(SPENDER);
    expect(cleared?.operationNameKey).toBe('evm_operation_approve');
    expect(cleared?.entries[0].unlimited).toBe(false);
    expect(cleared?.entries[0].requiresWarning).toBe(false);
  });

  it('classifies Permit2 single and batch allowances', () => {
    const single = EvmSpendingPermissionUtils.classifyTypedData({
      primaryType: 'PermitSingle',
      domain: { name: 'Permit2', verifyingContract: SPENDER },
      message: {
        details: {
          token: TOKEN,
          amount: MAX_UINT160.toString(),
          expiration: '1',
          nonce: '0',
        },
        spender: SPENDER,
        sigDeadline: '2',
      },
    });
    const batch = EvmSpendingPermissionUtils.classifyTypedData({
      primaryType: 'PermitBatch',
      message: {
        details: [
          { token: TOKEN, amount: '10', expiration: '1', nonce: '0' },
          {
            token: SECOND_TOKEN,
            amount: MAX_UINT160,
            expiration: '1',
            nonce: '0',
          },
        ],
        spender: SPENDER,
        sigDeadline: '2',
      },
    });

    expect(single?.operationNameKey).toBe('evm_operation_unlimited_approval');
    expect(single?.entries).toHaveLength(1);
    expect(single?.entries[0]).toEqual(
      expect.objectContaining({
        tokenAddress: TOKEN,
        spender: SPENDER,
        unlimited: true,
        requiresWarning: true,
      }),
    );
    expect(single?.entries[0].tokenSymbol).toBeUndefined();
    expect(batch?.entries).toEqual([
      expect.objectContaining({
        tokenAddress: TOKEN,
        unlimited: false,
        requiresWarning: false,
      }),
      expect.objectContaining({
        tokenAddress: SECOND_TOKEN,
        unlimited: true,
        requiresWarning: true,
      }),
    ]);
  });

  it('ignores typed data that is not a permit', () => {
    expect(
      EvmSpendingPermissionUtils.classifyTypedData({
        primaryType: 'Mail',
        message: { contents: 'hello' },
      }),
    ).toBeNull();
  });
});

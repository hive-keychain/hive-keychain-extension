import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { EtherJsonRpcProvider } from 'src/utils/evm/ether-json-rpc-provider';

describe('EthersUtils', () => {
  it('keeps a 50 percent buffer on contract call gas estimates', async () => {
    const getActiveRpcSpy = jest
      .spyOn(EvmRpcUtils, 'getActiveRpc')
      .mockResolvedValue({ url: 'https://rpc.example' });
    const estimateGasSpy = jest
      .spyOn(EtherJsonRpcProvider.prototype, 'estimateGas')
      .mockResolvedValue(BigInt(31_665));

    try {
      await expect(
        EthersUtils.getGasLimit(
          {
            chainId: '0xaa36a7',
            rpcs: [{ url: 'https://rpc.example' }],
          } as EvmChain,
          '0x01658de90bc5D8a182674123bD4B18EcB17eFBe6',
          undefined,
          undefined,
          undefined,
          '0xa9059cbb',
          '0x06899838802031C8Deef90C1525332279F9A9190',
          '0x0',
        ),
      ).resolves.toBe(47_498);
    } finally {
      getActiveRpcSpy.mockRestore();
      estimateGasSpy.mockRestore();
    }
  });

  it('keeps a 20 percent buffer on native transfer gas estimates', async () => {
    const getActiveRpcSpy = jest
      .spyOn(EvmRpcUtils, 'getActiveRpc')
      .mockResolvedValue({ url: 'https://rpc.example' });
    const estimateGasSpy = jest
      .spyOn(EtherJsonRpcProvider.prototype, 'estimateGas')
      .mockResolvedValue(BigInt(21_000));

    try {
      await expect(
        EthersUtils.getGasLimit(
          {
            chainId: '0xaa36a7',
            rpcs: [{ url: 'https://rpc.example' }],
          } as EvmChain,
          '0x01658de90bc5D8a182674123bD4B18EcB17eFBe6',
          undefined,
          undefined,
          undefined,
          '',
          '0x06899838802031C8Deef90C1525332279F9A9190',
          '0x1',
        ),
      ).resolves.toBe(25_200);
    } finally {
      getActiveRpcSpy.mockRestore();
      estimateGasSpy.mockRestore();
    }
  });

  it('maps insufficient funds to a blocking error', () => {
    expect(EthersUtils.getErrorMessage('INSUFFICIENT_FUNDS')).toEqual({
      message: 'evm_transaction_result_error_message_insufficient_funds',
      isBlocking: true,
    });
  });

  it('maps action rejected to the user rejected message', () => {
    expect(EthersUtils.getErrorMessage('ACTION_REJECTED')).toEqual({
      message: 'evm_transaction_result_error_message_user_rejected',
    });
  });

  it('maps network-like errors to the shared network message', () => {
    expect(EthersUtils.getErrorMessage('TIMEOUT')).toEqual({
      message: 'evm_transaction_result_error_message_network',
    });
  });

  it('maps insufficient allowance call exceptions to a blocking error', () => {
    expect(
      EthersUtils.getErrorMessage(
        'CALL_EXCEPTION',
        'execution reverted: ERC20: insufficient allowance',
      ),
    ).toEqual({
      message: 'evm_error_message_transfer_amount_exceeds_allowance',
      isBlocking: true,
    });
  });

  it('maps insufficient balance call exceptions from shortMessage fallback', () => {
    expect(
      EthersUtils.getErrorMessage(
        'CALL_EXCEPTION',
        undefined,
        'execution reverted: transfer amount exceeds balance',
      ),
    ).toEqual({
      message: 'evm_error_message_insufficient_token_balance',
      isBlocking: true,
    });
  });

  it('maps paused call exceptions to a dedicated blocking message', () => {
    expect(
      EthersUtils.getErrorMessage(
        'CALL_EXCEPTION',
        'execution reverted: Pausable: paused',
      ),
    ).toEqual({
      message: 'evm_transaction_result_error_message_paused',
      isBlocking: true,
    });
  });

  it('falls back to a generic call exception instead of unknown', () => {
    expect(
      EthersUtils.getErrorMessage(
        'CALL_EXCEPTION',
        'execution reverted: custom contract error',
      ),
    ).toEqual({
      message: 'evm_transaction_result_error_message_execution_reverted',
      isBlocking: true,
    });
  });

  it('falls back to the generic call exception message for unclassified errors', () => {
    expect(
      EthersUtils.getErrorMessage('CALL_EXCEPTION', 'raw custom error'),
    ).toEqual({
      message:
        'evm_transaction_result_error_message_execution_reverted_with_reason',
      params: ['raw custom error'],
      isBlocking: true,
    });
  });
});

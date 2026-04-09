import { EthersUtils } from '@popup/evm/utils/ethers.utils';

describe('ethers utils error mapper', () => {
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
      message: 'evm_transaction_result_error_message_call_exception',
      isBlocking: true,
    });
  });
});

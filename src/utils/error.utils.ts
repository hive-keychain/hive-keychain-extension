import { KeychainError } from 'src/keychain-error';
import FormatUtils from 'src/utils/format.utils';

enum BlockchainErrorType {
  ADJUST_BLANCE = 'adjust_balance',
  GET_ACCOUNT = 'get_account',
  WITNESS_VOTE = 'do_apply',
  WITNESS_NOT_FOUND = 'get_witness',
}

const parse = (error: any) => {
  const stack = error?.data.stack[0];
  console.log(stack);
  if (stack?.context?.method) {
    switch (stack.context.method) {
      case BlockchainErrorType.ADJUST_BLANCE:
        return new KeychainError(
          'bgd_ops_transfer_adjust_balance',
          [FormatUtils.getSymbol(stack.data.a.nai), stack.data.acc!],
          error,
        );
      case BlockchainErrorType.GET_ACCOUNT:
        return new KeychainError(
          'bgd_ops_transfer_get_account',
          [FormatUtils.getSymbol(stack.data.a.nai), stack.data.acc!],
          error,
        );
      case BlockchainErrorType.WITNESS_VOTE: {
        if (stack.format.includes('has_proxy')) {
          return new KeychainError(
            'html_popup_witness_vote_error_proxy',
            [],
            error,
          );
        }
        if (stack.format.includes('reject')) {
          return new KeychainError(
            'html_popup_witness_already_voted',
            [],
            error,
          );
        }
        if (stack.format.includes('approve')) {
          return new KeychainError('html_popup_witness_not_voted', [], error);
        }
        if (stack.format.includes('too many')) {
          return new KeychainError(
            'html_popup_vote_witness_error_30_votes',
            [],
            error,
          );
        }
        break;
      }
      case BlockchainErrorType.WITNESS_NOT_FOUND:
        return new KeychainError('html_popup_witness_not_existing', [], error);
    }
  }
  return new KeychainError('html_popup_error_while_broadcasting', [], error);
};

export const ErrorUtils = { parse };

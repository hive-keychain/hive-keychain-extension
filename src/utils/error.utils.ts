import { KeychainError } from 'src/keychain-error';
import FormatUtils from 'src/utils/format.utils';

enum BlockchainErrorType {
  ADJUST_BLANCE = 'adjust_balance',
  GET_ACCOUNT = 'get_account',
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
    }
  }
  return new KeychainError('html_popup_error_while_broadcasting', [], error);
};

export const ErrorUtils = { parse };

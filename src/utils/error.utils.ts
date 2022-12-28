import { KeychainError } from 'src/keychain-error';
import FormatUtils from 'src/utils/format.utils';

enum BlockchainErrorType {
  ADJUST_BLANCE = 'adjust_balance',
  GET_ACCOUNT = 'get_account',
  WITNESS_VOTE = 'do_apply',
  WITNESS_NOT_FOUND = 'get_witness',
}

enum HiveEngineErrorType {
  OVERDRAW_BALANCE = 'overdrawn balance',
  TOKEN_NOT_EXISTING = 'symbol does not exist',
  USER_NOT_EXISTING = 'invalid to',
}

const parse = (error: any) => {
  const stack = error?.data.stack[0];

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

const parseHiveEngine = (error: string, payload: any) => {
  console.log(error, payload);
  if (error.includes(HiveEngineErrorType.OVERDRAW_BALANCE)) {
    return new KeychainError('hive_engine_overdraw_balance_error', [
      payload.symbol,
    ]);
  }
  if (error.includes(HiveEngineErrorType.TOKEN_NOT_EXISTING)) {
    return new KeychainError('hive_engine_not_existing_token_error', [
      payload.symbol,
    ]);
  }
  if (error.includes(HiveEngineErrorType.USER_NOT_EXISTING)) {
    return new KeychainError('hive_engine_not_existing_user_error', [
      payload.to,
    ]);
  }
  return new KeychainError('bgd_ops_hive_engine_confirmation_error', [error]);
};

export const ErrorUtils = { parse, parseHiveEngine };

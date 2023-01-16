import { KeychainError } from 'src/keychain-error';
import FormatUtils from 'src/utils/format.utils';

enum BlockchainErrorType {
  ADJUST_BLANCE = 'adjust_balance',
  GET_ACCOUNT = 'get_account',
  DO_APPLY = 'do_apply',
  WITNESS_NOT_FOUND = 'get_witness',
  VALIDATION = 'validate',
}

enum HiveEngineErrorType {
  OVERDRAW_BALANCE = 'overdrawn balance',
  TOKEN_NOT_EXISTING = 'symbol does not exist',
  USER_NOT_EXISTING = 'invalid to',
}

enum LedgerErrorType {
  DENIED_BY_USER = 'CONDITIONS_OF_USE_NOT_SATISFIED',
}

const parse = (error: any) => {
  console.log(error);
  const stack = error?.data?.stack[0];
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
          [stack.data.name],
          error,
        );
      case BlockchainErrorType.DO_APPLY: {
        if (stack.format.includes('has_proxy')) {
          return new KeychainError(
            'html_popup_witness_vote_error_proxy',
            [],
            error,
          );
        }
        if (stack.format.includes('Proxy must change')) {
          return new KeychainError('set_same_proxy_error', [], error);
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
        if (
          stack.format.includes(
            'Account does not have sufficient Hive Power for withdraw',
          )
        ) {
          return new KeychainError(
            'power_down_hp_not_sufficient_error',
            [],
            error,
          );
        }
        break;
      }
      case BlockchainErrorType.WITNESS_NOT_FOUND:
        return new KeychainError('html_popup_witness_not_existing', [], error);
      case BlockchainErrorType.VALIDATION: {
        if (stack.format.includes('${days}')) {
          return new KeychainError(
            'recurrent_transfer_recurrence_max_duration_error',
            [stack.data.days],
            error,
          );
        }
        if (stack.format.includes('${recurrence}')) {
          return new KeychainError(
            'recurrent_transfer_recurrence_error',
            [stack.data.recurrence],
            error,
          );
        }
        if (stack.format.includes('execution')) {
          return new KeychainError(
            'recurrent_transfer_iterations_error',
            [],
            error,
          );
        }
      }
    }
  } else if (error.statusText) {
    switch (error.statusText) {
      case LedgerErrorType.DENIED_BY_USER:
        return new KeychainError('error_ledger_denied_by_user', [], error);
    }
  } else if (
    error.name === 'TransportOpenUserCancelled' ||
    error.name === 'TransportStatusError' ||
    error.name === 'DisconnectedDeviceDuringOperation'
  ) {
    return new KeychainError('popup_html_ledger_not_detected');
  } else if (stack && stack.format) {
    return new KeychainError('error_while_broadcasting', [stack.format], error);
  }

  return new KeychainError('error_while_broadcasting', [], error);
};

const parseHiveEngine = (error: string, payload: any) => {
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

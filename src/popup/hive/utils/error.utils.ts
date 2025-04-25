import { FormatUtils } from 'hive-keychain-commons';
import { KeychainError } from 'src/keychain-error';
import Logger from 'src/utils/logger.utils';

enum BlockchainErrorType {
  ADJUST_BLANCE = 'adjust_balance',
  GET_ACCOUNT = 'get_account',
  DO_APPLY = 'do_apply',
  WITNESS_NOT_FOUND = 'get_witness',
  VALIDATION = 'validate',
  VALIDATE_TRANSACTION = 'validate_transaction',
  MISSING_AUTHORITY = 'verify_authority',
}

enum HiveEngineErrorType {
  OVERDRAW_BALANCE = 'overdrawn balance',
  TOKEN_NOT_EXISTING = 'symbol does not exist',
  USER_NOT_EXISTING = 'invalid to',
}

const parse = (error: any) => {
  Logger.log(error);
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
      case BlockchainErrorType.VALIDATE_TRANSACTION: {
        if (error.message.includes('transaction expiration exception')) {
          return new KeychainError('broadcast_error_transaction_expired');
        }
      }
      case BlockchainErrorType.MISSING_AUTHORITY: {
        return new KeychainError(error.data.name);
      }
    }
  }

  if (error.data && error.data.name === 'not_enough_rc_exception') {
    return new KeychainError('not_enough_rc', [], error);
  }
  if (stack && stack.format && !stack.format.includes('${what}')) {
    return new KeychainError('error_while_broadcasting', [stack.format], error);
  }
  return new KeychainError('html_popup_error_while_broadcasting', [], error);
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

const parseLedger = (error: any) => {
  if (error instanceof KeychainError) {
    return error;
  }

  const hexErrCode = `0x${parseInt(error.statusCode)
    .toString(16)
    .toLowerCase()}`;
  switch (hexErrCode) {
    case '0xb003':
      return new KeychainError('error_ledger_failed_to_parse_transaction');
    case '0xb004':
      return new KeychainError('error_ledger_bad_state');
    case '0xb005':
      return new KeychainError('html_ledger_error_while_signing');
    case '0xb007':
    case '0xb008':
      return new KeychainError('error_ledger_sign_hash');
    case '0x530c':
      return new KeychainError('error_ledger_locked');
    case '0x6985':
      return new KeychainError('error_ledger_denied_by_user', [], error);
    case '0x6a87':
      return new KeychainError('error_ledger_internal_error');
    case '0x6d00':
      return new KeychainError('error_ledger_version_not_supported');
    case '0x6e00':
      return new KeychainError('error_ledger_app_not_supported');
    case '0x6e01':
      return new KeychainError('error_ledger_hive_app_not_opened');
    default: {
      Logger.log(error);
      if (
        error.name === 'DisconnectedDeviceDuringOperation' ||
        error.name === 'TransportOpenUserCancelled'
      ) {
        return new KeychainError('popup_html_ledger_not_detected');
      } else if (
        error.toString().includes('Ledger error: Unable to claim interface')
      ) {
        return new KeychainError('ledger_reboot_with_ledger_live_error');
      }
      return new KeychainError('popup_html_ledger_unknown_error');
    }
  }
};

export const ErrorUtils = { parse, parseHiveEngine, parseLedger };

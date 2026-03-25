import { ErrorUtils } from '@hiveapp/utils/error.utils';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { KeychainError } from 'src/keychain-error';

describe('error.utils.ts tests:\n', () => {
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

  const blockchainErrorData = [
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.ADJUST_BLANCE },
              data: { a: { nai: '@@000000013' }, acc: mk.user.one },
            },
          ],
        },
      },
      expectError: new KeychainError('bgd_ops_transfer_adjust_balance'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.GET_ACCOUNT },
              data: { name: mk.user.one },
            },
          ],
        },
      },
      expectError: new KeychainError('bgd_ops_transfer_get_account'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format: 'It has_proxy somewhere',
            },
          ],
        },
      },
      expectError: new KeychainError('html_popup_witness_vote_error_proxy'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format: 'Proxy must change',
            },
          ],
        },
      },
      expectError: new KeychainError('set_same_proxy_error'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format: 'reject pain',
            },
          ],
        },
      },
      expectError: new KeychainError('html_popup_witness_already_voted'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format: 'approve love and happiness',
            },
          ],
        },
      },
      expectError: new KeychainError('html_popup_witness_not_voted'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format: 'too many hate and suffering',
            },
          ],
        },
      },
      expectError: new KeychainError('html_popup_vote_witness_error_30_votes'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.DO_APPLY },
              format:
                'Account does not have sufficient Hive Power for withdraw',
            },
          ],
        },
      },
      expectError: new KeychainError('power_down_hp_not_sufficient_error'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.WITNESS_NOT_FOUND },
            },
          ],
        },
      },
      expectError: new KeychainError('html_popup_witness_not_existing'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.VALIDATION },
              format: 'Will pass 10 ${days}',
              data: { days: 10 },
            },
          ],
        },
      },
      expectError: new KeychainError(
        'recurrent_transfer_recurrence_max_duration_error',
      ),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.VALIDATION },
              format: 'Will pass ${recurrence}',
              data: { recurrence: 10 },
            },
          ],
        },
      },
      expectError: new KeychainError('recurrent_transfer_recurrence_error'),
    },
    {
      error: {
        data: {
          stack: [
            {
              context: { method: BlockchainErrorType.VALIDATION },
              format: 'Failed execution',
            },
          ],
        },
      },
      expectError: new KeychainError('recurrent_transfer_iterations_error'),
    },
  ];

  const hiveEngineErrorData = [
    {
      error: HiveEngineErrorType.OVERDRAW_BALANCE,
      payload: {
        symbol: 'LEO',
      },
      expectError: new KeychainError('hive_engine_overdraw_balance_error'),
    },
    {
      error: HiveEngineErrorType.TOKEN_NOT_EXISTING,
      payload: {
        symbol: 'LEO',
      },
      expectError: new KeychainError('hive_engine_not_existing_token_error'),
    },
    {
      error: HiveEngineErrorType.USER_NOT_EXISTING,
      payload: {
        to: mk.user.one,
      },
      expectError: new KeychainError('hive_engine_not_existing_user_error'),
    },
    {
      error: 'Default_case',
      payload: {},
      expectError: new KeychainError('bgd_ops_hive_engine_confirmation_error'),
    },
  ];
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
  });
  describe('parse cases:/n', () => {
    it('Must return error if no context on stack', () => {
      expect(
        ErrorUtils.parse({ data: { stack: [{ format: 'format' }] } }),
      ).toEqual(new KeychainError('error_while_broadcasting'));
    });

    it('Must return error if statusText', () => {
      expect(
        ErrorUtils.parse({ statusText: 'CONDITIONS_OF_USE_NOT_SATISFIED' }),
      ).toEqual(new KeychainError('html_popup_error_while_broadcasting'));
    });

    it('Must return KeychainError on each Blockchain error case', () => {
      for (let i = 0; i < blockchainErrorData.length; i++) {
        const element = blockchainErrorData[i];
        expect(ErrorUtils.parse(element.error)).toEqual(element.expectError);
      }
    });

    it('maps validate_transaction + expiration message to broadcast_error_transaction_expired', () => {
      expect(
        ErrorUtils.parse({
          message: 'transaction expiration exception',
          data: {
            stack: [
              {
                context: { method: 'validate_transaction' },
              },
            ],
          },
        }),
      ).toEqual(new KeychainError('broadcast_error_transaction_expired'));
    });

    it('maps verify_authority stack to KeychainError using data.name', () => {
      expect(
        ErrorUtils.parse({
          data: {
            name: 'missing_posting_authority',
            stack: [
              {
                context: { method: 'verify_authority' },
              },
            ],
          },
        }),
      ).toEqual(new KeychainError('missing_posting_authority'));
    });

    it('maps not_enough_rc_exception to not_enough_rc', () => {
      const err = {
        data: { name: 'not_enough_rc_exception', stack: [] },
      };
      const parsed = ErrorUtils.parse(err);
      expect(parsed).toEqual(new KeychainError('not_enough_rc', [], err));
    });
  });

  describe('parseHiveEngine cases:\n', () => {
    it('Must return KeychainError on each Blockchain error case', () => {
      for (let i = 0; i < hiveEngineErrorData.length; i++) {
        const element = hiveEngineErrorData[i];
        expect(
          ErrorUtils.parseHiveEngine(element.error, element.payload),
        ).toEqual(element.expectError);
      }
    });
  });

  describe('parseLedger', () => {
    it('returns the same KeychainError instance when already KeychainError', () => {
      const ke = new KeychainError('x');
      expect(ErrorUtils.parseLedger(ke)).toBe(ke);
    });

    it('maps known Ledger status codes', () => {
      expect(
        ErrorUtils.parseLedger({ statusCode: 0xb003 }),
      ).toEqual(new KeychainError('error_ledger_failed_to_parse_transaction'));
      expect(ErrorUtils.parseLedger({ statusCode: 0x6985 })).toEqual(
        new KeychainError('error_ledger_denied_by_user', [], {
          statusCode: 0x6985,
        }),
      );
      expect(ErrorUtils.parseLedger({ statusCode: 0x530c })).toEqual(
        new KeychainError('error_ledger_locked'),
      );
    });

    it('maps disconnected transport errors to not detected', () => {
      expect(
        ErrorUtils.parseLedger({
          statusCode: 0xffff,
          name: 'DisconnectedDeviceDuringOperation',
        }),
      ).toEqual(new KeychainError('popup_html_ledger_not_detected'));
    });
  });
});

import { SignTypedData } from '@dialog/evm/requests/sign-typed-data';
import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';

import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/dialog/evm/requests/transaction-warnings/transaction.hook', () => ({
  useTransactionHook: jest.fn(),
}));

jest.mock('src/dialog/evm/evm-operation/evm-operation', () => ({
  EvmOperation: () => <div data-testid="evm-operation" />,
}));

jest.mock(
  'src/dialog/evm/requests/transaction-warnings/transaction-warning.component',
  () => ({
    EvmTransactionWarningsComponent: () => null,
  }),
);

const SPENDER = '0x00000000000000000000000000000000000000ab';
const TOKEN = '0x00000000000000000000000000000000000000aa';
const OWNER = '0x00000000000000000000000000000000000000ff';
const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);

describe('SignTypedData spending permissions', () => {
  const transactionHook = {
    setFields: jest.fn(),
    setLoading: jest.fn(),
    setReady: jest.fn(),
    setUnableToReachBackend: jest.fn(),
    hydrateDomainFieldWarnings: jest.fn(),
    buildInitialDomainField: jest.fn().mockReturnValue({
      name: 'dialog_evm_domain',
      type: 'string',
      value: 'app.example',
      warnings: [],
    }),
    getWalletAddressInput: jest.fn().mockResolvedValue({
      name: 'evm_target_account',
      type: 'wallet-address',
      value: OWNER,
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTransactionHook as jest.Mock).mockReturnValue(transactionHook);
    I18nUtils.getMessage = jest.fn((key: string) => key) as any;
    jest.spyOn(EvmChainUtils, 'getLastEvmChain').mockResolvedValue({
      chainId: '0x1',
    } as any);
    jest
      .spyOn(EvmTransactionParserUtils, 'verifyTransactionInformation')
      .mockResolvedValue({} as any);
  });

  it('prepends a Permit2 PermitSingle summary and unlimited warning', async () => {
    const typedData = {
      domain: {
        name: 'Permit2',
        chainId: '1',
        verifyingContract: '0x000000000022d473030f116ddee9f6b43ac78ba3',
      },
      primaryType: 'PermitSingle',
      types: {
        PermitDetails: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint160' },
          { name: 'expiration', type: 'uint48' },
          { name: 'nonce', type: 'uint48' },
        ],
        PermitSingle: [
          { name: 'details', type: 'PermitDetails' },
          { name: 'spender', type: 'address' },
          { name: 'sigDeadline', type: 'uint256' },
        ],
      },
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
    };

    render(
      <SignTypedData
        accounts={[{ address: OWNER } as any]}
        afterCancel={jest.fn()}
        data={{ dappInfo: { domain: 'app.example', origin: 'https://app.example' }, tab: 1 } as any}
        request={
          {
            method: EvmRequestMethod.ETH_SIGN_DATA_4,
            params: [OWNER, typedData],
            request_id: 4,
          } as any
        }
      />,
    );

    await waitFor(() => expect(transactionHook.setFields).toHaveBeenCalled());

    const fields = transactionHook.setFields.mock.calls.at(-1)[0];
    expect(fields.operationName).toBe('evm_operation_unlimited_approval');
    expect(fields.otherFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'evm_spending_permission_token',
          value: TOKEN,
        }),
        expect.objectContaining({
          name: 'evm_operation_spender',
          value: SPENDER,
        }),
        expect.objectContaining({
          name: 'evm_operation_amount',
          value: 'evm_history_unlimited_approval_value',
          warnings: [
            expect.objectContaining({
              ignored: false,
              level: 'high',
              message: 'evm_warning_unlimited_approval',
              messageParams: [SPENDER, TOKEN],
            }),
          ],
        }),
      ]),
    );
    expect(
      fields.otherFields.some(
        (field: { name: string }) =>
          field.name === 'evm_sign_typed_data_message_primary_type',
      ),
    ).toBe(true);
  });
});

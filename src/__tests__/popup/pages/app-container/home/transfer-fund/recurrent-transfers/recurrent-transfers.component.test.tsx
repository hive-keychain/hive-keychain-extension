import TransferUtils from '@hiveapp/utils/transfer.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import { PendingRecurrentTransfer } from '@interfaces/transaction.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { PendingRecurrentTransfersPageComponent } from 'src/popup/hive/pages/app-container/home/transfer-fund/recurrent-transfers/recurrent-transfers.component';
import { RootState } from 'src/popup/multichain/store';

/**
 * Covers cancel success messaging (moved off the transfer form; see
 * `transfer-fund.component.hive.test.tsx` history).
 */
describe('recurrent-transfers.component:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  beforeEach(() => {
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
  });

  const mkState = (list: PendingRecurrentTransfer[]): RootState =>
    ({
      ...initialStates.iniStateAs.defaultExistent,
      hive: {
        ...initialStates.iniStateAs.defaultExistent.hive,
        activeAccount: accounts.active,
        recurrentTransfers: list,
      },
    }) as RootState;

  it('Must show success message after cancelling a recurrent transfer', async () => {
    const to = 'workerjab2';
    const pairId = 42;
    TransferUtils.sendTransfer = jest.fn().mockResolvedValue({
      tx_id: 'trx_id',
      id: 'id',
      confirmed: true,
    } as TransactionResult);

    const row = {
      from: accounts.active.name!,
      to,
      amount: '1.000 HIVE',
      remaining_executions: 5,
      recurrence: 24,
      trigger_date: '2020-01-01T00:00:00',
      pair_id: pairId,
      consecutive_failures: 0,
      id: 1,
      memo: '',
    } as unknown as PendingRecurrentTransfer;

    customRender(<PendingRecurrentTransfersPageComponent />, {
      initialState: mkState([row]),
    });

    await act(async () => {
      await userEvent.click(screen.getByText(`@${to}`));
    });
    const cancelLabel = chrome.i18n.getMessage(
      'popup_html_button_label_cancel',
    );
    const cancelBtn = await screen.findByText(cancelLabel);
    await act(async () => {
      await userEvent.click(cancelBtn);
    });

    expect(TransferUtils.sendTransfer).toHaveBeenCalled();
    expect(
      await screen.findByText(
        chrome.i18n.getMessage(
          'popup_html_cancel_transfer_recurrent_successful',
          [`@${to}`],
        ),
      ),
    ).toBeInTheDocument();
  });
});

import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import Transfer from 'src/dialog/pages/requests/transfer';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import { Tests_Client } from 'src/__tests__/utils-for-testing/classes/dialog/request-balance';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import requestTransfer from 'src/__tests__/utils-for-testing/data/props/dialog/request-transfer';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestTransfer } from 'src/__tests__/utils-for-testing/types/props-types';
describe('transfer tests:\n', () => {
  const { methods, spies, mocks } = appMocks;
  const { props } = requestTransfer;
  methods.config();
  beforeEach(() => {
    mockPreset.setOrDefault({});
    mocks.dHiveHiveIO(Tests_Client);
  });
  it('Must show Transfer dialog(Anonymous, encrypted memo, phishing warning)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.to = phishing.accounts.data[0];
    clonedProps.data.memo = '#To Encrypt memo';
    clonedProps.data.amount = '1.000';
    const { asFragment } = render(<Transfer {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot(
      'Request Transfer Anonymous, encrypted memo, phishing warning',
    );
  });
  it('Must show Transfer dialog(regular memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.memo = 'Regular memo!';
    clonedProps.data.amount = '1.000';
    const { asFragment } = render(<Transfer {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Request Transfer regular memo');
  });
  it('Must show Transfer dialog(empty memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.memo = '';
    clonedProps.data.amount = '1.000';
    const { asFragment } = render(<Transfer {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Request Transfer empty memo');
  });
  it('Must call window.close when clicking on cancel', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.amount = '1.000';
    render(<Transfer {...clonedProps} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.amount = '1.000';
    render(<Transfer {...{ ...clonedProps, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestTransfer;
    clonedProps.data.amount = '1.000';
    const spySendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    render(<Transfer {...clonedProps} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spySendMessage).toBeCalledWith({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: clonedProps.data,
        tab: clonedProps.tab,
        domain: clonedProps.domain,
        keep: false,
      },
    });
  });
});

import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import SendToken from 'src/dialog/pages/requests/send-token';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import phishing from 'src/__tests__/utils-for-testing/data/phishing';
import requestSendToken from 'src/__tests__/utils-for-testing/data/props/dialog/request-sendToken';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestSendToken } from 'src/__tests__/utils-for-testing/types/props-types';
describe('send-token tests:\n', () => {
  const { methods, spies, mocks } = appMocks;
  const { props } = requestSendToken;
  methods.config();
  beforeEach(() => {
    mockPreset.setOrDefault({});
    mocks.getUserBalance([{ symbol: 'LEO', balance: '2000.000' }]);
  });
  it('Must show SendToken dialog(encrypted memo, phising warning)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSendToken;
    clonedProps.data.to = phishing.accounts.data[0];
    clonedProps.data.memo = '#To Encrypt memo';
    const { asFragment } = render(<SendToken {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot(
      'Request SendToken enc memo, phising warning',
    );
  });
  it('Must show SendToken dialog(regular memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSendToken;
    clonedProps.data.memo = 'Regular memo!';
    const { asFragment } = render(<SendToken {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Request SendToken regular memo');
  });
  it('Must show SendToken dialog(empty memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSendToken;
    clonedProps.data.memo = '';
    const { asFragment } = render(<SendToken {...clonedProps} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Request SendToken empty memo');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<SendToken {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSendToken;
    render(<SendToken {...{ ...clonedProps, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const spySendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    render(<SendToken {...props} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spySendMessage).toBeCalledWith({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: props.data,
        tab: props.tab,
        domain: props.domain,
        keep: false,
      },
    });
  });
});

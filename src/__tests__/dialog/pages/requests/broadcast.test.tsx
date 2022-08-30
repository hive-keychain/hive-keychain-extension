import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Broadcast from 'src/dialog/pages/requests/broadcast';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestBroadcast from 'src/__tests__/utils-for-testing/data/props/dialog/request-broadcast';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestBroadcast } from 'src/__tests__/utils-for-testing/types/props-types';
describe('broadcast tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestBroadcast;
  methods.config();
  it('Must show broadcast dialog, with canWhitelist as true', async () => {
    const { asFragment } = render(<Broadcast {...props} />);
    expect(asFragment()).toMatchSnapshot(
      'Request Broadcast with loading and canWhitelist true',
    );
  });
  it('Must show broadcast dialog, with canWhitelist as false', async () => {
    const clonedProps = objects.clone(props) as PropsRequestBroadcast;
    clonedProps.data.method = KeychainKeyTypes.active;
    const { asFragment } = render(<Broadcast {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request Broadcast with loading and canWhitelist false',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Broadcast {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<Broadcast {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<Broadcast {...props} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.sendMessage).toBeCalledWith({
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

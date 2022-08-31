import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import SignBuffer from 'src/dialog/pages/requests/sign-buffer';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestSignBuffer from 'src/__tests__/utils-for-testing/data/props/dialog/request-signBuffer';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestSignBuffer } from 'src/__tests__/utils-for-testing/types/props-types';
describe('sign-buffer tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestSignBuffer;
  methods.config();
  it('Must show SignBuffer dialog(AnonymousRequest, known user, canwhitelist)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSignBuffer;
    delete clonedProps.accounts;
    delete clonedProps.data.title;
    clonedProps.data.username = mk.user.one;
    clonedProps.data.method = KeychainKeyTypes.posting;
    const { asFragment } = render(<SignBuffer {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request SignBuffer AnonymousRequest, known user, canwhitelist',
    );
  });
  it('Must show SignBuffer dialog(unknown, long message, no whitelisting)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestSignBuffer;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    delete clonedProps.data.username;
    clonedProps.data.method = KeychainKeyTypes.active;
    clonedProps.data.message = 'paracutirimicuaro '.repeat(80);
    const { asFragment } = render(<SignBuffer {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request SignBuffer unknown, long message, no whitelisting)',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<SignBuffer {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<SignBuffer {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<SignBuffer {...props} />);
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

import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import SignTx from 'src/dialog/pages/requests/sign-tx';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestSignTx from 'src/__tests__/utils-for-testing/data/props/dialog/request-signTx';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestsSignTx } from 'src/__tests__/utils-for-testing/types/props-types';
describe('sign-tx tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestSignTx;
  methods.config();
  it('Must show SignTx dialog(canwhitelist)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestsSignTx;
    clonedProps.data.method = KeychainKeyTypes.posting;
    const { asFragment } = render(<SignTx {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request SignTx canwhitelist');
  });
  it('Must show SignTx dialog(no whitelisting)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestsSignTx;
    clonedProps.data.method = KeychainKeyTypes.active;
    const { asFragment } = render(<SignTx {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request SignTx no whitelisting)');
  });
  it('Must call window.close when clicking on cancel', async () => {
    const clonedProps = objects.clone(props) as PropsRequestsSignTx;
    clonedProps.data.method = KeychainKeyTypes.active;
    render(<SignTx {...clonedProps} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestsSignTx;
    clonedProps.data.method = KeychainKeyTypes.active;
    render(<SignTx {...{ ...clonedProps, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestsSignTx;
    clonedProps.data.method = KeychainKeyTypes.active;
    render(<SignTx {...clonedProps} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.sendMessage).toBeCalledWith({
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

import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import CustomJson from 'src/dialog/pages/requests/custom-json';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestCustomJSON from 'src/__tests__/utils-for-testing/data/props/dialog/request-customJSON';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestCustomJSON } from 'src/__tests__/utils-for-testing/types/props-types';
describe('custom-json tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestCustomJSON;
  methods.config();
  it('Must show CustomJson dialog(AnonymousRequest, canWhiteList)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestCustomJSON;
    delete clonedProps.accounts;
    clonedProps.data.method = KeychainKeyTypes.posting;
    const { asFragment } = render(<CustomJson {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request CustomJson AnonymousRequest canWhiteList',
    );
  });
  it('Must show CustomJson dialog without can white list', async () => {
    const clonedProps = objects.clone(props) as PropsRequestCustomJSON;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    clonedProps.data.method = KeychainKeyTypes.active;
    const { asFragment } = render(<CustomJson {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request CustomJson no whitelist');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<CustomJson {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<CustomJson {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<CustomJson {...props} />);
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

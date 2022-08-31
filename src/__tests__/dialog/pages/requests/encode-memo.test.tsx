import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import EncodeMemo from 'src/dialog/pages/requests/encode-memo';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestEncodeMemo from 'src/__tests__/utils-for-testing/data/props/dialog/request-encodeMemo';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestEncodeMemo } from 'src/__tests__/utils-for-testing/types/props-types';
describe('encode-memo tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestEncodeMemo;
  methods.config();
  it('Must show EncodeMemo dialog as canWhiteList', async () => {
    const clonedProps = objects.clone(props) as PropsRequestEncodeMemo;
    clonedProps.data.method = KeychainKeyTypes.posting;
    const { asFragment } = render(<EncodeMemo {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request EncodeMemo canWhiteList');
  });
  it('Must show EncodeMemo dialog without can white list', async () => {
    const clonedProps = objects.clone(props) as PropsRequestEncodeMemo;
    clonedProps.data.method = KeychainKeyTypes.active;
    const { asFragment } = render(<EncodeMemo {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request EncodeMemo no whitelist');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<EncodeMemo {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<EncodeMemo {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<EncodeMemo {...props} />);
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

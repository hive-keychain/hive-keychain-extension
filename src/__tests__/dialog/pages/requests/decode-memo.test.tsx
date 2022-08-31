import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import DecodeMemo from 'src/dialog/pages/requests/decode-memo';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestDecodeMemo from 'src/__tests__/utils-for-testing/data/props/dialog/request-decodeMemo';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestDecodeMemo } from 'src/__tests__/utils-for-testing/types/props-types';
describe('decode-memo tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestDecodeMemo;
  methods.config();
  it('Must show DecodeMemo dialog as canWhiteList', async () => {
    const clonedProps = objects.clone(props) as PropsRequestDecodeMemo;
    clonedProps.data.method = KeychainKeyTypes.posting;
    const { asFragment } = render(<DecodeMemo {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request DecodeMemo canWhiteList');
  });
  it('Must show DecodeMemo dialog without can white list', async () => {
    const clonedProps = objects.clone(props) as PropsRequestDecodeMemo;
    clonedProps.data.method = KeychainKeyTypes.active;
    const { asFragment } = render(<DecodeMemo {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request DecodeMemo no whitelist');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<DecodeMemo {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<DecodeMemo {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<DecodeMemo {...props} />);
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

import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Proxy from 'src/dialog/pages/requests/proxy';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestProxy from 'src/__tests__/utils-for-testing/data/props/dialog/request-proxy';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestProxy } from 'src/__tests__/utils-for-testing/types/props-types';
describe('proxy tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestProxy;
  methods.config();
  it('Must show Proxy dialog(AnonymousRequest)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestProxy;
    delete clonedProps.accounts;
    const { asFragment } = render(<Proxy {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Proxy AnonymousRequest');
  });
  it('Must show Proxy dialog', async () => {
    const clonedProps = objects.clone(props) as PropsRequestProxy;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    const { asFragment } = render(<Proxy {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Proxy');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Proxy {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<Proxy {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<Proxy {...props} />);
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

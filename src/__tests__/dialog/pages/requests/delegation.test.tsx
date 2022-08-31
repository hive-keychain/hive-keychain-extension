import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Delegation from 'src/dialog/pages/requests/delegation';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestDelegation from 'src/__tests__/utils-for-testing/data/props/dialog/request-delegation';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestDelegation } from 'src/__tests__/utils-for-testing/types/props-types';
describe('delegation tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestDelegation;
  methods.config();
  it('Must show Delegation dialog(AnonymousRequest)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestDelegation;
    delete clonedProps.accounts;
    const { asFragment } = render(<Delegation {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request CustomJson AnonymousRequest');
  });
  it('Must show Delegation dialog', async () => {
    const clonedProps = objects.clone(props) as PropsRequestDelegation;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    const { asFragment } = render(<Delegation {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Delegation');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Delegation {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<Delegation {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<Delegation {...props} />);
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

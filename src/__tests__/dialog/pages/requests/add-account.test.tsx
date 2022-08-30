import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import AddAccount from 'src/dialog/pages/requests/add-account';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestAddAccount from 'src/__tests__/utils-for-testing/data/props/dialog/request-addAccount';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestAddAccount } from 'src/__tests__/utils-for-testing/types/props-types';
describe('add-account tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestAddAccount;
  methods.config();
  it('Must show add account dialog', async () => {
    const clonedProps = objects.clone(props) as PropsRequestAddAccount;
    clonedProps.data.keys = {};
    const { asFragment } = render(<AddAccount {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request AddAccount with loading');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<AddAccount {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<AddAccount {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<AddAccount {...props} />);
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

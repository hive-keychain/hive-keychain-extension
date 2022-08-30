import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import AddAccountAuthority from 'src/dialog/pages/requests/authority/add-account-authority';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestAddAccountAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-addAccountAuthority';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('add-account-authority tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestAddAccountAuthority;
  methods.config();
  it('Must show add account authority dialog', async () => {
    const { asFragment } = render(<AddAccountAuthority {...props} />);
    expect(asFragment()).toMatchSnapshot(
      'Request AddAccountAuthority with loading',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<AddAccountAuthority {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(
      <AddAccountAuthority {...{ ...props, onConfirm: spies.onConfirm }} />,
    );
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<AddAccountAuthority {...props} />);
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

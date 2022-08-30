import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import AddKeyAuthority from 'src/dialog/pages/requests/authority/add-key-authority';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestAddKeyAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-addKeyAuthority';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('add-key-authority tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestAddKeyAuthority;
  methods.config();
  it('Must show add key authority dialog', async () => {
    const { asFragment } = render(<AddKeyAuthority {...props} />);
    expect(asFragment()).toMatchSnapshot(
      'Request AddKeyAuthority with loading',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<AddKeyAuthority {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<AddKeyAuthority {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<AddKeyAuthority {...props} />);
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

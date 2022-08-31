import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import CreateClaimedAccount from 'src/dialog/pages/requests/create-claimed-account';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestCreateClaimedAccount from 'src/__tests__/utils-for-testing/data/props/dialog/request-createClaimedAccount';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('create-claimed-account tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestCreateClaimedAccount;
  methods.config();
  it('Must show CreateClaimedAccount dialog', async () => {
    const { asFragment } = render(<CreateClaimedAccount {...props} />);
    expect(asFragment()).toMatchSnapshot('Request CreateClaimedAccount');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<CreateClaimedAccount {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(
      <CreateClaimedAccount {...{ ...props, onConfirm: spies.onConfirm }} />,
    );
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<CreateClaimedAccount {...props} />);
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

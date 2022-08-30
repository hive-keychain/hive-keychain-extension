import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import CreateProposal from 'src/dialog/pages/requests/proposals/create-proposal';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestProposals from 'src/__tests__/utils-for-testing/data/props/dialog/request-proposals';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('create-proposal tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestProposals.create;
  methods.config();
  it('Must show create proposal dialog', async () => {
    const { asFragment } = render(<CreateProposal {...props} />);
    expect(asFragment()).toMatchSnapshot('Request CreateProposal with loading');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<CreateProposal {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<CreateProposal {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<CreateProposal {...props} />);
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

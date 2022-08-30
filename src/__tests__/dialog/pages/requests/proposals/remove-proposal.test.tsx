import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import RemoveProposal from 'src/dialog/pages/requests/proposals/remove-proposal';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestProposals from 'src/__tests__/utils-for-testing/data/props/dialog/request-proposals';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestRemoveProposal } from 'src/__tests__/utils-for-testing/types/props-types';
describe('remove-proposal tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestProposals.remove;
  methods.config();
  it('Must show remove proposal dialog passing string', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRemoveProposal;
    clonedProps.data.proposal_ids = JSON.stringify(['1', '2', '3']);
    const { asFragment } = render(<RemoveProposal {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request RemoveProposal, ids as string with loading',
    );
  });
  it('Must show remove proposal dialog passing array', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRemoveProposal;
    clonedProps.data.proposal_ids = [1, 2, 3];
    const { asFragment } = render(<RemoveProposal {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request RemoveProposal, ids as array with loading',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRemoveProposal;
    clonedProps.data.proposal_ids = JSON.stringify(['1']);
    render(<RemoveProposal {...clonedProps} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRemoveProposal;
    clonedProps.data.proposal_ids = JSON.stringify(['1']);
    render(
      <RemoveProposal {...{ ...clonedProps, onConfirm: spies.onConfirm }} />,
    );
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRemoveProposal;
    clonedProps.data.proposal_ids = JSON.stringify(['1']);
    render(<RemoveProposal {...clonedProps} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: clonedProps.data,
        tab: clonedProps.tab,
        domain: clonedProps.domain,
        keep: false,
      },
    });
  });
});

import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import Vote from 'src/dialog/pages/requests/vote';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestVote from 'src/__tests__/utils-for-testing/data/props/dialog/request-vote';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestVote } from 'src/__tests__/utils-for-testing/types/props-types';
describe('vote tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestVote;
  methods.config();
  it('Must show Vote dialog', async () => {
    const { asFragment } = render(<Vote {...props} />);
    await waitFor(() => {});
    expect(asFragment()).toMatchSnapshot('Request Vote');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Vote {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestVote;
    render(<Vote {...{ ...clonedProps, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const spySendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    render(<Vote {...props} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spySendMessage).toBeCalledWith({
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

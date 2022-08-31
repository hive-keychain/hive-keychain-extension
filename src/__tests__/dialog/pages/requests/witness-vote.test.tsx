import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import WitnessVote from 'src/dialog/pages/requests/witness-vote';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestWitnessVote from 'src/__tests__/utils-for-testing/data/props/dialog/request-witnessVote';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestWitnessVote } from 'src/__tests__/utils-for-testing/types/props-types';
describe('witness-vote tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestWitnessVote;
  methods.config();
  it('Must show WitnessVote dialog', async () => {
    const { asFragment } = render(<WitnessVote {...props} />);
    expect(asFragment()).toMatchSnapshot('Request WitnessVote');
  });
  it('Must show WitnessVote dialog(AnonymousRequest)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestWitnessVote;
    delete clonedProps.accounts;
    const { asFragment } = render(<WitnessVote {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request WitnessVote AnonymousRequest',
    );
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<WitnessVote {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<WitnessVote {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<WitnessVote {...props} />);
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

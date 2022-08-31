import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import RecurrentTransfer from 'src/dialog/pages/requests/recurrent-transfer';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import requestRecurrentTransfer from 'src/__tests__/utils-for-testing/data/props/dialog/request-recurrentTransfer';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestRecurrentTransfer } from 'src/__tests__/utils-for-testing/types/props-types';
describe('recurrent-transfer tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestRecurrentTransfer;
  methods.config();
  it('Must show RecurrentTransfer dialog(AnonymousRequest, encrypted memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRecurrentTransfer;
    delete clonedProps.accounts;
    clonedProps.data.memo = '#To Encrypt memo';
    const { asFragment } = render(<RecurrentTransfer {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot(
      'Request RecurrentTransfer AnonymousRequest, enc memo',
    );
  });
  it('Must show RecurrentTransfer dialog(no memo)', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRecurrentTransfer;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    clonedProps.data.memo = 'Regular memo!';
    clonedProps.data.recurrence = 72;
    const { asFragment } = render(<RecurrentTransfer {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request RecurrentTransfer no memo');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<RecurrentTransfer {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<RecurrentTransfer {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    const clonedProps = objects.clone(props) as PropsRequestRecurrentTransfer;
    clonedProps.accounts = [mk.user.one, mk.user.two];
    clonedProps.data.memo = 'Regular memo!';
    clonedProps.data.recurrence = 300;
    render(<RecurrentTransfer {...clonedProps} />);
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

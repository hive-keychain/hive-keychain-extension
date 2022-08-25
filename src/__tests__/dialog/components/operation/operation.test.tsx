import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alSelect from 'src/__tests__/utils-for-testing/aria-labels/al-select';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import operation from 'src/__tests__/utils-for-testing/data/props/dialog/operation';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { PropsOperation } from 'src/__tests__/utils-for-testing/interfaces/test-objects';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('operation tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = operation;
  methods.config();
  it('Must render operation component', async () => {
    render(<Operation {...props} />);
    assertion.getByLabelText(alComponent.dialog.operation);
    await assertion.toHaveClass(
      alDiv.container.loading,
      'loading-container hide',
    );
  });
  it('Must show white_list operation', async () => {
    render(<Operation {...{ ...props, canWhitelist: true }} />);
    await assertion.findLabelChildren(alDiv.operation.whiteList, 1);
  });
  it('Must call to setUsername to select account', async () => {
    render(<Operation {...props} />);
    await clickAwait([alSelect.accountSelector]);
    await clickAwait([mk.user.two]);
    expect(props.setUsername).toBeCalledWith(mk.user.two);
  });
  it('Must call window close on click', async () => {
    render(<Operation {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call sendMessage on confirm and show loading', async () => {
    const noOnConfirm = objects.clone(props) as PropsOperation;
    delete noOnConfirm.onConfirm;
    render(<Operation {...noOnConfirm} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: noOnConfirm.data,
        tab: noOnConfirm.tab,
        domain: noOnConfirm.domain,
        keep: false,
      },
    });
    await assertion.toHaveClass(alDiv.container.loading, 'loading-container');
  });
  it('Must call onConfirm when click and show loading', async () => {
    render(<Operation {...props} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(props.onConfirm).toBeCalledTimes(1);
    await assertion.toHaveClass(alDiv.container.loading, 'loading-container');
  });
  it.todo('tests on checkbox to set keep');
  it.todo('tests to show checkboxLabelOverride');
});

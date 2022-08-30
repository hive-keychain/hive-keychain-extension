import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import PowerDown from 'src/dialog/pages/requests/power/power-down';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestPowerDown from 'src/__tests__/utils-for-testing/data/props/dialog/request-powerDown';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('power-down tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestPowerDown;
  methods.config();
  it('Must show power down dialog', async () => {
    const { asFragment } = render(<PowerDown {...props} />);
    expect(asFragment()).toMatchSnapshot('Request PowerDown with loading');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<PowerDown {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<PowerDown {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<PowerDown {...props} />);
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

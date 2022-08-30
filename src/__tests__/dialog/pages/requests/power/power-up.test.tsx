import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import PowerUp from 'src/dialog/pages/requests/power/power-up';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestPowerUp from 'src/__tests__/utils-for-testing/data/props/dialog/request-powerUp';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
describe('power-up tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestPowerUp;
  methods.config();
  it('Must show power up dialog', async () => {
    const { asFragment } = render(<PowerUp {...props} />);
    expect(asFragment()).toMatchSnapshot('Request PowerUp with loading');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<PowerUp {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<PowerUp {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<PowerUp {...props} />);
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

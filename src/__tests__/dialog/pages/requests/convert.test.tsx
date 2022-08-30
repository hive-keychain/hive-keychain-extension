import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Convert from 'src/dialog/pages/requests/convert';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestConvert from 'src/__tests__/utils-for-testing/data/props/dialog/request-convert';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestConvert } from 'src/__tests__/utils-for-testing/types/props-types';
describe('convert tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestConvert;
  methods.config();
  it('Must show non collaterized convert', async () => {
    const { asFragment } = render(<Convert {...props} />);
    expect(asFragment()).toMatchSnapshot('Request Convert as not collaterized');
  });
  it('Must show collaterized convert', async () => {
    const clonedProps = objects.clone(props) as PropsRequestConvert;
    clonedProps.data.collaterized = true;
    const { asFragment } = render(<Convert {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Convert as collaterized');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Convert {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<Convert {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<Convert {...props} />);
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

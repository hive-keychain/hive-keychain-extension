import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Post from 'src/dialog/pages/requests/post';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import requestPost from 'src/__tests__/utils-for-testing/data/props/dialog/request-post';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { clickAwait } from 'src/__tests__/utils-for-testing/setups/events';
import { PropsRequestPost } from 'src/__tests__/utils-for-testing/types/props-types';
describe('post tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestPost;
  methods.config();
  it('Must show Post dialog with title', async () => {
    const clonedProps = objects.clone(props) as PropsRequestPost;
    clonedProps.data.title = 'Greatest Post title of all time!';
    const { asFragment } = render(<Post {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Post title');
  });
  it('Must show Post dialog without title', async () => {
    const clonedProps = objects.clone(props) as PropsRequestPost;
    delete clonedProps.data.title;
    const { asFragment } = render(<Post {...clonedProps} />);
    expect(asFragment()).toMatchSnapshot('Request Post no title');
  });
  it('Must call window.close when clicking on cancel', async () => {
    render(<Post {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must call onConfirm when clicking on confirm', async () => {
    render(<Post {...{ ...props, onConfirm: spies.onConfirm }} />);
    await clickAwait([alButton.dialog.confirm]);
    expect(spies.onConfirm).toBeCalledTimes(1);
  });
  it('Must call sendMessage when clicking on confirm', async () => {
    render(<Post {...props} />);
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

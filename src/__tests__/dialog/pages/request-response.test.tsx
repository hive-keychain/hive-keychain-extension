import { render } from '@testing-library/react';
import React from 'react';
import RequestResponse from 'src/dialog/pages/request-response';
import pagesMocks from 'src/__tests__/dialog/pages/mocks/pages-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import {
  actPendingTimers,
  clickAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
import { PropsResultMessage } from 'src/__tests__/utils-for-testing/types/props-types';
describe('request-confirmation tests:\n', () => {
  const { methods, spies } = pagesMocks;
  methods.config();
  const props = {
    data: {
      msg: { message: 'message', success: true },
    } as PropsResultMessage,
  };
  it('Must show RequestResponse as success and call close automatically', async () => {
    render(<RequestResponse {...props} />);
    await actPendingTimers();
    await assertion.awaitFindText(
      `${testsI18n.get('dialog_header_success')} !`,
    );
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
  it('Must show RequestResponse as error', async () => {
    props.data.msg.success = false;
    render(<RequestResponse {...props} />);
    await assertion.awaitFindText(`${testsI18n.get('dialog_header_error')} !`);
  });
  it('Must close when click close', async () => {
    props.data.msg.success = false;
    render(<RequestResponse {...props} />);
    await clickAwait([alButton.close]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
});

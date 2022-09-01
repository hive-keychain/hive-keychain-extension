import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { render } from '@testing-library/react';
import React from 'react';
import Unlock from 'src/dialog/pages/unlock';
import pagesMocks from 'src/__tests__/dialog/pages/mocks/pages-mocks';
import alButton from 'src/__tests__/utils-for-testing/aria-labels/al-button';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import alInput from 'src/__tests__/utils-for-testing/aria-labels/al-input';
import unlockMessage from 'src/__tests__/utils-for-testing/data/props/dialog/unlock-message';
import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import {
  clickAwait,
  clickTypeAwait,
} from 'src/__tests__/utils-for-testing/setups/events';
describe('unlock tests:\n', () => {
  const { methods, spies } = pagesMocks;
  const { props } = unlockMessage;
  methods.config();
  it('Must show wrong password and not loading', async () => {
    render(<Unlock {...props} />);
    await assertion.awaitFindText(testsI18n.get('dialog_header_wrong_pwd'));
    await assertion.toHaveClass(
      alDiv.container.loading,
      'loading-container hide',
    );
  });
  it('Must call sendMessage and show as loading, when hit enter', async () => {
    render(<Unlock {...props} />);
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: 'Str0ngP4assw..rd!^${enter}',
      },
    ]);
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        data: props.data,
        tab: props.data.tab,
        mk: 'Str0ngP4assw..rd!^$',
        domain: props.data.domain,
        request_id: undefined,
      },
    });
    await assertion.toHaveClass(alDiv.container.loading, 'loading-container');
  });
  it('Must call sendMessage and show as loading, when click', async () => {
    render(<Unlock {...props} />);
    await clickTypeAwait([
      {
        ariaLabel: alInput.password,
        event: EventType.TYPE,
        text: 'Str0ngP4assw..rd!^$',
      },
      {
        ariaLabel: alButton.dialog.unlock,
        event: EventType.CLICK,
      },
    ]);
    expect(spies.sendMessage).toBeCalledWith({
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        data: props.data,
        tab: props.data.tab,
        mk: 'Str0ngP4assw..rd!^$',
        domain: props.data.domain,
        request_id: undefined,
      },
    });
    await assertion.toHaveClass(alDiv.container.loading, 'loading-container');
  });
  it('Must close when click close', async () => {
    render(<Unlock {...props} />);
    await clickAwait([alButton.dialog.cancel]);
    expect(spies.closeWindow).toBeCalledTimes(1);
  });
});

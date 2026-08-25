import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ConfigFormUpdateAction,
  NotificationConfigForm,
  NotificationConfigFormItem,
} from 'src/interfaces/notifications.interface';
import { NotificationConfigItemComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item.component';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: ({ ariaLabel, onClick }: any) =>
    onClick ? (
      <button type="button" aria-label={ariaLabel} onClick={onClick} />
    ) : null,
}));

jest.mock(
  'src/popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item-condition.component',
  () => ({
    NotificationConfigItemConditionComponent: () => <div>Condition fields</div>,
  }),
);

beforeEach(() => {
  jest
    .spyOn(I18nUtils, 'getMessage')
    .mockImplementation((key: string) => key);
});

describe('NotificationConfigItemComponent', () => {
  it('expands and collapses the conditions with Enter and Space', async () => {
    const user = userEvent.setup();
    const configFormItem = {
      operation: 'transfer',
      conditions: [],
    } as NotificationConfigFormItem;
    const configForm = [configFormItem] as NotificationConfigForm;
    render(
      <NotificationConfigItemComponent
        configForm={configForm}
        configFormItem={configFormItem}
        updateConfig={jest.fn()}
        configFormItemIndex={0}
      />,
    );

    const disclosure = screen.getByRole('button', { name: 'Transfer' });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');

    disclosure.focus();
    await user.keyboard('{Enter}');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById('notification-criteria-0-conditions'),
    ).toBeInTheDocument();

    await user.keyboard(' ');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(
      document.getElementById('notification-criteria-0-conditions'),
    ).not.toBeInTheDocument();
  });

  it('deletes the selected condition from the keyboard', async () => {
    const user = userEvent.setup();
    const updateConfig = jest.fn();
    const configFormItem = {
      operation: 'transfer',
      conditions: [
        { field: 'from', operand: 'eq', value: 'alice' },
        { field: 'to', operand: 'eq', value: 'bob' },
      ],
    } as NotificationConfigFormItem;
    const configForm = [configFormItem] as NotificationConfigForm;
    render(
      <NotificationConfigItemComponent
        configForm={configForm}
        configFormItem={configFormItem}
        updateConfig={updateConfig}
        configFormItemIndex={0}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Transfer' }));
    const deleteSecondCondition = screen.getByRole('button', {
      name: 'html_popup_delete_condition 2',
    });

    deleteSecondCondition.focus();
    await user.keyboard('{Enter}');

    expect(updateConfig).toHaveBeenCalledWith(
      0,
      1,
      null,
      ConfigFormUpdateAction.DELETE_CONDITION,
    );
  });

  it('renders browser channel toggle on the criteria row when provided', async () => {
    const user = userEvent.setup();
    const onChannelPrefChange = jest.fn();
    const configFormItem = {
      operation: 'transfer',
      conditions: [],
    } as NotificationConfigFormItem;

    render(
      <NotificationConfigItemComponent
        configForm={[configFormItem]}
        configFormItem={configFormItem}
        updateConfig={jest.fn()}
        configFormItemIndex={0}
        channelPref={{ browser: false }}
        onChannelPrefChange={onChannelPrefChange}
      />,
    );

    expect(
      screen.getByTestId('notification-channel-pref-transfer'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('notification-channel-drop-transfer'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('notification-channel-browser-transfer'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByTestId('notification-channel-browser-transfer'),
    );
    expect(onChannelPrefChange).toHaveBeenCalledWith('browser', true);
  });
});

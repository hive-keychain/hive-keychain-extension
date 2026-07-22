import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  NotificationConfigForm,
  NotificationConfigFormItem,
} from 'src/interfaces/notifications.interface';
import { NotificationConfigItemComponent } from 'src/popup/hive/pages/app-container/settings/user-preferences/notifications/notification-config-item/notification-config-item.component';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

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

    const disclosure = screen.getByRole('button', { name: 'transfer' });
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
});

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Theme } from 'src/popup/theme.context';
import { NotificationsAdvancedConfig } from 'src/peakd-notifications-config/notifications-advanced-config.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { PeakDNotificationsUtils } from 'src/popup/hive/utils/notifications/peakd-notifications.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import VaultUtils from 'src/utils/vault.utils';

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));

jest.mock('src/common-ui/back-to-top-button/back-to-top-button.component', () => ({
  BackToTopButton: () => null,
}));

describe('NotificationsAdvancedConfig', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
    HTMLElement.prototype.scrollIntoView = jest.fn();
    jest
      .spyOn(LocalStorageUtils, 'getMultipleValueFromLocalStorage')
      .mockResolvedValue({
        ACTIVE_THEME: Theme.LIGHT,
        active_account_name: 'alice',
      });
    jest.spyOn(VaultUtils, 'getValueFromVault').mockResolvedValue('mk');
    jest
      .spyOn(AccountUtils, 'getAccountsFromLocalStorage')
      .mockResolvedValue([{ name: 'alice', keys: {} }] as any);
    jest
      .spyOn(PeakDNotificationsUtils, 'getAccountConfig')
      .mockResolvedValue({ config: [] } as any);
    jest
      .spyOn(PeakDNotificationsUtils, 'initializeForm')
      .mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds entered criteria with the keyboard', async () => {
    const user = userEvent.setup();
    render(<NotificationsAdvancedConfig />);

    const addButton = await screen.findByRole('button', {
      name: 'html_popup_add_new_criteria',
    });
    const criteriaInput = screen.getByRole('textbox');
    await user.type(criteriaInput, 'transfer');
    addButton.focus();
    await user.keyboard(' ');

    const criteriaDisclosure = await screen.findByRole('button', {
      name: 'Transfer',
    });
    expect(criteriaDisclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById('notification-criteria-0-conditions'),
    ).toBeInTheDocument();
    expect(criteriaInput).toHaveValue('');
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('renders push notification toggle on each configured criteria row', async () => {
    jest.spyOn(PeakDNotificationsUtils, 'getAccountConfig').mockResolvedValue({
      config: [{ operation: 'transfer' }],
    } as any);
    jest.spyOn(PeakDNotificationsUtils, 'initializeForm').mockReturnValue([
      {
        operation: 'transfer',
        pushNotification: true,
        conditions: [{ field: 'to', operand: '==', value: 'alice' }],
      },
    ]);

    render(<NotificationsAdvancedConfig />);

    expect(
      await screen.findByTestId('notification-channel-pref-transfer'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('notification-channel-browser-transfer'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('notification-channel-pref-vote'),
    ).not.toBeInTheDocument();
  });

  it('does not render push notification toggles when account config is empty', async () => {
    render(<NotificationsAdvancedConfig />);

    await screen.findByRole('button', {
      name: 'html_popup_add_new_criteria',
    });

    expect(
      screen.queryByTestId('notification-channel-pref-transfer'),
    ).not.toBeInTheDocument();
  });
});

import AccountUtils from '@hiveapp/utils/account.utils';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('change-password.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.PASSWORD),
      );
    });
  });
  it('Must show message and page', () => {
    expect(
      screen.getByTestId(`${Screen.SETTINGS_CHANGE_PASSWORD}-page`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        chrome.i18n.getMessage('popup_html_change_password_text'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  describe('Click cases:\n', () => {
    it('Must show error when wrong old password after click', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          'wrong_old_password',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'new_one1234',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'new_one1234',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.submit));
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('wrong_password')),
      ).toBeInTheDocument();
    });

    it('Must show error when different new password confirmation after click', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'new_one1234',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'different_confirmation1234',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.submit));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_password_mismatch'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error when new password not valid after click', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'notgoodpas',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'notgoodpas',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.submit));
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_password_regex')),
      ).toBeInTheDocument();
    });

    it('Must set new password, show message and go home page after click', async () => {
      AccountUtils.saveAccounts = jest.fn();
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'valid16CharactersPLUS',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'valid16CharactersPLUS',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.submit));
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_master_changed')),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('Enter press cases:\n', () => {
    it('Must show error when wrong old password after hitting enter', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          'wrong_old_password',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'new_one1234',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'new_one1234{enter}',
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('wrong_password')),
      ).toBeInTheDocument();
    });

    it('Must show error when different new password confirmation after hitting enter', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'new_one1234',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'different_confirmation1234{enter}',
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_password_mismatch'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error when new password not valid after hitting enter', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'notgoodpas',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'notgoodpas{enter}',
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_password_regex')),
      ).toBeInTheDocument();
    });

    it('Must set new password, show message and go home page after hitting enter', async () => {
      AccountUtils.saveAccounts = jest.fn();
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.old),
          mk.user.one,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.new),
          'valid16CharactersPLUS',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.changePassword.confirmation),
          'valid16CharactersPLUS{enter}',
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_master_changed')),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
    });
  });
});

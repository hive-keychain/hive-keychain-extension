import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';
describe('automated-tasks.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('Stored data:\n', () => {
    describe('Max mana greater than freeAccount credits:\n', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <App />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getRCMana: {
                    current_mana: 1000,
                    percentage: 100,
                    max_mana: Config.claims.freeAccount.MIN_RC + 1,
                    received_delegated_rc: 0,
                    max_rc: Config.claims.freeAccount.MIN_RC * 1.5 + 1,
                    delegated_rc: 0,
                    rc_manabar: {
                      current_mana: '10000000',
                      last_update_time: 12233433,
                    },
                  },
                },
              },
              localStorageRelated: {
                LocalStorageUtils: {
                  getMultipleValueFromLocalStorage: {
                    claimAccounts: {
                      'keychain.tests': true,
                    },
                    claimRewards: {
                      'keychain.tests': true,
                    },
                    claimSavings: {
                      'keychain.tests': true,
                    },
                  },
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
          await userEvent.click(
            screen.getByTestId(dataTestIdButton.menuPreFix + Icons.PREFERENCES),
          );
          await userEvent.click(
            screen.getByTestId(
              dataTestIdButton.menuPreFix + Icons.AUTOMATED_TASKS,
            ),
          );
        });
      });
      it('Must load component and show messages', () => {
        expect(
          screen.getByTestId(`${Screen.SETTINGS_AUTOMATED_TASKS}-page`),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            chrome.i18n.getMessage('popup_html_automated_intro'),
            { exact: true },
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            chrome.i18n.getMessage(
              'popup_html_enable_autoclaim_accounts_info',
              [Config.claims.freeAccount.MIN_RC_PCT + ''],
            ),
            { exact: true },
          ),
        ).toBeInTheDocument();
      });

      it('Must call sendMessage', async () => {
        LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValue({
            'keychain.tests': false,
          });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdCheckbox.automatedTasks.checkbox.claim.accounts,
            ),
          );
        });
        expect(jest.spyOn(chrome.runtime, 'sendMessage')).toBeCalledTimes(2);
      });

      it('Must call sendMessage', async () => {
        LocalStorageUtils.getValueFromLocalStorage = jest
          .fn()
          .mockResolvedValue({
            'keychain.tests': false,
          });
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdCheckbox.automatedTasks.checkbox.claim.accounts,
            ),
          );
        });
        expect(jest.spyOn(chrome.runtime, 'sendMessage')).toBeCalledTimes(2);
      });
    });
  });
});

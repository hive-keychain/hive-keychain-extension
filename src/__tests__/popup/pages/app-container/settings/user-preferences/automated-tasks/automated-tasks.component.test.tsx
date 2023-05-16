import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import arialabelCheckbox from 'src/__tests__/utils-for-testing/aria-labels/aria-label-checkbox';
import ariaLabelComponent from 'src/__tests__/utils-for-testing/aria-labels/aria-label-component';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import Config from 'src/config';
import LocalStorageUtils from 'src/utils/localStorage.utils';
describe('automated-tasks.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
          await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.menuPreFix + Icons.PREFERENCES,
            ),
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.menuPreFix + Icons.AUTOMATED_TASKS,
            ),
          );
        });
      });
      it('Must load component and show messages', () => {
        expect(
          screen.getByLabelText(
            ariaLabelComponent.userPreferences.automatedTasks,
          ),
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
            screen.getByLabelText(
              arialabelCheckbox.automatedTasks.checkbox.claim.accounts,
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
            screen.getByLabelText(
              arialabelCheckbox.automatedTasks.checkbox.claim.accounts,
            ),
          );
        });
        expect(jest.spyOn(chrome.runtime, 'sendMessage')).toBeCalledTimes(2);
      });
    });
  });
});

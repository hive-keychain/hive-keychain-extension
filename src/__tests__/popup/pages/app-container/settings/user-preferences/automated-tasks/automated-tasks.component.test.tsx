import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import Config from 'src/config';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
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
          <HiveAppComponent />,
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
            I18nUtils.getMessage('popup_html_automated_intro'),
            { exact: true },
          ),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            I18nUtils.getMessage(
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
        const sendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
        sendMessage.mockClear();
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdCheckbox.automatedTasks.checkbox.claim.accounts,
            ),
          );
        });
        expect(sendMessage).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Hive Engine auto-stake tokens:\n', () => {
    it('does not render a zero when no staking-enabled tokens are available', async () => {
      const initialState = {
        ...initialStates.iniStateAs.defaultExistent,
        hive: {
          ...initialStates.iniStateAs.defaultExistent.hive,
          userTokens: {
            loading: true,
            list: [],
          },
        },
      };
      const store = await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialState,
        {
          navigateToAfterMount: Screen.SETTINGS_AUTOMATED_TASKS,
          app: {
            accountsRelated: {
              TokensUtils: {
                getUserBalance: [],
              },
            },
          },
        },
      );

      await waitFor(() => {
        expect(store.getState().hive.userTokens.loading).toBe(false);
      });

      const autoStakeCheckbox = screen.getByTestId(
        'checkbox-autostake-tokens',
      );
      const hiveEngineTasks = autoStakeCheckbox.closest('.tasks');

      expect(hiveEngineTasks).not.toBeNull();
      const renderedTextNodes = Array.from(hiveEngineTasks!.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .filter(Boolean);

      expect(renderedTextNodes).not.toContain('0');
    });
  });
});

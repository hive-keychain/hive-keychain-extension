import { DefaultAccountHistoryApis } from '@interfaces/hive-engine-rpc.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdImg from 'src/__tests__/utils-for-testing/data-testid/data-testid-img';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
describe('tokens-settings.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const actionButtonTokenIconName = ActionButtonList.find((actionButton) =>
    actionButton.label.includes('token'),
  )?.icon;
  const customAccountHistoryApiUrl = 'https://saturnoman.com/accountHistory';
  describe('Account History Api selector:\n', () => {
    describe('With custom account history nodes', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              localStorageRelated: {
                customData: {
                  accountHistoryApi: [customAccountHistoryApiUrl],
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdIcon.tokens.settings.open),
          );
        });
      });
      it('Must show custom account history api item', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          await screen.findByTestId(
            `${dataTestIdImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).toBeInTheDocument();
      });

      it('Must delete custom account history api, reload rpc list and not show deleted one', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          await screen.findAllByTestId(
            dataTestIdSelect.tokens.settings.items.accountHistoryApi,
          ),
        ).toHaveLength(DefaultAccountHistoryApis.length + 1);
        HiveEngineConfigUtils.getCustomAccountHistoryApi = jest
          .fn()
          .mockResolvedValue([]);
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${dataTestIdImg.tokens.settings.eraseRpcPreFix}${
                customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
              }`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(
              dataTestIdSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          screen.queryByTestId(
            `${dataTestIdImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('With no custom account history', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
        );
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
            ),
          );
          await userEvent.click(
            screen.getByTestId(dataTestIdIcon.tokens.settings.open),
          );
        });
      });

      it('Must not show any custom nodes', () => {
        expect(
          screen.queryByTestId(
            `${dataTestIdImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).not.toBeInTheDocument();
      });

      it('Must show error adding existent account history api node', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.textInput),
            DefaultAccountHistoryApis[0],
          );
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.save,
            ),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_rpc_already_exist'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error adding non valid url', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.textInput),
            'non-valid-@url.@',
          );
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.save,
            ),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_url_not_valid'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error if empty input', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.textInput),
            '{space}',
          );
          await userEvent.click(
            screen.getByTestId(
              dataTestIdIcon.tokens.settings.actions.accountHistory.save,
            ),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_url_not_valid'),
          ),
        ).toBeInTheDocument();
      });
    });
  });
});

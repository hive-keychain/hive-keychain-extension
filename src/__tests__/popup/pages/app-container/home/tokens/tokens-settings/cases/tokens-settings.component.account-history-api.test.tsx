import { DefaultAccountHistoryApis } from '@interfaces/hive-engine-rpc.interface';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelImg from 'src/__tests__/utils-for-testing/aria-labels/aria-label-img';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import ariaLabelSelect from 'src/__tests__/utils-for-testing/aria-labels/aria-label-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
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
          <App />,
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
            screen.getByLabelText(
              `${ariaLabelButton.actionBtn.preFix}${actionButtonTokenIconName}`,
            ),
          );
          await userEvent.click(
            screen.getByLabelText(ariaLabelIcon.tokens.settings.open),
          );
        });
      });
      it('Must show custom account history api item', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          await screen.findByLabelText(
            `${ariaLabelImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).toBeInTheDocument();
      });

      it('Must delete custom account history api, reload rpc list and not show deleted one', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          await screen.findAllByLabelText(
            ariaLabelSelect.tokens.settings.items.accountHistoryApi,
          ),
        ).toHaveLength(DefaultAccountHistoryApis.length + 1);
        HiveEngineConfigUtils.getCustomAccountHistoryApi = jest
          .fn()
          .mockResolvedValue([]);
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              `${ariaLabelImg.tokens.settings.eraseRpcPreFix}${
                customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
              }`,
            ),
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelSelect.tokens.settings.panel.accountHistoryApi,
            ),
          );
        });
        expect(
          screen.queryByLabelText(
            `${ariaLabelImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).not.toBeInTheDocument();
      });
    });

    describe('With no custom account history', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <App />,
          initialStates.iniStateAs.defaultExistent,
        );
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              `${ariaLabelButton.actionBtn.preFix}${actionButtonTokenIconName}`,
            ),
          );
          await userEvent.click(
            screen.getByLabelText(ariaLabelIcon.tokens.settings.open),
          );
        });
      });

      it('Must not show any custom nodes', () => {
        expect(
          screen.queryByLabelText(
            `${ariaLabelImg.tokens.settings.eraseRpcPreFix}${
              customAccountHistoryApiUrl.replace('https://', '').split('/')[0]
            }`,
          ),
        ).not.toBeInTheDocument();
      });

      it('Must show error adding existent account history api node', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.textInput),
            DefaultAccountHistoryApis[0],
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.save,
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
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.textInput),
            'non-valid-@url.@',
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.save,
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
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.add,
            ),
          );
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.textInput),
            '{space}',
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelIcon.tokens.settings.actions.accountHistory.save,
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

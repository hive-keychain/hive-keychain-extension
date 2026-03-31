import { HiveEngineConfigUtils } from '@hiveapp/utils/hive-engine-config.utils';
import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
} from '@interfaces/hive-engine-rpc.interface';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

/** Hive Engine RPC + account-history settings (Settings → RPC nodes). */
describe('rpc-nodes.component Hive Engine settings tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  const customRpc = 'https://saturnoman.com/rpc';
  const rpcFullList = [...DefaultHiveEngineRpcs, customRpc];
  const customAccountHistoryApiUrl = 'https://saturnoman.com/accountHistory';

  const openRpcSettingsPage = async () => {
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
      );
      await userEvent.click(
        screen.getByTestId(dataTestIdButton.menuPreFix + Icons.RPC),
      );
    });
    expect(screen.getByTestId(`${Screen.SETTINGS_RPC_NODES}-page`)).toBeInTheDocument();
  };

  const openHiveEngineDropdown = () => {
    fireEvent.click(screen.getByTestId('hive-engine-rpc-select-handle'));
  };

  const openAccountHistoryDropdown = () => {
    fireEvent.click(screen.getByTestId('hive-account-history-api-select-handle'));
  };

  describe('Hive-Engine RPC selector:\n', () => {
    describe('With custom rpc nodes', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              localStorageRelated: {
                customData: {
                  customRpcList: [customRpc],
                },
              },
            },
          },
        );
        await openRpcSettingsPage();
      });

      it('Must display total of rpc items & find custom rpc', async () => {
        await act(async () => {
          openHiveEngineDropdown();
        });
        const items = screen.getAllByTestId(/^custom-select-item-/);
        expect(items).toHaveLength(rpcFullList.length);
        expect(
          screen.getByTestId(`custom-select-item-${customRpc}`),
        ).toBeInTheDocument();
      });

      it('Must delete custom rpc, reload rpc list and not show deleted one', async () => {
        await act(async () => {
          openHiveEngineDropdown();
        });
        expect(screen.getAllByTestId(/^custom-select-item-/)).toHaveLength(
          rpcFullList.length,
        );
        HiveEngineConfigUtils.getCustomRpcs = jest.fn().mockResolvedValue([]);
        await act(async () => {
          const row = screen.getByTestId(`custom-select-item-${customRpc}`);
          const erase = row.querySelector('.right-action-icon.clickable');
          expect(erase).toBeTruthy();
          await userEvent.click(erase!);
        });
        await act(async () => {
          openHiveEngineDropdown();
        });
        expect(
          screen.queryByTestId(`custom-select-item-${customRpc}`),
        ).not.toBeInTheDocument();
      });
    });

    describe('With no custom rpc', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <HiveAppComponent />,
          initialStates.iniStateAs.defaultExistent,
        );
        await openRpcSettingsPage();
      });

      it('Must display total of default rpc items & not find custom rpc', async () => {
        await act(async () => {
          openHiveEngineDropdown();
        });
        expect(screen.getAllByTestId(/^custom-select-item-/)).toHaveLength(
          DefaultHiveEngineRpcs.length,
        );
        expect(
          screen.queryByTestId(`custom-select-item-${customRpc}`),
        ).not.toBeInTheDocument();
      });

      it('Must show error adding existent rpc', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId('button-hive-engine-rpc-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.hiveEngineRpcUri),
            DefaultHiveEngineRpcs[0],
          );
          await userEvent.click(
            screen.getByTestId('button-hive-engine-rpc-save'),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_rpc_already_exist'),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error adding non valid url rpc', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId('button-hive-engine-rpc-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.hiveEngineRpcUri),
            'non-valid-@url.@',
          );
          await userEvent.click(
            screen.getByTestId('button-hive-engine-rpc-save'),
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
            screen.getByTestId('button-hive-engine-rpc-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.hiveEngineRpcUri),
            '{space}',
          );
          await userEvent.click(
            screen.getByTestId('button-hive-engine-rpc-save'),
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
        await openRpcSettingsPage();
      });

      it('Must show custom account history api item', async () => {
        await act(async () => {
          openAccountHistoryDropdown();
        });
        expect(
          screen.getByTestId(
            `custom-select-item-${customAccountHistoryApiUrl}`,
          ),
        ).toBeInTheDocument();
      });

      it('Must delete custom account history api, reload list and not show deleted one', async () => {
        await act(async () => {
          openAccountHistoryDropdown();
        });
        expect(screen.getAllByTestId(/^custom-select-item-/)).toHaveLength(
          DefaultAccountHistoryApis.length + 1,
        );
        HiveEngineConfigUtils.getCustomAccountHistoryApi = jest
          .fn()
          .mockResolvedValue([]);
        await act(async () => {
          const row = screen.getByTestId(
            `custom-select-item-${customAccountHistoryApiUrl}`,
          );
          const erase = row.querySelector('.right-action-icon.clickable');
          expect(erase).toBeTruthy();
          await userEvent.click(erase!);
        });
        await act(async () => {
          openAccountHistoryDropdown();
        });
        expect(
          screen.queryByTestId(
            `custom-select-item-${customAccountHistoryApiUrl}`,
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
        await openRpcSettingsPage();
      });

      it('Must not show any custom nodes', async () => {
        await act(async () => {
          openAccountHistoryDropdown();
        });
        expect(
          screen.queryByTestId(
            `custom-select-item-${customAccountHistoryApiUrl}`,
          ),
        ).not.toBeInTheDocument();
      });

      it('Must show error adding existent account history api node', async () => {
        await act(async () => {
          await userEvent.click(
            screen.getByTestId('button-account-history-api-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.accountHistoryApiUri),
            DefaultAccountHistoryApis[0],
          );
          await userEvent.click(
            screen.getByTestId('button-account-history-api-save'),
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
            screen.getByTestId('button-account-history-api-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.accountHistoryApiUri),
            'non-valid-@url.@',
          );
          await userEvent.click(
            screen.getByTestId('button-account-history-api-save'),
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
            screen.getByTestId('button-account-history-api-add'),
          );
          await userEvent.type(
            screen.getByTestId(dataTestIdInput.rpcNodes.accountHistoryApiUri),
            '{space}',
          );
          await userEvent.click(
            screen.getByTestId('button-account-history-api-save'),
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

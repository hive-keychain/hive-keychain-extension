import { HiveTxUtils } from '@hiveapp/utils/hive-tx.utils';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('rpc-nodes.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('Switch rpc auto:\n', () => {
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
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.RPC),
        );
      });
    });

    it('Must show rpc_nodes page', () => {
      expect(screen.getByTestId(`${Screen.SETTINGS_RPC_NODES}-page`));
    });

    it('Must show add rpc button', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdCheckbox.rpcNodes.select.automaticMode),
        );
      });
      expect(
        screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
      ).toBeInTheDocument();
    });
  });
  describe('Not auto:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            localStorageRelated: {
              customData: {
                customSwitchAuto: false,
                customsRpcs: [
                  { uri: 'https://saturnoman.com/rpc', testnet: false },
                ],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.SETTINGS),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.RPC),
        );
      });
    });

    it('Must hide add rpc button', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdCheckbox.rpcNodes.select.automaticMode),
        );
      });
      expect(
        screen.queryByTestId(dataTestIdButton.rpcNodes.addRpc),
      ).not.toBeInTheDocument();
    });

    it('Must show error if empty uri', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.rpcNodes.uri),
          '{space}',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.save));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_rpc_missing_fields'),
          { exact: true },
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if invalid uri', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.rpcNodes.uri),
          'www.www.rpcNode',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.save));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('html_popup_url_not_valid'),
          { exact: true },
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if empty node chain Id', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdCheckbox.rpcNodes.select.addTesnetNode),
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.save));
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_rpc_missing_fields'),
          { exact: true },
        ),
      ).toBeInTheDocument();
    });

    it('Must add new rpc and show it in list', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.save));
        await userEvent.click(
          screen.getByTestId(dataTestIdSelect.rpcNode.selected),
        );
      });
      expect(
        await screen.findByText('https://saturno.hive.com/rpc', {
          exact: true,
        }),
      ).toBeInTheDocument();
    });

    it('Must add new rpc and set it as active rpc', async () => {
      const sSetRpc = jest.spyOn(HiveTxUtils, 'setRpc');
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdCheckbox.rpcNodes.select.setAsActive),
        );
        await userEvent.click(screen.getByTestId(dataTestIdButton.save));
        await userEvent.click(
          screen.getByTestId(dataTestIdSelect.rpcNode.selected),
        );
      });
      expect(
        screen.getByTestId(
          dataTestIdSelect.rpcNode.selectItem.preFix +
            'https://saturno.hive.com/rpc',
        ),
      ).toBeInTheDocument();
      sSetRpc.mockRestore();
    });
  });
});

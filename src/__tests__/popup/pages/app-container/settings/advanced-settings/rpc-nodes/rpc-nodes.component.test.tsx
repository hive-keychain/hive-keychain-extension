import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import arialabelCheckbox from 'src/__tests__/utils-for-testing/aria-labels/aria-label-checkbox';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import ariaLabelSelect from 'src/__tests__/utils-for-testing/aria-labels/aria-label-select';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
describe('rpc-nodes.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('Switch rpc auto:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.SETTINGS),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.RPC),
        );
      });
    });

    it('Must show rpc_nodes page', () => {
      expect(screen.getByLabelText(`${Screen.SETTINGS_RPC_NODES}-page`));
    });

    it('Must show add rpc button', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            arialabelCheckbox.rpcNodes.select.automaticMode,
          ),
        );
      });
      expect(
        screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
      ).toBeInTheDocument();
    });
  });
  describe('Not auto:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.SETTINGS),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.RPC),
        );
      });
    });

    it('Must hide add rpc button', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            arialabelCheckbox.rpcNodes.select.automaticMode,
          ),
        );
      });
      expect(
        screen.queryByLabelText(ariaLabelButton.rpcNodes.addRpc),
      ).not.toBeInTheDocument();
    });

    it('Must show error if empty uri', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.rpcNodes.uri),
          '{space}',
        );
        await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
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
          screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.rpcNodes.uri),
          'www.www.rpcNode',
        );
        await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
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
          screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(
          screen.getByLabelText(
            arialabelCheckbox.rpcNodes.select.addTesnetNode,
          ),
        );
        await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
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
          screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
        await userEvent.click(
          screen.getByLabelText(ariaLabelSelect.rpcNode.selected),
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
          screen.getByLabelText(ariaLabelButton.rpcNodes.addRpc),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.rpcNodes.uri),
          'https://saturno.hive.com/rpc',
        );
        await userEvent.click(
          screen.getByLabelText(arialabelCheckbox.rpcNodes.select.setAsActive),
        );
        await userEvent.click(screen.getByLabelText(ariaLabelButton.save));
        await userEvent.click(
          screen.getByLabelText(ariaLabelSelect.rpcNode.selected),
        );
      });
      expect(
        screen.getByLabelText(
          ariaLabelSelect.rpcNode.selectItem.preFix +
            'https://saturno.hive.com/rpc',
        ),
      ).toBeInTheDocument();
      sSetRpc.mockRestore();
    });
  });
});

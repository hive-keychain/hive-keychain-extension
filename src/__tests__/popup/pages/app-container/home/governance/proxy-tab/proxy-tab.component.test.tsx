import { TransactionResult } from '@interfaces/hive-tx.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import ProxyUtils from 'src/utils/proxy.utils';

describe('proxy-tab.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('With active key cases:\n', () => {
    describe('empty proxy', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <App />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getExtendedAccount: { ...accounts.extended, proxy: '' },
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
          await userEvent.click(
            screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.HIVE),
          );
          await userEvent.click(screen.getAllByRole('tab')[1]);
        });
      });

      it('Must show intro message for empty proxy', async () => {
        expect(
          await screen.findByText(
            chrome.i18n
              .getMessage('html_popup_witness_proxy_definition')
              .trim(),
            { exact: true },
          ),
        ).toBeInTheDocument();
      });

      it('Must set proxy and show message', async () => {
        ProxyUtils.setAsProxy = jest.fn().mockResolvedValue({
          tx_id: 'tx_id',
          id: 'id',
          confirmed: true,
        } as TransactionResult);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.username),
            'keychain',
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.operation.proxy.tab.setAsProxy,
            ),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('popup_success_proxy', ['keychain']),
          ),
        ).toBeInTheDocument();
      });

      it('Must show error when set proxy fails', async () => {
        ProxyUtils.setAsProxy = jest.fn().mockResolvedValue(null);
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.username),
            'keychain',
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.operation.proxy.tab.setAsProxy,
            ),
          );
        });
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_set_as_proxy_error'),
          ),
        ).toBeInTheDocument();
      });

      it('Must catch error and show', async () => {
        ProxyUtils.setAsProxy = jest
          .fn()
          .mockRejectedValue(
            new Error('Error when setting proxy in proxy-tab'),
          );
        await act(async () => {
          await userEvent.type(
            screen.getByLabelText(ariaLabelInput.username),
            'keychain',
          );
          await userEvent.click(
            screen.getByLabelText(
              ariaLabelButton.operation.proxy.tab.setAsProxy,
            ),
          );
        });
        expect(
          await screen.findByText('Error when setting proxy in proxy-tab'),
        ).toBeInTheDocument();
      });
    });

    describe('Initial proxy', () => {
      beforeEach(async () => {
        await reactTestingLibrary.renderWithConfiguration(
          <App />,
          initialStates.iniStateAs.defaultExistent,
          {
            app: {
              accountsRelated: {
                AccountUtils: {
                  getExtendedAccount: {
                    ...accounts.extended,
                    proxy: 'keychain',
                  },
                },
                ProxyUtils: {
                  findUserProxy: 'keychain',
                },
              },
            },
          },
        );
        await act(async () => {
          await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
          await userEvent.click(
            screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.HIVE),
          );
          await userEvent.click(screen.getAllByRole('tab')[1]);
        });
      });

      it('Must show intro message and current proxy account', async () => {
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_witness_has_proxy').trim(),
            { exact: true },
          ),
        ).toBeInTheDocument();
        expect(
          await screen.findByText(
            chrome.i18n.getMessage('html_popup_currently_using_proxy', [
              'keychain',
            ]),
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('No active key cases:\n', () => {
    beforeEach(async () => {
      const cloneLocalAccounts = objects.clone(
        accounts.twoAccounts,
      ) as LocalAccount[];
      delete cloneLocalAccounts[0].keys.active;
      delete cloneLocalAccounts[0].keys.activePubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getExtendedAccount: { ...accounts.extended, proxy: '' },
                getAccountsFromLocalStorage: cloneLocalAccounts,
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.HIVE),
        );
        await userEvent.click(screen.getAllByRole('tab')[1]);
      });
    });

    it('Must show error trying to set proxy', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.username),
          'keychain',
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.operation.proxy.tab.setAsProxy),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_missing_key', [
            KeychainKeyTypesLC.active,
          ]),
        ),
      ).toBeInTheDocument();
    });
  });
});

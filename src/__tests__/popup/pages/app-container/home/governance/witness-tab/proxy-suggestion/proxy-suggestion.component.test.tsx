import ProxyUtils from '@hiveapp/utils/proxy.utils';
import { TransactionResult } from '@interfaces/hive-tx.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdPopup from 'src/__tests__/utils-for-testing/data-testid/data-testid-popup';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

//TODO testings: unskip if proxy-suggestion.component gets enabled.
describe.skip('Proxy suggestion tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getExtendedAccount: {
                ...accounts.extended,
                proxy: '',
                witness_votes: [],
                witnesses_voted_for: 0,
              },
            },
          },
        },
      },
    );
  });

  it('Must show proxy suggestion & display message', async () => {
    expect(
      await screen.findByTestId(dataTestIdPopup.proxySuggestion.component),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_proxy_suggestion'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if suggestion operations fails by HIVE', async () => {
    ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
    ProxyUtils.setAsProxy = jest
      .fn()
      .mockRejectedValue(new Error('Error setting proxy'));
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdButton.operation.proxySuggestion.ok,
        ),
      );
    });
    expect(await screen.findByText('Error setting proxy')).toBeInTheDocument();
  });

  it('Must set @keychain as proxy', async () => {
    ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
    ProxyUtils.setAsProxy = jest.fn().mockResolvedValue({
      tx_id: 'tx_id',
      id: 'id',
      confirmed: true,
    } as TransactionResult);
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdButton.operation.proxySuggestion.ok,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_success_proxy', ['keychain']),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if operation fails', async () => {
    ProxyUtils.findUserProxy = jest.fn().mockResolvedValue(null);
    ProxyUtils.setAsProxy = jest.fn().mockResolvedValue(null);
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdButton.operation.proxySuggestion.ok,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_error_proxy', ['keychain']),
      ),
    ).toBeInTheDocument();
  });

  it('Must close suggestion after clicking close', async () => {
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(dataTestIdButton.panel.close),
      );
    });
    expect(
      await screen.findByTestId(dataTestIdPopup.proxySuggestion.component),
    ).toHaveClass('proxy-suggestion hide');
  });
});

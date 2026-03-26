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
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { ProxySuggestionComponent } from 'src/popup/hive/pages/app-container/home/governance/witness-tab/proxy-suggestion/proxy-suggestion.component';
import { RootState } from 'src/popup/multichain/store';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

/** `HiveApp` does not mount `ProxySuggestionComponent`; exercise it with a real store slice. */
const stateWithActiveAccount = (): RootState => {
  const base = initialStates.iniStateAs.defaultExistent;
  return {
    ...base,
    hive: {
      ...base.hive,
      activeAccount: accounts.active,
    },
  } as RootState;
};

describe('Proxy suggestion tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  beforeEach(() => {
    chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom);
    LocalStorageUtils.getValueFromLocalStorage = jest
      .fn()
      .mockImplementation((key: string) => {
        if (key === LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve(undefined);
      });
    LocalStorageUtils.saveValueInLocalStorage = jest
      .fn()
      .mockResolvedValue(undefined);
  });

  it('Must show proxy suggestion & display message', async () => {
    customRender(<ProxySuggestionComponent />, {
      initialState: stateWithActiveAccount(),
    });
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
    customRender(<ProxySuggestionComponent />, {
      initialState: stateWithActiveAccount(),
    });
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
    customRender(<ProxySuggestionComponent />, {
      initialState: stateWithActiveAccount(),
    });
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
    customRender(<ProxySuggestionComponent />, {
      initialState: stateWithActiveAccount(),
    });
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
    customRender(<ProxySuggestionComponent />, {
      initialState: stateWithActiveAccount(),
    });
    const panel = await screen.findByTestId(
      dataTestIdPopup.proxySuggestion.component,
    );
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(dataTestIdButton.panel.close),
      );
    });
    expect(panel).toHaveClass('hide');
  });
});

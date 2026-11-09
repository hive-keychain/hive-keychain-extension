import { EvmDappStatusComponent } from '@popup/evm/pages/home/evm-dapp-status/evm-dapp-status.component';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';

jest.mock('src/utils/i18n.utils', () => ({
  I18nUtils: {
    getMessage: (key: string, params?: string[]) =>
      params?.length ? `${key}:${params.join(',')}` : key,
  },
}));

describe('EvmDappStatusComponent', () => {
  const queryActiveTab = (tabs: chrome.tabs.Tab[] | undefined) => {
    (chrome.tabs.query as jest.Mock).mockImplementation((_query, callback) => {
      callback(tabs);
      return undefined;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    chrome.tabs.onActivated.addListener = jest.fn();
  });

  it('reads the active tab from the query callback when the call returns undefined', async () => {
    queryActiveTab([
      {
        id: 4,
        url: 'https://example.com/app',
      } as chrome.tabs.Tab,
    ]);

    render(
      <Provider store={getFakeStore()}>
        <EvmDappStatusComponent />
      </Provider>,
    );

    expect(
      await screen.findByRole('button', {
        name: 'popup_html_evm_dapp_status_open_details:example.com',
      }),
    ).toBeInTheDocument();
    expect(chrome.tabs.query).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function),
    );
  });

  it('stays hidden when the query callback receives no tabs', async () => {
    queryActiveTab(undefined);

    const { container } = render(
      <Provider store={getFakeStore()}>
        <EvmDappStatusComponent />
      </Provider>,
    );

    await waitFor(() => expect(chrome.tabs.query).toHaveBeenCalled());
    expect(container.querySelector('.dapp-status-wrapper')).toBeNull();
  });
});

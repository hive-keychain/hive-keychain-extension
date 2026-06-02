import '@testing-library/jest-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import {
  getHiveAccountDappConnections,
  getHiveDappFaviconUrl,
  removeHiveAccountDappOperation,
  removeHiveAccountDappPermissions,
  SettingsHiveDappsPageComponent,
} from '@popup/multichain/pages/settings/settings-hive-dapps-page.component';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  getFakeStore,
  initialEmptyStateStore,
} from 'src/__tests__/utils-for-testing/fake-store';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { NoConfirm } from 'src/interfaces/no-confirm.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock(
  '@common-ui/custom-select/custom-select.component',
  () => ({
    ComplexeCustomSelect: ({
      options,
      selectedItem,
      setSelectedItem,
    }: {
      options: { label: string; value: string }[];
      selectedItem: { label: string; value: string };
      setSelectedItem: (option: { label: string; value: string }) => void;
    }) => (
      <div data-testid="hive-account-selector">
        <div data-testid="selected-account-name">{selectedItem.label}</div>
        {options.map((option) => (
          <button
            data-testid={`account-option-${option.value}`}
            key={option.value}
            onClick={() => setSelectedItem(option)}
            type="button">
            {option.label}
          </button>
        ))}
      </div>
    ),
  }),
);

jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => <span data-testid="svg-icon" />,
}));

const renderWithNoConfirm = (
  initialNoConfirm: NoConfirm,
  activeAccountName = 'keychain.tests',
) => {
  let savedNoConfirm = initialNoConfirm;

  jest
    .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
    .mockImplementation(async () => savedNoConfirm);
  const saveSpy = jest
    .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
    .mockImplementation(async (_key, value) => {
      savedNoConfirm = value;
    });

  const store = getFakeStore({
    ...initialEmptyStateStore,
    hive: {
      ...initialEmptyStateStore.hive,
      accounts: [
        { name: 'keychain.tests', keys: {} },
        { name: 'stale.user', keys: {} },
      ] as LocalAccount[],
      activeAccount: {
        ...initialEmptyStateStore.hive.activeAccount,
        name: activeAccountName,
      },
    },
  });

  render(
    <Provider store={store}>
      <SettingsHiveDappsPageComponent />
    </Provider>,
  );

  return {
    getSavedNoConfirm: () => savedNoConfirm,
    saveSpy,
  };
};

const getDappConnection = (domain: string) => {
  const connection = screen
    .getByText(domain)
    .closest('[data-testid="hive-dapps-connection"]');
  if (!connection) {
    throw new Error(`Missing dapp connection for ${domain}`);
  }
  return connection as HTMLElement;
};

describe('settings-connected-dapps Hive whitelist tests:\n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(chrome.i18n, 'getMessage').mockImplementation((key) => key);
  });

  it('builds sorted domain connections for one Hive account only', () => {
    const noConfirm = {
      'keychain.tests': {
        'zeta.example': {
          vote: true,
          post: false,
        },
        'alpha.example': {
          signTx: true,
          post: true,
        },
      },
      'stale.user': {
        'alpha.example': {
          vote: true,
        },
      },
    } as NoConfirm;

    expect(
      getHiveAccountDappConnections(noConfirm, 'keychain.tests'),
    ).toEqual([
      {
        domain: 'alpha.example',
        operations: ['post', 'signTx'],
      },
      {
        domain: 'zeta.example',
        operations: ['vote'],
      },
    ]);
  });

  it('removes a single operation or all permissions for one account domain', () => {
    const noConfirm = {
      'keychain.tests': {
        'alpha.example': {
          post: true,
          signTx: true,
        },
        'zeta.example': {
          vote: true,
        },
      },
      'stale.user': {
        'alpha.example': {
          vote: true,
        },
      },
    } as NoConfirm;

    expect(
      removeHiveAccountDappOperation(
        noConfirm,
        'keychain.tests',
        'alpha.example',
        'post',
      ),
    ).toEqual({
      'keychain.tests': {
        'alpha.example': {
          signTx: true,
        },
        'zeta.example': {
          vote: true,
        },
      },
      'stale.user': {
        'alpha.example': {
          vote: true,
        },
      },
    });

    expect(
      removeHiveAccountDappPermissions(
        noConfirm,
        'keychain.tests',
        'alpha.example',
      ),
    ).toEqual({
      'keychain.tests': {
        'zeta.example': {
          vote: true,
        },
      },
      'stale.user': {
        'alpha.example': {
          vote: true,
        },
      },
    });
  });

  it('renders the account selector and account-specific empty state', async () => {
    renderWithNoConfirm({});

    expect(screen.getByTestId('hive-account-selector')).toBeInTheDocument();
    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      'keychain.tests',
    );
    expect(screen.queryByTestId('add-account-dropdown-option')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('create-account-dropdown-option'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('manage-accounts-dropdown-option'),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('hive-dapps-connections-empty')).toHaveTextContent(
        'popup_html_no_pref',
      );
    });
  });

  it('renders dapp rows with visible operations for the selected account', async () => {
    renderWithNoConfirm({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
          post: true,
        },
        'leofinance.com': {
          vote: true,
        },
      },
      'stale.user': {
        'only-stale.example': {
          vote: true,
        },
      },
    } as NoConfirm);

    const domains = await screen.findAllByTestId('hive-dapps-connection-domain');
    expect(domains.map((domain) => domain.textContent)).toEqual([
      'leofinance.com',
      'splinterlands.com',
    ]);
    expect(screen.queryByText('only-stale.example')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('hive-dapps-connection-favicon')[1]).toHaveAttribute(
      'src',
      getHiveDappFaviconUrl('splinterlands.com'),
    );
    expect(
      screen.queryByTestId('hive-dapps-connection-toggle'),
    ).not.toBeInTheDocument();

    const splinterlandsConnection = getDappConnection('splinterlands.com');

    expect(
      within(splinterlandsConnection)
        .getAllByTestId('hive-whitelisted-operation-tag')
        .map((tag) => tag.textContent),
    ).toEqual(['popup_post', 'popup_sign_tx']);
  });

  it('removes a single operation from the selected account dapp row', async () => {
    const user = userEvent.setup();
    const { getSavedNoConfirm, saveSpy } = renderWithNoConfirm({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
          post: true,
        },
      },
      'stale.user': {
        'splinterlands.com': {
          vote: true,
        },
      },
    } as NoConfirm);

    await screen.findByText('splinterlands.com');
    const splinterlandsConnection = getDappConnection('splinterlands.com');

    await act(async () => {
      await user.click(
        within(splinterlandsConnection)
          .getByText('popup_post')
          .closest('button')!,
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('popup_post')).not.toBeInTheDocument();
    });
    expect(saveSpy).toHaveBeenLastCalledWith(LocalStorageKeyEnum.NO_CONFIRM, {
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
        },
      },
      'stale.user': {
        'splinterlands.com': {
          vote: true,
        },
      },
    });
    expect(getSavedNoConfirm()).toEqual({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
        },
      },
      'stale.user': {
        'splinterlands.com': {
          vote: true,
        },
      },
    });
  });

  it('removes all permissions for one selected-account dapp domain', async () => {
    const user = userEvent.setup();
    const { getSavedNoConfirm } = renderWithNoConfirm({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
        },
        'leofinance.com': {
          vote: true,
        },
      },
      'stale.user': {
        'splinterlands.com': {
          vote: true,
        },
      },
    } as NoConfirm);

    await screen.findByText('splinterlands.com');
    const splinterlandsConnection = getDappConnection('splinterlands.com');

    await act(async () => {
      await user.click(
        within(splinterlandsConnection).getByTestId('hive-dapps-remove-domain'),
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('splinterlands.com')).not.toBeInTheDocument();
    });
    expect(screen.getByText('leofinance.com')).toBeInTheDocument();
    expect(getSavedNoConfirm()).toEqual({
      'keychain.tests': {
        'leofinance.com': {
          vote: true,
        },
      },
      'stale.user': {
        'splinterlands.com': {
          vote: true,
        },
      },
    });
  });

  it('shows the empty state after removing the last selected-account permission', async () => {
    const user = userEvent.setup();
    renderWithNoConfirm({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
        },
      },
    } as NoConfirm);

    await screen.findByText('splinterlands.com');
    const splinterlandsConnection = getDappConnection('splinterlands.com');

    await act(async () => {
      await user.click(
        within(splinterlandsConnection)
          .getByText('popup_sign_tx')
          .closest('button')!,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('hive-dapps-connections-empty')).toHaveTextContent(
        'popup_html_no_pref',
      );
    });
  });

  it('switches displayed dapps when selecting another Hive account', async () => {
    const user = userEvent.setup();
    renderWithNoConfirm({
      'keychain.tests': {
        'splinterlands.com': {
          signTx: true,
        },
      },
      'stale.user': {
        'only-stale.example': {
          vote: true,
        },
      },
    } as NoConfirm);

    expect(await screen.findByText('splinterlands.com')).toBeInTheDocument();

    await user.click(screen.getByTestId('account-option-stale.user'));

    await waitFor(() => {
      expect(screen.queryByText('splinterlands.com')).not.toBeInTheDocument();
    });
    expect(screen.getByText('only-stale.example')).toBeInTheDocument();
    expect(screen.getByTestId('selected-account-name')).toHaveTextContent(
      'stale.user',
    );
  });
});

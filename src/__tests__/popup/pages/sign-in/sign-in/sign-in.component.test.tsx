import MkUtils from '@hiveapp/utils/mk.utils';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Store } from 'redux';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { RootState } from 'src/popup/multichain/store';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('sign-in.component.tsx tests:\n', () => {
  let store: Store<RootState>;

  beforeEach(async () => {
    store = await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      {
        ...initialStates.iniStateAs.defaultExistent,
        mk: '',
        /** HiveApp only re-runs `selectComponent` after login when this is truthy. */
        hasFinishedSignup: true,
      },
      {
        app: {
          accountsRelated: {
            MkUtils: {
              getMkFromLocalStorage: '',
            },
          },
        },
      },
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it('Must show error message after pressing enter', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(false);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'incorrect_password{enter}',
      );
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('wrong_password'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must show error message after clicking submit', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(false);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'incorrect_password',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.login));
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('wrong_password'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must complete login when pressing enter key', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'correct_password{enter}',
      );
    });
    await waitFor(() => {
      expect(store.getState().mk).toBe('correct_password');
    });
    await waitFor(() => {
      expect(store.getState().hive.accounts.length).toBeGreaterThan(0);
    });
    expect(store.getState().hive.appStatus.processingDecryptAccount).toBe(
      false,
    );
  });

  it('Must complete login when clicking submit button', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'correct_password',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.login));
    });
    await waitFor(() => {
      expect(store.getState().mk).toBe('correct_password');
    });
    await waitFor(() => {
      expect(store.getState().hive.accounts.length).toBeGreaterThan(0);
    });
    expect(store.getState().hive.appStatus.processingDecryptAccount).toBe(
      false,
    );
  });
});

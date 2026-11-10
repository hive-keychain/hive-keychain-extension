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
import LegalDocumentsUtils from 'src/utils/legal-documents.utils';

import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/utils/legal-documents.utils', () => ({
  __esModule: true,
  default: {
    needsLegalDocumentAcceptance: jest.fn().mockResolvedValue(false),
    acceptLegalDocumentHashes: jest.fn().mockResolvedValue(undefined),
  },
}));

const renderSignIn = async () =>
  reactTestingLibrary.renderWithConfiguration(
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

describe('sign-in.component.tsx tests:\n', () => {
  let store: Store<RootState>;

  beforeEach(async () => {
    (LegalDocumentsUtils.needsLegalDocumentAcceptance as jest.Mock).mockResolvedValue(
      false,
    );
    (
      LegalDocumentsUtils.acceptLegalDocumentHashes as jest.Mock
    ).mockResolvedValue(undefined);
    store = await renderSignIn();
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
      await screen.findByText(I18nUtils.getMessage('wrong_password'), {
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
      await screen.findByText(I18nUtils.getMessage('wrong_password'), {
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
    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).not.toHaveBeenCalled();
  });

  it('does not show the terms checkbox when the legal documents are unchanged', async () => {
    await waitFor(() => {
      expect(LegalDocumentsUtils.needsLegalDocumentAcceptance).toHaveBeenCalled();
    });
    expect(
      screen.queryByTestId('accept-terms-and-condition'),
    ).not.toBeInTheDocument();
  });
});

describe('sign-in.component.tsx when legal documents changed:\n', () => {
  let store: Store<RootState>;

  beforeEach(async () => {
    (LegalDocumentsUtils.needsLegalDocumentAcceptance as jest.Mock).mockResolvedValue(
      true,
    );
    (
      LegalDocumentsUtils.acceptLegalDocumentHashes as jest.Mock
    ).mockClear();
    store = await renderSignIn();
    expect(
      await screen.findByTestId('accept-terms-and-condition'),
    ).toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('blocks login until the terms checkbox is checked', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'correct_password',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.login));
    });
    expect(
      await screen.findByText(
        I18nUtils.getMessage('html_popup_sign_up_need_accept_pp'),
        { exact: true },
      ),
    ).toBeInTheDocument();
    expect(MkUtils.login).not.toHaveBeenCalled();
    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).not.toHaveBeenCalled();
  });

  it('stores the current hashes and logs in after the terms are accepted', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.click(screen.getByTestId('accept-terms-and-condition'));
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.password),
        'correct_password',
      );
      await userEvent.click(screen.getByTestId(dataTestIdButton.login));
    });
    await waitFor(() => {
      expect(store.getState().mk).toBe('correct_password');
    });
    expect(LegalDocumentsUtils.acceptLegalDocumentHashes).toHaveBeenCalledTimes(
      1,
    );
  });
});

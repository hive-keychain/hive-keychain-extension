import App from '@popup/App';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import MkUtils from 'src/utils/mk.utils';
describe('sign-in.component.tsx tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      { ...initialStates.iniStateAs.defaultExistent, mk: '' },
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
        screen.getByLabelText(dataTestIdInput.password),
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
        screen.getByLabelText(dataTestIdInput.password),
        'incorrect_password',
      );
      await userEvent.click(screen.getByLabelText(dataTestIdButton.login));
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('wrong_password'), {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must navigate to home page when pressing enter key', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(dataTestIdInput.password),
        'correct_password{enter}',
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('Must navigate to home page when clicking submit button', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(dataTestIdInput.password),
        'correct_password',
      );
      await userEvent.click(screen.getByLabelText(dataTestIdButton.login));
    });
    expect(
      await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });
});

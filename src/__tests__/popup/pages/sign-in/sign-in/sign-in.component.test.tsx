import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelComponent from 'src/__tests__/utils-for-testing/aria-labels/aria-label-component';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
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
        screen.getByLabelText(ariaLabelInput.password),
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
        screen.getByLabelText(ariaLabelInput.password),
        'incorrect_password',
      );
      await userEvent.click(screen.getByLabelText(ariaLabelButton.login));
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
        screen.getByLabelText(ariaLabelInput.password),
        'correct_password{enter}',
      );
    });
    expect(
      await screen.findByLabelText(ariaLabelComponent.homePage),
    ).toBeInTheDocument();
  });

  it('Must navigate to home page when clicking submit button', async () => {
    MkUtils.login = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.password),
        'correct_password',
      );
      await userEvent.click(screen.getByLabelText(ariaLabelButton.login));
    });
    expect(
      await screen.findByLabelText(ariaLabelComponent.homePage),
    ).toBeInTheDocument();
  });
});

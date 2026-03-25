import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('tokens.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('User has tokens:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
    });
    it('Must show tokens page & disclaimer message', async () => {
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(dataTestIdIcon.tokens.openFilter),
      ).toBeInTheDocument();
    });

    it('Must show user tokens', async () => {
      expect(
        await screen.findAllByTestId(dataTestIdDiv.token.user.item),
      ).toHaveLength(tokensUser.balances.length);
    });

    it('Must show filter box and settings', async () => {
      expect(
        await screen.findByTestId(dataTestIdInput.filter.token),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(dataTestIdIcon.tokens.openFilter),
      ).toBeInTheDocument();
    });

    it('Must set filter box value & display one result', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.tokens.openFilter));
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filter.token),
          'LEO',
        );
      });
      const tokenItemHTMLElement = await screen.findAllByTestId(
        dataTestIdDiv.token.user.item,
      );
      expect(tokenItemHTMLElement).toHaveLength(1);
      expect(tokenItemHTMLElement[0].textContent).toContain('LEO');
    });

    it('Must display no tokens found message', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.tokens.openFilter));
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filter.token),
          'KEYCHAIN',
        );
      });
      await waitFor(
        () => {
          expect(
            screen.queryAllByTestId(dataTestIdDiv.token.user.item),
          ).toHaveLength(0);
        },
        { timeout: 15000 },
      );
    });

    it('Must show tokens settings page & go back to tokens page', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdIcon.tokens.settings.open),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.TOKENS_FILTER}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.arrowBack));
      });
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('User has no tokens', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              TokensUtils: {
                getUserBalance: [],
              },
            },
          },
        },
      );
    });
    it('Must show no tokens message', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('html_tokens_none_available'),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Having hidden tokens:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            localStorageRelated: {
              customData: {
                customHiddenTokenList: ['LEO'],
              },
            },
          },
        },
      );
    });

    it('Must not show hidden token', async () => {
      expect(
        (await screen.findAllByTestId(dataTestIdDiv.token.user.item)).filter(
          (el) => el.textContent?.includes('LEO'),
        ),
      ).toHaveLength(0);
    });
  });
});

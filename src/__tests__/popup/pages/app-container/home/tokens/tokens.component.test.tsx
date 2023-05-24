import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
describe('tokens.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const tokenIconName = ActionButtonList.find((actionButton) =>
    actionButton.label.includes('token'),
  )?.icon;
  describe('User has tokens:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.actionBtn.preFix + tokenIconName,
          ),
        );
      });
    });
    it('Must show tokens page & disclaimer message', async () => {
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_PAGE}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_view_tokens_balance'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show user tokens', async () => {
      expect(
        await screen.findAllByLabelText(ariaLabelDiv.token.user.item),
      ).toHaveLength(tokensUser.balances.length);
    });

    it('Must show filter box and settings', async () => {
      expect(
        await screen.findByLabelText(ariaLabelInput.filter.token),
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText(ariaLabelIcon.tokens.openFilter),
      ).toBeInTheDocument();
    });

    it('Must set filter box value & display one result', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filter.token),
          'LEO',
        );
      });
      const tokenItemHTMLElement = await screen.findAllByLabelText(
        ariaLabelDiv.token.user.item,
      );
      expect(tokenItemHTMLElement).toHaveLength(1);
      expect(tokenItemHTMLElement[0].textContent).toContain('LEO');
    });

    it('Must display no tokens found message', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filter.token),
          'KEYCHAIN',
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_no_tokens')),
      ).toBeInTheDocument();
    });

    it('Must show tokens settings page & go back to tokens page', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelIcon.tokens.settings.open),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_SETTINGS}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelIcon.arrowBack));
      });
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_PAGE}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('User has no tokens', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.actionBtn.preFix + tokenIconName,
          ),
        );
      });
    });
    it('Must show no tokens message', async () => {
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_tokens_no_tokens'),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Having hidden tokens:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
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
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.actionBtn.preFix + tokenIconName,
          ),
        );
      });
    });

    it('Must not show hidden token', () => {
      expect(
        screen.queryByLabelText(`${ariaLabelDiv.token.user.symbolPreFix}LEO`),
      ).not.toBeInTheDocument();
    });
  });
});

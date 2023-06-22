import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';

describe('token-incoming-outgoing-page.component tests:\n', () => {
  const actionButtonTokenIconName = ActionButtonList.find((actionButton) =>
    actionButton.label.includes('token'),
  )?.icon;
  const selectedToken = tokensUser.balances.find(
    (token) => token.symbol === 'LEO',
  )!;
  const leoCooldownData = tokensList.alltokens.filter(
    (token) => token.symbol === selectedToken.symbol,
  )[0].undelegationCooldown;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            TokensUtils: {
              getUserBalance: [selectedToken],
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
        ),
      );
    });
  });

  it('Must show outgoing delegations page & show cooldown disclaimer', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          dataTestIdDiv.token.user.prefixes.outgoingDelegations +
            selectedToken.symbol,
        ),
      );
    });
    expect(
      await screen.findByLabelText(`${Screen.TOKENS_DELEGATIONS}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        chrome.i18n.getMessage(
          'popup_html_token_undelegation_cooldown_disclaimer',
          [selectedToken.symbol, leoCooldownData],
        ),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });

  it('Must load incoming delegation page', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          dataTestIdDiv.token.user.prefixes.incomingDelegations +
            selectedToken.symbol,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_total_incoming'),
        { exact: true },
      ),
    ).toBeInTheDocument();
  });
});

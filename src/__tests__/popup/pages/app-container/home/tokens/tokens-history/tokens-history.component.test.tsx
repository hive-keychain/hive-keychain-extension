import { OperationsHiveEngine } from '@interfaces/tokens.interface';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
describe('tokens-history.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const actionButtonTokenIconName = ActionButtonList.find((actionButton) =>
    actionButton.label.includes('token'),
  )?.icon;
  const selectedToken = tokensUser.balances.find(
    (token) => token.symbol === 'LEO',
  )!;
  describe('With history to show', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
          ),
        );
      });
    });
    it('Must show LEO token history', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            `${dataTestIdIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
      });
      expect(
        screen.getAllByTestId(
          `${dataTestIdDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(tokenHistory.leoToken.length);
    });

    it('Must show one result when searching', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            `${dataTestIdIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filterBox),
          OperationsHiveEngine.TOKEN_UNDELEGATE_DONE,
        );
      });
      expect(
        await screen.findAllByTestId(
          `${dataTestIdDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(1);
    });

    it('Must show no results when searching', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            `${dataTestIdIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.filterBox),
          'not_found-this',
        );
      });
      expect(
        screen.queryAllByTestId(
          `${dataTestIdDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(0);
    });
  });

  describe('No history to show', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              HiveEngineUtils: {
                getTokenHistory: [],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
          ),
        );
      });
    });
    it('Must show no transactions on selected token', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(
            `${dataTestIdIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
      });
      expect(
        screen.queryAllByTestId(
          `${dataTestIdDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(0);
    });
  });
});

import { OperationsHiveEngine } from '@interfaces/tokens.interface';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
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
          screen.getByLabelText(
            `${ariaLabelButton.actionBtn.preFix}${actionButtonTokenIconName}`,
          ),
        );
      });
    });
    it('Must show LEO token history', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            `${ariaLabelIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
      });
      expect(
        screen.getAllByLabelText(
          `${ariaLabelDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(tokenHistory.leoToken.length);
    });

    it('Must show one result when searching', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            `${ariaLabelIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filterBox),
          OperationsHiveEngine.TOKEN_UNDELEGATE_DONE,
        );
      });
      expect(
        await screen.findAllByLabelText(
          `${ariaLabelDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(1);
    });

    it('Must show no results when searching', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            `${ariaLabelIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.filterBox),
          'not_found-this',
        );
      });
      expect(
        screen.queryAllByLabelText(
          `${ariaLabelDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
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
          screen.getByLabelText(
            `${ariaLabelButton.actionBtn.preFix}${actionButtonTokenIconName}`,
          ),
        );
      });
    });
    it('Must show no transactions on selected token', async () => {
      await act(async () => {
        await userEvent.click(
          await screen.findByLabelText(
            `${ariaLabelIcon.tokens.prefix.history}${selectedToken.symbol}`,
          ),
        );
      });
      expect(
        screen.queryAllByLabelText(
          `${ariaLabelDiv.token.list.item.history.preFix}${selectedToken.symbol}`,
        ),
      ).toHaveLength(0);
    });
  });
});

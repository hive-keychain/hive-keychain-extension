import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
describe('token-history-item.component tests:\n', () => {
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
  const selectedHistoryTransaction = tokenHistory.leoToken.find(
    (historyLeoItem) => historyLeoItem._id === '61674a248bae1252026e04ef',
  )!;
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
  it('Must open memo when clicked on selected history item', async () => {
    const memoDivAriaLabel = `${ariaLabelDiv.token.list.item.history.preFix}${selectedToken.symbol}-memo-panel-${selectedHistoryTransaction._id}`;
    await act(async () => {
      await userEvent.click(
        await screen.findByLabelText(
          `${ariaLabelIcon.tokens.prefix.history}${selectedToken.symbol}`,
        ),
      );
    });
    expect(screen.getByLabelText(memoDivAriaLabel).classList).toContain(
      'closed',
    );
    await act(async () => {
      await userEvent.click(screen.getByLabelText(memoDivAriaLabel));
    });
    expect(screen.getByLabelText(memoDivAriaLabel).classList).toContain(
      'opened',
    );
  });
});

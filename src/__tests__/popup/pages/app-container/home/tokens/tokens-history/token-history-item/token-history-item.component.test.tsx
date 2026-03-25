import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { Screen } from '@reference-data/screen.enum';
describe('token-history-item.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const selectedToken = tokensUser.balances.find(
    (token) => token.symbol === 'LEO',
  )!;
  const selectedHistoryTransaction = tokenHistory.leoToken.find(
    (historyLeoItem) => historyLeoItem._id === '61674a248bae1252026e04ef',
  )!;
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
    );
  });
  it('Must open memo when clicked on selected history item', async () => {
    const memoDivAriaLabel = `${dataTestIdDiv.token.list.item.history.preFix}${selectedToken.symbol}-memo-panel-${selectedHistoryTransaction._id}`;
    await act(async () => {
      const leoRow = (await screen.findAllByTestId('token-user-item')).find(
        (el) => el.textContent?.includes('LEO'),
      );
      expect(leoRow).toBeTruthy();
      await userEvent.click(leoRow!);
      await userEvent.click(
        await screen.findByTestId(
          `${dataTestIdIcon.tokens.prefix.history}${selectedToken.symbol}`,
        ),
      );
    });
    expect(screen.getByTestId(memoDivAriaLabel).classList).toContain('closed');
    await act(async () => {
      await userEvent.click(screen.getByTestId(memoDivAriaLabel));
    });
    expect(screen.getByTestId(memoDivAriaLabel).classList).toContain('opened');
  });
});

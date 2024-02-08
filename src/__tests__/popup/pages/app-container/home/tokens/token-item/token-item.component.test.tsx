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
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';

describe('token-item.component tests:\n', () => {
  const actionButtonTokenIconName = ActionButtonList.find((actionButton) =>
    actionButton.label.includes('token'),
  )?.icon;
  const selectedToken = tokensUser.balances.find(
    (token) => token.symbol === 'LEO',
  )!;
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
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
        screen.getByTestId(
          `${dataTestIdButton.actionBtn.preFix}${actionButtonTokenIconName}`,
        ),
      );
    });
  });

  it('Must show only one token', async () => {
    expect(
      await screen.findAllByTestId(dataTestIdDiv.token.user.item),
    ).toHaveLength(1);
  });

  it('Must show LEO token information & action tokens buttons', async () => {
    expect(
      await screen.findByText(selectedToken.balance, { exact: true }),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(
        dataTestIdButton.token.action.preFix + `stake-` + selectedToken.symbol,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(
        dataTestIdButton.token.action.preFix +
          'unstake-' +
          selectedToken.symbol,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId(
        dataTestIdButton.token.action.preFix +
          'delegate-' +
          selectedToken.symbol,
      ),
    ).toBeInTheDocument();
  });

  it('Must open a new window to visit token url', async () => {
    const sCreateTab = jest.spyOn(chrome.tabs, 'create');
    const leoUrlData = JSON.parse(
      tokensList.alltokens.filter(
        (token) => token.symbol === selectedToken.symbol,
      )[0].metadata,
    ).url;
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdDiv.token.user.prefixes.gotoWebSite + selectedToken.symbol,
        ),
      );
    });
    expect(sCreateTab).toHaveBeenCalledTimes(1);
    expect(sCreateTab).toHaveBeenCalledWith({ url: leoUrlData });
    sCreateTab.mockRestore();
  });
});

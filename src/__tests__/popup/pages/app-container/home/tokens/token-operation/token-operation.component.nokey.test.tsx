import { LocalAccount } from '@interfaces/local-account.interface';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/multichain-container/hive/hive-app.component';
import AccountUtils from 'src/utils/account.utils';

describe('token-operation No Active key tests:\n', () => {
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
  beforeEach(async () => {
    const cloneLocalAccounts = objects.clone(
      accounts.twoAccounts,
    ) as LocalAccount[];
    delete cloneLocalAccounts[0].keys.active;
    delete cloneLocalAccounts[0].keys.activePubkey;
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: cloneLocalAccounts,
            },
            TokensUtils: {
              getUserBalance: tokensUser.balances.filter(
                (token) => token.symbol === 'LEO',
              ),
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
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          `${dataTestIdIcon.tokens.prefix.expandMore}${selectedToken.symbol}`,
        ),
      );
    });
  });

  it('Must show error trying to delegate', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.token.action.preFix +
            TokenOperationType.DELEGATE +
            '-' +
            selectedToken.symbol,
        ),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByTestId(dataTestIdInput.username),
        mk.user.two,
      );
      await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1.000');
      await userEvent.click(
        screen.getByTestId(
          `${dataTestIdButton.operation.tokens.preFix}${TokenOperationType.DELEGATE}`,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_missing_key', [
          KeychainKeyTypesLC.active,
        ]),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error trying to unstake', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.token.action.preFix +
            TokenOperationType.UNSTAKE +
            '-' +
            selectedToken.symbol,
        ),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1.000');
      await userEvent.click(
        screen.getByTestId(
          `${dataTestIdButton.operation.tokens.preFix}${TokenOperationType.UNSTAKE}`,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_missing_key', [
          KeychainKeyTypesLC.active,
        ]),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error trying to stake', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.token.action.preFix +
            TokenOperationType.STAKE +
            '-' +
            selectedToken.symbol,
        ),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1.000');
      await userEvent.click(
        screen.getByTestId(
          `${dataTestIdButton.operation.tokens.preFix}${TokenOperationType.STAKE}`,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_missing_key', [
          KeychainKeyTypesLC.active,
        ]),
      ),
    ).toBeInTheDocument();
  });
});

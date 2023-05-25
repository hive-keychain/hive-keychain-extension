import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
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
      <App />,
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
        screen.getByLabelText(
          `${ariaLabelButton.actionBtn.preFix}${actionButtonTokenIconName}`,
        ),
      );
    });
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          `${ariaLabelIcon.tokens.prefix.expandMore}${selectedToken.symbol}`,
        ),
      );
    });
  });

  it('Must show error trying to delegate', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.token.action.delegate),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.username),
        mk.user.two,
      );
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.amount),
        '1.000',
      );
      await userEvent.click(
        screen.getByLabelText(
          `${ariaLabelButton.operation.tokens.preFix}${TokenOperationType.DELEGATE}`,
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
        screen.getByLabelText(ariaLabelButton.token.action.unstake),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.amount),
        '1.000',
      );
      await userEvent.click(
        screen.getByLabelText(
          `${ariaLabelButton.operation.tokens.preFix}${TokenOperationType.UNSTAKE}`,
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
        screen.getByLabelText(ariaLabelButton.token.action.stake),
      );
    });
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.amount),
        '1.000',
      );
      await userEvent.click(
        screen.getByLabelText(
          `${ariaLabelButton.operation.tokens.preFix}${TokenOperationType.STAKE}`,
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

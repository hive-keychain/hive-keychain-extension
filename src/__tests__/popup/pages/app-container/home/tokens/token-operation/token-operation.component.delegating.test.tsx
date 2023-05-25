import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { TokenOperationType } from '@popup/pages/app-container/home/tokens/token-operation/token-operation.component';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelInput from 'src/__tests__/utils-for-testing/aria-labels/aria-label-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import TokensUtils from 'src/utils/tokens.utils';
describe('token-operation Delegating tests:\n', () => {
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
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
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
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.token.action.delegate),
      );
    });
  });

  it('Must show token operation page as delegate', async () => {
    expect(
      await screen.findByLabelText(`${Screen.TOKENS_OPERATION}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_token_delegate'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show error if unexistent account', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(false);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.username),
        'nonExistentUser',
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
      await screen.findByText(chrome.i18n.getMessage('popup_no_such_account')),
    ).toBeInTheDocument();
  });

  it('Must show error if not enough balance', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.username),
        mk.user.two,
      );
      await userEvent.type(
        screen.getByLabelText(ariaLabelInput.amount),
        parseFloat(selectedToken.balance + 1).toString(),
      );
      await userEvent.click(
        screen.getByLabelText(
          `${ariaLabelButton.operation.tokens.preFix}${TokenOperationType.DELEGATE}`,
        ),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_html_power_up_down_error'),
      ),
    ).toBeInTheDocument();
  });

  it('Must show confirmation page', async () => {
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
      await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('Must show error if delegating fails', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    TokensUtils.delegateToken = jest.fn().mockResolvedValue({
      broadcasted: false,
      confirmed: false,
      tx_id: 'tx_id',
    } as HiveEngineTransactionStatus);
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
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.dialog.confirm),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage(
          `popup_html_${TokenOperationType.DELEGATE}_tokens_failed`,
        ),
      ),
    ).toBeInTheDocument();
  });

  it('Must show timeout error', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    TokensUtils.delegateToken = jest.fn().mockResolvedValue({
      broadcasted: true,
      confirmed: false,
      tx_id: 'tx_id',
    } as HiveEngineTransactionStatus);
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
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.dialog.confirm),
      );
    });
    expect(
      await screen.findByText(chrome.i18n.getMessage('popup_token_timeout')),
    ).toBeInTheDocument();
  });

  it('Must catch error and show message', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    TokensUtils.delegateToken = jest
      .fn()
      .mockRejectedValue(new Error('error!!'));
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
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.dialog.confirm),
      );
    });
    expect(await screen.findByText('error!!')).toBeInTheDocument();
  });

  it('Must delegate and show message', async () => {
    AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
    TokensUtils.delegateToken = jest.fn().mockResolvedValue({
      confirmed: true,
      broadcasted: true,
      tx_id: 'id',
    } as HiveEngineTransactionStatus);
    FavoriteUserUtils.saveFavoriteUser = jest.fn();
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
      await userEvent.click(
        screen.getByLabelText(ariaLabelButton.dialog.confirm),
      );
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage(
          `popup_html_${TokenOperationType.DELEGATE}_tokens_success`,
        ),
      ),
    ).toBeInTheDocument();
  });
});

import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
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
import AccountUtils from 'src/utils/account.utils';
import { FavoriteUserUtils } from 'src/utils/favorite-user.utils';
import TokensUtils from 'src/utils/tokens.utils';
describe('token-operation.component tests', () => {
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
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(
          ariaLabelIcon.tokens.prefix.expandMore + selectedToken.symbol,
        ),
      );
    });
  });
  describe('unstake cases', () => {
    it('Must load operation as unstake', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText(
          ariaLabelButton.operation.tokens.preFix + 'unstake',
        ),
      ).toBeInTheDocument();
    });

    it('Must show confirmation page, and go back when cancelling', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'unstake',
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.cancel),
        );
      });
      expect(
        screen.queryByLabelText(`${Screen.CONFIRMATION_PAGE}-page`),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
    });

    it('Must show error message if not enough balance', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          (parseFloat(selectedToken.balance) + 1).toString(),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'unstake',
          ),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_power_up_down_error'),
          { exact: true },
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if unstaking fails', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.unstakeToken = jest.fn().mockResolvedValue({
        broadcasted: false,
        tx_id: 'id',
        confirmed: false,
      } as HiveEngineTransactionStatus);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'unstake',
          ),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(`popup_html_unstake_tokens_failed`),
        ),
      ).toBeInTheDocument();
    });

    it('Must show timeout error', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.unstakeToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        tx_id: 'id',
        confirmed: false,
      } as HiveEngineTransactionStatus);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'unstake',
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

    it('Must unstake and show message', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.unstakeToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        tx_id: 'id',
        confirmed: true,
      } as HiveEngineTransactionStatus);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'unstake',
          ),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(`popup_html_unstake_tokens_success`),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('delegate cases', () => {
    it('Must load operation as delegate', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.delegate +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText(
          ariaLabelButton.operation.tokens.preFix + 'delegate',
        ),
      ).toBeInTheDocument();
    });

    it('Must delegate and show message', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.delegateToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        tx_id: 'id',
        confirmed: true,
      } as HiveEngineTransactionStatus);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.delegate +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'delegate',
          ),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(`popup_html_delegate_tokens_success`),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('stake cases', () => {
    it('Must load operation as stake', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.stake +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByLabelText(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText(
          ariaLabelButton.operation.tokens.preFix + 'stake',
        ),
      ).toBeInTheDocument();
    });

    it('Must stake and show message', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.stakeToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        tx_id: 'id',
        confirmed: true,
      } as HiveEngineTransactionStatus);
      FavoriteUserUtils.saveFavoriteUser = jest.fn();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelDiv.token.user.prefixes.action.stake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByLabelText(ariaLabelInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.operation.tokens.preFix + 'stake',
          ),
        );
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage(`popup_html_stake_tokens_success`),
        ),
      ).toBeInTheDocument();
    });
  });
});

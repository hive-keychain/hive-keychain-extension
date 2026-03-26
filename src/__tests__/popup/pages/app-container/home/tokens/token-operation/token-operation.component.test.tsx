import AccountUtils from '@hiveapp/utils/account.utils';
import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import TokensUtils from '@hiveapp/utils/tokens.utils';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';

describe('token-operation.component tests', () => {
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
    );
    await act(async () => {
      const leoRow = (await screen.findAllByTestId('token-user-item')).find(
        (el) => el.textContent?.includes('LEO'),
      );
      expect(leoRow).toBeTruthy();
      await userEvent.click(leoRow!);
    });
  });
  describe('unstake cases', () => {
    it('Must load operation as unstake', async () => {
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(
          dataTestIdButton.operation.tokens.preFix + 'unstake',
        ),
      ).toBeInTheDocument();
    });

    it('Must show confirmation page, and go back when cancelling', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'unstake',
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.cancel),
        );
      });
      expect(
        screen.queryByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByTestId(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
    });

    it('Must show error message if not enough balance', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        // Unstake max is derived from stake, not liquid balance; exceeding it fails Joi first.
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          (parseFloat(selectedToken.stake) + 1).toString(),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'unstake',
          ),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('validation_error_less_or_equal_value'),
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'unstake',
          ),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'unstake',
          ),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.unstake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'unstake',
          ),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.delegate +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(
          dataTestIdButton.operation.tokens.preFix + 'delegate',
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.delegate +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'delegate',
          ),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.stake +
              selectedToken.symbol,
          ),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.TOKENS_OPERATION}-page`),
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId(
          dataTestIdButton.operation.tokens.preFix + 'stake',
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
          screen.getByTestId(
            dataTestIdDiv.token.user.prefixes.action.stake +
              selectedToken.symbol,
          ),
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          '0.100',
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.operation.tokens.preFix + 'stake',
          ),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
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

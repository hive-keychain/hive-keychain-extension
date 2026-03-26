import AccountUtils from '@hiveapp/utils/account.utils';
import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import TokensUtils from '@hiveapp/utils/tokens.utils';
import { Token } from '@interfaces/tokens.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('tokens-transfer.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  const selectedToken = tokensUser.balances.find(
    (token) => token.symbol === 'LEO',
  )!;
  const selectedTokenInfo = tokensList.alltokens.find(
    (token) => token.symbol === 'LEO',
  ) as Token;
  describe('Having balances:\n', () => {
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
        await userEvent.click(
          screen.getByTestId(`${dataTestIdIcon.tokens.prefix.send}LEO`),
        );
      });
    });

    it('Must show token transfer page showing LEO token info', async () => {
      expect(
        await screen.findByTestId(`${Screen.TOKENS_TRANSFER}-page`),
      ).toBeInTheDocument();
      expect(screen.getByTestId(`${Screen.TOKENS_TRANSFER}-page`)).toHaveTextContent(
        selectedToken.symbol,
      );
    });

    it('Must show error message if empty receiverUsername', async () => {
      await act(async () => {
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('validation_error_mandatory'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error message if empty amount', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.clear(screen.getByTestId(dataTestIdInput.amount));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('validation_error_mandatory'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if negative amount', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '-1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_need_positive_amount'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if unexistent user', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(false);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          'nonExistentUser',
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_no_such_account'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show error if not enough balance', async () => {
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          'nonExistentUser',
        );
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.amount),
          selectedToken.balance + 1,
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('validation_error_less_or_equal_value'),
        ),
      ).toBeInTheDocument();
    });

    it('Must show confirmation page and go home when cancelling operation', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
      });
      expect(
        await screen.findByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.closePage));
      });
      expect(
        screen.queryByTestId(`${Screen.CONFIRMATION_PAGE}-page`),
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
    });

    it('Must show Network timeout error', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.sendToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        confirmed: false,
        tx_id: 'tx_id',
      } as HiveEngineTransactionStatus);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(chrome.i18n.getMessage('popup_token_timeout')),
      ).toBeInTheDocument();
    });

    it('Must show error if transfer fails', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.sendToken = jest.fn().mockResolvedValue({
        broadcasted: false,
        confirmed: false,
        tx_id: 'tx_id',
      } as HiveEngineTransactionStatus);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_transfer_failed'),
        ),
      ).toBeInTheDocument();
    });

    it('Must catch error and display', async () => {
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.sendToken = jest
        .fn()
        .mockRejectedValue(new Error('Rejection error!'));
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(await screen.findByText('Rejection error!')).toBeInTheDocument();
    });

    it('Must send transfer', async () => {
      const formattedAmount = `${parseFloat('1').toFixed(
        selectedTokenInfo.precision,
      )} LEO`;
      AccountUtils.doesAccountExist = jest.fn().mockResolvedValue(true);
      TokensUtils.sendToken = jest.fn().mockResolvedValue({
        broadcasted: true,
        confirmed: true,
        tx_id: 'tx_id',
      } as HiveEngineTransactionStatus);
      FavoriteUserUtils.saveFavoriteUser = jest
        .fn()
        .mockResolvedValue(undefined);
      await act(async () => {
        await userEvent.type(
          screen.getByTestId(dataTestIdInput.username),
          mk.user.two,
        );
        await userEvent.type(screen.getByTestId(dataTestIdInput.amount), '1');
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.operation.tokens.transfer.send),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.dialog.confirm),
        );
      });
      expect(
        await screen.findByText(
          chrome.i18n.getMessage('popup_html_transfer_successful', [
            `@${mk.user.two}`,
            formattedAmount,
          ]),
        ),
      ).toBeInTheDocument();
    });
  });
});

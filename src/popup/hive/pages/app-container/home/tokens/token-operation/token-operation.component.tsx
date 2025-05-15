import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { HiveEngineTransactionStatus } from '@interfaces/transaction-status.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import Decimal from 'decimal.js';
import { FormatUtils } from 'hive-keychain-commons';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { fetchPhishingAccounts } from 'src/popup/hive/actions/phishing.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';

export enum TokenOperationType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  DELEGATE = 'delegate',
}

interface TokenOperationForm {
  receiverUsername: string;
  symbol: string;
  amount: number;
}

const tokenOperationRules = FormUtils.createRules<TokenOperationForm>({
  receiverUsername: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
});

const TokensOperation = ({
  operationType,
  activeAccount,
  tokenBalance,
  tokenInfo,
  formParams,
  localAccounts,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  goBack,
  pendingUnstaking,
}: PropsFromRedux) => {
  const [balance, setBalance] = useState<number>();
  const { control, handleSubmit, setValue, watch } =
    useForm<TokenOperationForm>({
      defaultValues: {
        receiverUsername: formParams.receiverUsername
          ? formParams.receiverUsername
          : operationType === TokenOperationType.DELEGATE
          ? ''
          : activeAccount.name,
        amount: formParams.amount ? formParams.amount : '',
        symbol: formParams.symbol ? formParams.symbol : tokenBalance.symbol,
      },
      resolver: (values, context, options) => {
        const resolver = joiResolver<Joi.ObjectSchema<TokenOperationForm>>(
          tokenOperationRules,
          { context: { balance: balance }, errors: { render: true } },
        );
        return resolver(values, { balance: balance }, options);
      },
    });

  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  useEffect(() => {
    setTitleContainerProperties({
      title: `popup_html_${operationType}_tokens`,
      isBackButtonEnabled: true,
    });
    loadAutocompleteFavoriteUsers();
    switch (operationType) {
      case TokenOperationType.UNSTAKE:
      case TokenOperationType.DELEGATE:
        const tokenUnstaking = pendingUnstaking!.filter(
          (e) => e.symbol === tokenBalance.symbol,
        );
        const sumUnstaking = tokenUnstaking.reduce(
          (a, b) =>
            Decimal.sub(
              a,
              Decimal.div(parseFloat(b.quantity), tokenInfo.numberTransactions),
            )
              .add(parseFloat(b.quantityLeft))
              .toNumber(),
          0,
        );
        const available = Decimal.sub(
          parseFloat(tokenBalance.stake),
          sumUnstaking,
        )
          .times(Decimal.pow(10, tokenInfo.precision))
          .floor()
          .div(Decimal.pow(10, tokenInfo.precision))
          .toNumber();
        setBalance(available);
        break;
      case TokenOperationType.STAKE:
        setBalance(parseFloat(tokenBalance.balance));
        break;
    }
  }, []);

  const loadAutocompleteFavoriteUsers = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const setAmountToMaxValue = () => {
    setValue('amount', parseFloat(balance!.toFixed(tokenInfo.precision)));
  };

  const getFormParams = () => {
    return watch();
  };

  const handleClickOnSend = async (form: TokenOperationForm) => {
    if (!(await AccountUtils.doesAccountExist(form.receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    if (parseFloat(form.amount.toString()) <= 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(form.amount.toString()) > parseFloat(balance!.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    const formattedAmount = `${parseFloat(form.amount.toString()).toFixed(8)} ${
      form.symbol
    }`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
      tokenInfo.precision,
    )} ${form.symbol}`;

    const fields = [
      { label: 'popup_html_transfer_amount', value: stringifiedAmount },
    ];

    if (operationType === TokenOperationType.DELEGATE) {
      fields.unshift({
        label: 'popup_html_transfer_to',
        value: `@${form.receiverUsername}`,
      });
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        `popup_html_${operationType}_tokens_confirm_text`,
      ),
      fields: fields,
      title: `popup_html_${operationType}_tokens`,
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList(
          `popup_html_${operationType}_tokens`,
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );
        let tokenOperationResult: HiveEngineTransactionStatus;
        try {
          switch (operationType) {
            case TokenOperationType.DELEGATE:
              tokenOperationResult = await TokensUtils.delegateToken(
                form.receiverUsername,
                form.symbol,
                form.amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
                options,
              );
              break;
            case TokenOperationType.STAKE:
              tokenOperationResult = await TokensUtils.stakeToken(
                form.receiverUsername,
                form.symbol,
                form.amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
                options,
              );
              break;
            case TokenOperationType.UNSTAKE:
              tokenOperationResult = await TokensUtils.unstakeToken(
                form.symbol,
                form.amount.toString(),
                activeAccount.keys.active!,
                activeAccount.name!,
                options,
              );
              break;
          }
          if (tokenOperationResult && tokenOperationResult.isUsingMultisig) {
            navigateTo(Screen.HOME_PAGE, true);
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else if (tokenOperationResult && tokenOperationResult.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');
            removeFromLoadingList(`popup_html_${operationType}_tokens`);
            removeFromLoadingList('html_popup_confirm_transaction_operation');
            if (tokenOperationResult.confirmed) {
              await FavoriteUserUtils.saveFavoriteUser(
                form.receiverUsername,
                activeAccount,
              );
              setSuccessMessage(`popup_html_${operationType}_tokens_success`);
              navigateTo(Screen.HOME_PAGE, true);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            removeFromLoadingList(`popup_html_${operationType}_tokens`);
            setErrorMessage(`popup_html_${operationType}_tokens_failed`);
          }
        } catch (err: any) {
          setErrorMessage(err.message, [err]);
        } finally {
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList(`popup_html_${operationType}_tokens`);
        }
      },
    } as ConfirmationPageParams);
  };

  const getSubmitButtonLabel = () => {
    switch (operationType) {
      case TokenOperationType.DELEGATE:
        return 'popup_html_token_delegate';
      case TokenOperationType.STAKE:
        return 'popup_html_token_stake';
      case TokenOperationType.UNSTAKE:
        return 'popup_html_token_unstake';
      default:
        return 'popup_html_send_transfer';
    }
  };

  return (
    <div
      data-testid={`${Screen.TOKENS_OPERATION}-page`}
      className="tokens-operation-page">
      {balance !== undefined && (
        <BalanceSectionComponent
          value={balance}
          unit={watch('symbol')}
          label="popup_html_balance"
          decimals={tokenInfo.precision}
        />
      )}
      <div className="caption">
        {chrome.i18n.getMessage('popup_html_tokens_operation_text')}
      </div>
      {operationType === TokenOperationType.UNSTAKE &&
        tokenInfo.unstakingCooldown > 0 && (
          <div className="cooldown-message">
            {chrome.i18n.getMessage(
              'popup_html_token_unstake_cooldown_disclaimer',
              [tokenInfo.unstakingCooldown.toString()],
            )}
          </div>
        )}

      <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
        <div className="form-fields">
          {operationType === TokenOperationType.DELEGATE && (
            <FormInputComponent
              control={control}
              name="receiverUsername"
              dataTestId="input-username"
              type={InputType.TEXT}
              logo={SVGIcons.INPUT_AT}
              placeholder="popup_html_username"
              autocompleteValues={autocompleteFavoriteUsers}
            />
          )}
          <div className="value-panel">
            <FormInputComponent
              classname="currency-fake-input"
              dataTestId="currency-input"
              control={control}
              name="symbol"
              type={InputType.TEXT}
              label="popup_html_currency"
              disabled
            />
            <FormInputComponent
              dataTestId="amount-input"
              name="amount"
              control={control}
              type={InputType.NUMBER}
              min={0}
              placeholder="0.000"
              label="popup_html_transfer_amount"
              skipPlaceholderTranslation={true}
              rightActionClicked={setAmountToMaxValue}
              rightActionIcon={SVGIcons.INPUT_MAX}
            />
          </div>
        </div>
        <OperationButtonComponent
          dataTestId={`token-button-operation-${operationType}`}
          requiredKey={KeychainKeyTypesLC.active}
          label={getSubmitButtonLabel()}
          onClick={handleSubmit(handleClickOnSend)}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.hive.activeRpc?.testnet!,
    ),
    tokenBalance: state.navigation.stack[0].params
      ?.tokenBalance as TokenBalance,
    tokenInfo: state.navigation.stack[0].params.tokenInfo as Token,
    operationType: state.navigation.stack[0].params
      ?.operationType as TokenOperationType,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.hive.phishing,
    localAccounts: state.hive.accounts,
    pendingUnstaking: state.hive.tokensPendingUnstaking,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  goBack,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensOperationComponent = connector(TokensOperation);

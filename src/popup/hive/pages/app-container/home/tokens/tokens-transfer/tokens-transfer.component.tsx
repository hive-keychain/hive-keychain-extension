import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
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
import HiveUtils from 'src/popup/hive/utils/hive.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';

interface TokenTransferForm {
  receiverUsername: string;
  symbol: string;
  amount: number;
  memo: string;
}

const tokenOperationRules = FormUtils.createRules<TokenTransferForm>({
  receiverUsername: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
});

const TokensTransfer = ({
  activeAccount,
  tokenBalance,
  tokenInfo,
  phishing,
  formParams,
  localAccounts,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [balance, setBalance] = useState<number>(
    formParams.balance
      ? parseFloat(formParams.balance)
      : parseFloat(tokenBalance.balance),
  );

  const { control, handleSubmit, setValue, watch } = useForm<TokenTransferForm>(
    {
      defaultValues: {
        receiverUsername: formParams.receiverUsername
          ? formParams.receiverUsername
          : '',
        amount: formParams.amount ? formParams.amount : '',
        symbol: formParams.symbol ? formParams.symbol : tokenBalance.symbol,
        memo: formParams.memo ? formParams.memo : '',
      },
      resolver: (values, context, options) => {
        const resolver = joiResolver<Joi.ObjectSchema<TokenTransferForm>>(
          tokenOperationRules,
          { context: { balance: balance }, errors: { render: true } },
        );
        return resolver(values, { balance: balance }, options);
      },
    },
  );

  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_tokens',
      isBackButtonEnabled: true,
    });
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
  }, []);

  const loadAutocompleteTransferUsernames = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const setAmountToMaxValue = () => {
    setValue('amount', parseFloat(balance.toString()));
  };

  const getFormParams = () => {
    return watch();
  };

  const handleClickOnSend = async (form: TokenTransferForm) => {
    if (
      String(form.receiverUsername).trim().length === 0 ||
      form.amount.toString().trim().length === 0
    ) {
      setErrorMessage('popup_accounts_fill');
      return;
    }

    if (parseFloat(form.amount.toString()) < 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(form.amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (!(await AccountUtils.doesAccountExist(form.receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    const formattedAmount = `${parseFloat(form.amount.toString()).toFixed(
      tokenInfo.precision,
    )} ${form.symbol}`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
      tokenInfo.precision,
    )} ${form.symbol}`;

    let memoField = form.memo;
    if (form.memo.length) {
      if (form.memo.startsWith('#')) {
        memoField = `${form.memo} (${chrome.i18n.getMessage(
          'popup_encrypted',
        )})`;
        if (!activeAccount.keys.memo) {
          setErrorMessage('popup_html_memo_key_missing');
          return;
        }
      }
    } else {
      memoField = chrome.i18n.getMessage('popup_empty');
    }

    const fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${form.receiverUsername}` },
      { label: 'popup_html_transfer_amount', value: stringifiedAmount },
      { label: 'popup_html_transfer_memo', value: memoField },
    ];

    let warningMessage = await TransferUtils.getExchangeValidationWarning(
      form.receiverUsername,
      form.symbol,
      form.memo.length > 0,
    );

    if (phishing.includes(form.receiverUsername)) {
      warningMessage = chrome.i18n.getMessage('popup_warning_phishing', [
        form.receiverUsername,
      ]);
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage('popup_html_token_confirm_text'),
      fields: fields,
      warningMessage: warningMessage,
      title: 'popup_html_transfer_tokens',
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        try {
          let memoParam = form.memo;
          if (form.memo.length) {
            if (form.memo.startsWith('#')) {
              if (!activeAccount.keys.memo) {
                setErrorMessage('popup_html_memo_key_missing');
                return;
              } else {
                memoParam = HiveUtils.encodeMemo(
                  form.memo,
                  activeAccount.keys.memo.toString(),
                  await AccountUtils.getPublicMemo(form.receiverUsername),
                );
              }
            }
          }

          addToLoadingList(
            'html_popup_transfer_token_operation',
            KeysUtils.getKeyType(
              activeAccount.keys.active!,
              activeAccount.keys.activePubkey!,
            ),
          );
          const transactionStatus = await TokensUtils.sendToken(
            form.symbol,
            form.receiverUsername,
            form.amount.toString(),
            memoParam,
            activeAccount.keys.active!,
            activeAccount.name!,
            options,
          );

          if (transactionStatus.isUsingMultisig) {
            navigateTo(Screen.HOME_PAGE, true);
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else if (transactionStatus.broadcasted) {
            addToLoadingList('html_popup_confirm_transaction_operation');
            removeFromLoadingList('html_popup_transfer_token_operation');

            if (transactionStatus.confirmed) {
              navigateTo(Screen.HOME_PAGE, true);
              await FavoriteUserUtils.saveFavoriteUser(
                form.receiverUsername,
                activeAccount,
              );

              setSuccessMessage('popup_html_transfer_successful', [
                `@${form.receiverUsername}`,
                stringifiedAmount,
              ]);
            } else {
              setErrorMessage('popup_token_timeout');
            }
          } else {
            setErrorMessage('popup_html_transfer_failed');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_transfer_token_operation');
          removeFromLoadingList('html_popup_confirm_transaction_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  return (
    <div
      data-testid={`${Screen.TOKENS_TRANSFER}-page`}
      className="transfer-tokens-page">
      <BalanceSectionComponent
        value={balance}
        unit={watch('symbol')}
        label="popup_html_balance"
        decimals={tokenInfo.precision}
      />

      <div className="caption">
        {chrome.i18n.getMessage('popup_html_tokens_send_text')}
      </div>

      <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
        <FormInputComponent
          control={control}
          name="receiverUsername"
          dataTestId="input-username"
          type={InputType.TEXT}
          logo={SVGIcons.INPUT_AT}
          placeholder="popup_html_username"
          label="popup_html_username"
          autocompleteValues={autocompleteFavoriteUsers}
        />
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

        <FormInputComponent
          control={control}
          name="memo"
          dataTestId="input-memo-optional"
          type={InputType.TEXT}
          placeholder="popup_html_memo_optional"
          label="popup_html_memo_optional"
        />
        <OperationButtonComponent
          dataTestId="button-send-tokens-transfer"
          requiredKey={KeychainKeyTypesLC.active}
          label={'popup_html_send_transfer'}
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
    tokenInfo: state.navigation.stack[0].params?.tokenInfo as Token,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.hive.phishing,
    localAccounts: state.hive.accounts,
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensTransferComponent = connector(TokensTransfer);

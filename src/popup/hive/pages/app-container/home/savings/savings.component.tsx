import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { SavingsWithdrawal } from '@interfaces/savings.interface';
import { ResourceItemComponent } from '@popup/hive/pages/app-container/home/resources-section/resource-item/resource-item.component';
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
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { ConfirmationPageFieldTag } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import { SavingOperationType } from 'src/popup/hive/pages/app-container/home/savings/savings-operation-type.enum';
import CurrencyUtils, {
  CurrencyLabels,
} from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { SavingsUtils } from 'src/popup/hive/utils/savings.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';

interface SavingsForm {
  username: string;
  amount: number;
  currency: string;
  type: SavingOperationType;
}

interface SelectSavingsTypeOperation {
  label: string;
  value: SavingOperationType;
}

const rules = FormUtils.createRules<SavingsForm>({
  username: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$maxAmount')),
});

const SavingsPage = ({
  currencyLabels,
  paramsSelectedCurrency,
  activeAccount,
  globalProperties,
  formParams,
  localAccounts,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } = useForm<SavingsForm>({
    defaultValues: {
      username: formParams.username ? formParams.username : activeAccount.name,
      amount: formParams.amount ? formParams.amount : '',
      currency: formParams.currency
        ? formParams.currency
        : paramsSelectedCurrency,
      type: formParams.type
        ? (formParams.type as SavingOperationType)
        : SavingOperationType.DEPOSIT,
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<SavingsForm>>(rules, {
        context: { maxAmount: maxAmount },
        errors: { render: true },
      });
      return resolver(values, { maxAmount: maxAmount }, options);
    },
  });

  const [text, setText] = useState('');
  const [savings, setSavings] = useState<string | number>('...');
  const [liquid, setLiquid] = useState<string | number>('...');
  const [savingsPendingWithdrawalList, setSavingsPendingWithdrawalList] =
    useState<SavingsWithdrawal[]>([]);
  const [totalPendingValue, setTotalPendingValue] = useState<
    number | undefined
  >();
  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({ categories: [] });

  const [maxAmount, setMaxAmount] = useState<number>(0);

  const currencyOptions = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

  const savingOperationTypeOptions: SelectSavingsTypeOperation[] = [
    {
      label: chrome.i18n.getMessage(SavingOperationType.WITHDRAW),
      value: SavingOperationType.WITHDRAW,
    },
    {
      label: chrome.i18n.getMessage(SavingOperationType.DEPOSIT),
      value: SavingOperationType.DEPOSIT,
    },
  ];

  useEffect(() => {
    loadAutocompleteFavoriteUsers();
    setTitleContainerProperties({
      title: 'popup_html_savings',
      isBackButtonEnabled: true,
      titleParams: [currencyLabels[watch('currency') as keyof CurrencyLabels]],
    });
  }, [watch('currency')]);

  useEffect(() => {
    if (activeAccount.account.savings_withdraw_requests > 0) {
      fetchCurrentWithdrawingList();
    }
    const hbdSavings = FormatUtils.toNumber(
      activeAccount.account.savings_hbd_balance as string,
    );
    const hiveSavings = FormatUtils.toNumber(
      activeAccount.account.savings_balance as string,
    );
    const hbd = FormatUtils.toNumber(
      activeAccount.account.hbd_balance as string,
    );
    const hive = FormatUtils.toNumber(activeAccount.account.balance as string);

    const liquidValue = watch('currency') === 'hive' ? hive : hbd;
    const savingsValue =
      watch('currency') === 'hive' ? hiveSavings : hbdSavings;

    setLiquid(liquidValue);
    setSavings(savingsValue);
    setMaxAmount(
      watch('type') === SavingOperationType.DEPOSIT
        ? Number(liquidValue)
        : Number(savingsValue),
    );
  }, [watch('currency')]);

  useEffect(() => {
    let text = '';
    if (watch('type') === SavingOperationType.DEPOSIT) {
      if (watch('currency') === 'hbd') {
        text = chrome.i18n.getMessage('popup_html_deposit_hbd_text', [
          Number(globalProperties.globals?.hbd_interest_rate) / 100 + '',
        ]);
      }
    } else {
      text = chrome.i18n.getMessage('popup_html_withdraw_text');
    }
    setText(text);
  }, [watch('currency'), watch('type')]);

  useEffect(() => {
    if (typeof liquid === 'number' && typeof savings === 'number') {
      setMaxAmount(
        watch('type') === SavingOperationType.DEPOSIT
          ? Number(liquid)
          : Number(savings),
      );
    }
  }, [watch('type')]);

  const fetchCurrentWithdrawingList = async () => {
    const savingsPendingWithdrawalList =
      await SavingsUtils.getSavingsWithdrawals(activeAccount.name!);

    const totalPendingValue = filterSavingsPendingWithdrawalList(
      savingsPendingWithdrawalList,
      currencyLabels[watch('currency') as keyof CurrencyLabels],
    ).reduce((acc, curr) => acc + parseFloat(curr.amount.split(' ')[0]), 0);
    setTotalPendingValue(
      totalPendingValue !== 0 ? totalPendingValue : undefined,
    );

    setSavingsPendingWithdrawalList(
      filterSavingsPendingWithdrawalList(
        savingsPendingWithdrawalList,
        currencyLabels[watch('currency') as keyof CurrencyLabels],
      ),
    );
  };

  const loadAutocompleteFavoriteUsers = async () => {
    setAutocompleteFavoriteUsers(
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      ),
    );
  };

  const handleButtonClick = (form: SavingsForm) => {
    if (
      (watch('type') === SavingOperationType.DEPOSIT &&
        parseFloat(form.amount.toString()) > parseFloat(liquid.toString())) ||
      (watch('type') === SavingOperationType.WITHDRAW &&
        parseFloat(form.amount.toString()) > parseFloat(savings.toString()))
    ) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    let operationString = chrome.i18n.getMessage(
      watch('type') === SavingOperationType.WITHDRAW
        ? 'popup_html_withdraw_param'
        : 'popup_html_deposit_param',
      [currencyLabels[form.currency as keyof CurrencyLabels]],
    );

    const formattedAmount = `${parseFloat(form.amount.toString()).toFixed(3)} ${
      currencyLabels[watch('currency') as keyof CurrencyLabels]
    }`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
    )} ${currencyLabels[watch('currency') as keyof CurrencyLabels]}`;

    let warning = TransferUtils.getTransferFromToSavingsValidationWarning(
      form.username,
      watch('type'),
    );

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        watch('type') === SavingOperationType.WITHDRAW
          ? 'popup_html_confirm_savings_withdraw'
          : 'popup_html_confirm_savings_deposit',
        [currencyLabels[watch('currency') as keyof CurrencyLabels]],
      ),
      warningMessage: warning,
      skipWarningTranslation: true,
      title: operationString,
      skipTitleTranslation: true,
      fields: [
        {
          label: 'popup_html_value',
          value: stringifiedAmount,
          tag: ConfirmationPageFieldTag.AMOUNT,
          tokenSymbol:
            currencyLabels[watch('currency') as keyof CurrencyLabels],
          iconPosition: 'right',
        },
        {
          label: 'popup_html_username',
          value: `@${form.username}`,
          tag: ConfirmationPageFieldTag.USERNAME,
          iconPosition: 'right',
        },
      ],
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        try {
          let success;
          switch (watch('type')) {
            case SavingOperationType.DEPOSIT:
              addToLoadingList('html_popup_deposit_to_savings_operation');
              success = await SavingsUtils.deposit(
                formattedAmount,
                form.username,
                activeAccount.name!,
                activeAccount.keys.active!,
                options,
              );
              break;
            case SavingOperationType.WITHDRAW:
              addToLoadingList('html_popup_withdraw_from_savings_operation');
              success = await SavingsUtils.withdraw(
                formattedAmount,
                form.username,
                activeAccount.name!,
                activeAccount.keys.active!,
                options,
              );
              break;
          }

          navigateTo(Screen.HOME_PAGE, true);
          if (success) {
            await FavoriteUserUtils.saveFavoriteUser(
              form.username,
              activeAccount,
            );
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              setSuccessMessage(
                watch('type') === SavingOperationType.DEPOSIT
                  ? 'popup_html_deposit_success'
                  : 'popup_html_withdraw_success',
                [stringifiedAmount],
              );
            }
          } else {
            setErrorMessage(
              watch('type') === SavingOperationType.DEPOSIT
                ? 'popup_html_deposit_fail'
                : 'popup_html_withdraw_fail',
              [watch('currency').toUpperCase()],
            );
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_deposit_to_savings_operation');
          removeFromLoadingList('html_popup_withdraw_from_savings_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const getFormParams = () => {
    return watch();
  };

  const setToMax = () => {
    if (watch('type') === SavingOperationType.WITHDRAW) {
      setValue('amount', Number(savings));
    } else {
      setValue('amount', Number(liquid));
    }
  };

  const goToPendingSavingsWithdrawal = () => {
    navigateToWithParams(Screen.PENDING_SAVINGS_WITHDRAWAL_PAGE, {
      savingsPendingWithdrawalList: filterSavingsPendingWithdrawalList(
        savingsPendingWithdrawalList,
        currencyLabels[watch('currency') as keyof CurrencyLabels],
      ),
      currency: watch('currency'),
    });
  };

  const filterSavingsPendingWithdrawalList = (
    pendinSavingsWidrawal: SavingsWithdrawal[],
    currency: string,
  ) => {
    return pendinSavingsWidrawal.filter(
      (pendingWithdrawItem) =>
        pendingWithdrawItem.amount.split(' ')[1] === currency,
    );
  };

  return (
    <div className="savings-page" data-testid={`${Screen.SAVINGS_PAGE}-page`}>
      <div className="resources">
        <ResourceItemComponent
          icon={SVGIcons.RESOURCE_ITEM_SAVINGS}
          label="popup_html_savings_current"
          value={`${savings} ${
            currencyLabels[watch('currency') as keyof CurrencyLabels]
          }`}
          additionalClass="blue"
        />
        <ResourceItemComponent
          icon={SVGIcons.RESOURCE_ITEM_WALLET}
          label="popup_html_savings_available"
          value={`${liquid} ${
            currencyLabels[watch('currency') as keyof CurrencyLabels]
          }`}
          additionalClass="red"
        />
      </div>

      {totalPendingValue && totalPendingValue > 0 && (
        <div
          className="pending-savings-panel"
          onClick={goToPendingSavingsWithdrawal}>
          <div className="pending-savings-text">
            {chrome.i18n.getMessage('popup_html_pending_savings_withdrawal', [
              FormatUtils.formatCurrencyValue(totalPendingValue, 3),
              currencyLabels[watch('currency') as keyof CurrencyLabels],
            ])}
          </div>
        </div>
      )}

      <FormContainer onSubmit={handleSubmit(handleButtonClick)}>
        {text.length > 0 && (
          <>
            <div className="text">{text}</div>
            <Separator type="horizontal" fullSize />
          </>
        )}

        <div className="form-fields">
          <ComplexeCustomSelect
            label="popup_html_savings_operation_type"
            options={savingOperationTypeOptions}
            selectedItem={
              {
                value: watch('type'),
                label: chrome.i18n.getMessage(watch('type')),
              } as SelectSavingsTypeOperation
            }
            setSelectedItem={(item: SelectSavingsTypeOperation) =>
              setValue('type', item.value)
            }
          />

          <FormInputComponent
            name="username"
            control={control}
            dataTestId="input-username"
            type={InputType.TEXT}
            logo={SVGIcons.INPUT_AT}
            placeholder="popup_html_username"
            label="popup_html_username"
            autocompleteValues={autocompleteFavoriteUsers}
          />

          <div className="amount-panel">
            <ComplexeCustomSelect
              label="popup_html_currency"
              options={currencyOptions}
              selectedItem={
                {
                  value: watch('currency'),
                  label:
                    currencyLabels[watch('currency') as keyof CurrencyLabels],
                } as CurrencyListItem
              }
              setSelectedItem={(item: CurrencyListItem) =>
                setValue('currency', item.value)
              }
            />
            <FormInputComponent
              name="amount"
              control={control}
              dataTestId="amount-input"
              type={InputType.NUMBER}
              label="popup_html_transfer_amount"
              placeholder="0.000"
              skipPlaceholderTranslation
              min={0}
              rightActionClicked={setToMax}
              rightActionIcon={SVGIcons.INPUT_MAX}
            />
          </div>
        </div>
        <OperationButtonComponent
          dataTestId="submit-savings"
          requiredKey={KeychainKeyTypesLC.active}
          label={
            watch('type') === SavingOperationType.WITHDRAW
              ? 'popup_html_withdraw_param'
              : 'popup_html_deposit_param'
          }
          labelParams={[
            currencyLabels[watch('currency') as keyof CurrencyLabels],
          ]}
          onClick={handleSubmit(handleButtonClick)}
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
    powerType: state.navigation.stack[0].params.powerType as PowerType,
    globalProperties: state.hive.globalProperties,
    paramsSelectedCurrency: state.navigation.stack[0].params
      .selectedCurrency as keyof CurrencyLabels,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    localAccounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SavingsPageComponent = connector(SavingsPage);

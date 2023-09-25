import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { CheckboxFormComponent } from 'src/common-ui/checkbox/checkbox/form-checkbox.component';
import {
  CustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from 'src/popup/hive/actions/navigation.actions';
import { fetchPhishingAccounts } from 'src/popup/hive/actions/phishing.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils, {
  CurrencyLabels,
} from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import HiveUtils from 'src/popup/hive/utils/hive.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

interface TransferForm {
  receiverUsername: string;
  selectedCurrency: keyof CurrencyLabels;
  amount: number;
  memo: string;
  encrypted: boolean;
  isRecurrent: boolean;
  frequency: number;
  iteration: number;
}

const transferFormRules = FormUtils.createRules<TransferForm>({
  receiverUsername: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
  frequency: Joi.alternatives().conditional('isRecurrent', {
    is: true,
    then: Joi.number().min(24).required(),
    otherwise: Joi.optional(),
  }),
  iteration: Joi.alternatives().conditional('isRecurrent', {
    is: true,
    then: Joi.number().min(2).required(),
    otherwise: Joi.optional(),
  }),
});

const TransferFunds = ({
  activeAccount,
  navParams,
  currencyLabels,
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
  const { control, handleSubmit, setValue, watch } = useForm<TransferForm>({
    defaultValues: {
      receiverUsername: formParams.receiverUsername
        ? formParams.receiverUsername
        : '',
      selectedCurrency: formParams.selectedCurrency
        ? formParams.selectedCurrency
        : navParams.selectedCurrency,
      amount: formParams.amount ? formParams.amount : '',
      memo: formParams.memo ? formParams.memo : '',
      encrypted: formParams.encrypted ? formParams.encrypted : false,
      isRecurrent: formParams.isRecurrent ? formParams.isRecurrent : false,
      frequency: formParams.frequency ? formParams.frequency : '',
      iteration: formParams.iteration ? formParams.iteration : '',
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<TransferForm>>(
        transferFormRules,
        { context: { balance: balance }, errors: { render: true } }, //TODO set render to false
      );
      return resolver(values, { balance: balance }, options);
    },
  });

  const [balance, setBalance] = useState<string | number>('...');

  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({
      categories: [],
    });

  let balances = {
    hive: FormatUtils.toNumber(activeAccount.account.balance),
    hbd: FormatUtils.toNumber(activeAccount.account.hbd_balance),
    hp: 0,
  };

  useEffect(() => {
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
    setTitleContainerProperties({
      title: 'popup_html_transfer_funds',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    setBalance(balances[watch('selectedCurrency')]);
    loadAutocompleteTransferUsernames();
  }, [watch('selectedCurrency')]);

  const options = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];

  const loadAutocompleteTransferUsernames = async () => {
    const autoCompleteListByCategories: AutoCompleteValues =
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
        { addExchanges: true, token: watch('selectedCurrency').toUpperCase() },
      );
    setAutocompleteFavoriteUsers(autoCompleteListByCategories);
  };

  const setAmountToMaxValue = () => {
    setValue('amount', parseFloat(balance.toString()));
  };

  const getFormParams = () => {
    return control;
  };

  const handleClickOnSend = async (form: TransferForm) => {
    if (form.amount <= 0 && !form.isRecurrent) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(form.amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const formattedAmount = `${parseFloat(form.amount.toString()).toFixed(3)} ${
      currencyLabels[form.selectedCurrency]
    }`;

    let memoField = form.memo;
    if (form.memo.length) {
      if (form.memo.startsWith('#') || form.encrypted) {
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

    let fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${form.receiverUsername}` },
      { label: 'popup_html_transfer_amount', value: formattedAmount },
      { label: 'popup_html_transfer_memo', value: memoField },
    ];

    const isCancelRecurrent = form.amount === 0 && form.isRecurrent;

    if (
      form.isRecurrent &&
      !isCancelRecurrent &&
      (!form.frequency || !form.iteration)
    ) {
      setErrorMessage('popup_html_transfer_recurrent_missing_field');
      return;
    }

    if (form.isRecurrent && !isCancelRecurrent) {
      fields.push({
        label: 'popup_html_transfer_recurrence',
        value: chrome.i18n.getMessage('popup_html_transfer_recurrence_value', [
          form.frequency.toString(),
          form.iteration.toString(),
        ]),
      });
    }
    if (isCancelRecurrent) {
      fields = [fields[0], fields[1]];
    }

    let warningMessage = await TransferUtils.getTransferWarning(
      form.receiverUsername,
      currencyLabels[form.selectedCurrency],
      form.memo,
      phishing,
      form.isRecurrent,
    );

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        isCancelRecurrent
          ? 'popup_html_transfer_confirm_cancel_recurrent'
          : 'popup_html_transfer_confirm_text',
      ),
      fields: fields,
      warningMessage: warningMessage,
      skipWarningTranslation: true,
      title: isCancelRecurrent
        ? 'popup_html_cancel_recurrent_transfer'
        : 'popup_html_transfer_funds',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          'html_popup_transfer_fund_operation',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );
        try {
          let success;
          let memoParam = form.memo;
          if (form.memo.length) {
            if (form.memo.startsWith('#') || form.encrypted) {
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

          success = await TransferUtils.sendTransfer(
            activeAccount.name!,
            form.receiverUsername,
            formattedAmount,
            memoParam,
            form.isRecurrent,
            isCancelRecurrent ? 2 : +form.iteration,
            isCancelRecurrent ? 24 : +form.frequency,
            activeAccount.keys.active!,
          );

          removeFromLoadingList('html_popup_transfer_fund_operation');

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.receiverUsername,
              activeAccount,
            );

            if (!form.isRecurrent) {
              setSuccessMessage('popup_html_transfer_successful', [
                `@${form.receiverUsername}`,
                formattedAmount,
              ]);
            } else {
              isCancelRecurrent
                ? setSuccessMessage(
                    'popup_html_cancel_transfer_recurrent_successful',
                    [`@${form.receiverUsername}`],
                  )
                : setSuccessMessage(
                    'popup_html_transfer_recurrent_successful',
                    [
                      `@${form.receiverUsername}`,
                      formattedAmount,
                      form.frequency.toString(),
                      form.iteration.toString(),
                    ],
                  );
            }
          } else {
            setErrorMessage('popup_html_transfer_failed');
          }
        } catch (err: any) {
          Logger.error(err);
          setErrorMessage(err.message, err.messageParams);
        } finally {
          removeFromLoadingList('html_popup_transfer_fund_operation');
        }
      },
    });
  };

  return (
    <>
      <div
        className="transfer-funds-page"
        data-testid={`${Screen.TRANSFER_FUND_PAGE}-page`}>
        <BalanceSectionComponent
          value={balance}
          unit={currencyLabels[watch('selectedCurrency')]}
          label="popup_html_balance"
        />

        <FormContainer>
          <div className="form-fields">
            <FormInputComponent
              name="receiverUsername"
              control={control}
              dataTestId="input-username"
              type={InputType.TEXT}
              logo={NewIcons.INPUT_AT}
              placeholder="popup_html_username"
              label="popup_html_username"
              autocompleteValues={autocompleteFavoriteUsers}
            />
            <div className="value-panel">
              <CustomSelect
                label="popup_html_currency"
                options={options}
                selectedItem={
                  {
                    value: watch('selectedCurrency'),
                    label:
                      currencyLabels[
                        watch('selectedCurrency') as keyof CurrencyLabels
                      ],
                  } as OptionItem
                }
                setSelectedItem={(item) =>
                  setValue(
                    'selectedCurrency',
                    item.value as keyof CurrencyLabels,
                  )
                }
              />

              <div className="value-input-panel">
                <FormInputComponent
                  name="amount"
                  control={control}
                  dataTestId="amount-input"
                  type={InputType.NUMBER}
                  label="popup_html_transfer_amount"
                  placeholder="0.000"
                  skipPlaceholderTranslation
                  min={0}
                  rightActionClicked={setAmountToMaxValue}
                  rightActionIcon={NewIcons.INPUT_MAX}
                />
              </div>
            </div>

            <FormInputComponent
              name="memo"
              control={control}
              dataTestId="input-memo-optional"
              type={InputType.TEXT}
              label="popup_html_memo_optional"
              placeholder="popup_html_memo_optional"
              rightActionClicked={() =>
                setValue('encrypted', !watch('encrypted'))
              }
              rightActionIcon={
                watch('encrypted')
                  ? NewIcons.INPUT_ENCRYPT
                  : NewIcons.INPUT_DECRYPT
              }
            />
            <CheckboxFormComponent
              name="isRecurrent"
              control={control}
              dataTestId="checkbox-transfer-recurrent"
              title={
                watch('amount') === 0
                  ? 'popup_html_cancel_recurrent_transfer'
                  : 'popup_html_recurrent_transfer'
              }
            />
            {watch('isRecurrent') && watch('amount') !== 0 && (
              <div className="recurrent-panel">
                <FormInputComponent
                  name="frequency"
                  control={control}
                  dataTestId="input-recurrent-frecuency"
                  type={InputType.NUMBER}
                  placeholder="popup_html_recurrent_transfer_frequency"
                  label="popup_html_recurrent_transfer_frequency"
                  min={24}
                  step={1}
                  hint={'popup_html_recurrent_transfer_frequency_hint'}
                />
                <FormInputComponent
                  name="iteration"
                  control={control}
                  dataTestId="input-recurrent-iterations"
                  type={InputType.NUMBER}
                  label="popup_html_recurrent_transfer_iterations"
                  placeholder="popup_html_recurrent_transfer_iterations"
                  min={2}
                  step={1}
                  hint={'popup_html_recurrent_transfer_iterations_hint'}
                />
              </div>
            )}
          </div>
          <OperationButtonComponent
            dataTestId="send-transfer"
            requiredKey={KeychainKeyTypesLC.active}
            onClick={handleSubmit(handleClickOnSend)}
            label={'popup_html_send_transfer'}
          />
        </FormContainer>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    navParams: state.navigation.stack[0].params,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.phishing,
    localAccounts: state.accounts,
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

export const TransferFundsComponent = connector(TransferFunds);

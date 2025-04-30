import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
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
import {
  FormatUtils,
  VscHistoryType,
  VscStatus,
  VscUtils,
} from 'hive-keychain-commons';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import Config from 'src/config';
import { fetchPhishingAccounts } from 'src/popup/hive/actions/phishing.actions';
import CurrencyUtils, {
  CurrencyLabels,
} from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import TransferUtils from 'src/popup/hive/utils/transfer.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import Logger from 'src/utils/logger.utils';

interface DepositForm {
  receiver: string;
  selectedCurrency: keyof CurrencyLabels;
  amount: number;
}

const transferFormRules = FormUtils.createRules<DepositForm>({
  receiver: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
});

const TransferFromVsc = ({
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
  const { control, handleSubmit, setValue, watch } = useForm<DepositForm>({
    defaultValues: {
      receiver: formParams.receiverUsername
        ? formParams.receiverUsername
        : activeAccount.name,
      selectedCurrency: formParams.selectedCurrency
        ? formParams.selectedCurrency
        : navParams.selectedCurrency,
      amount: formParams.amount ? formParams.amount : '',
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<DepositForm>>(
        transferFormRules,
        { context: { balance: balance }, errors: { render: true } },
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
    hive: FormatUtils.toNumber(activeAccount.account.balance as string),
    hbd: FormatUtils.toNumber(activeAccount.account.hbd_balance as string),
    hp: 0,
  };

  useEffect(() => {
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
    setTitleContainerProperties({
      title: 'dialog_title_vsc_deposit',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    setBalance(balances[watch('selectedCurrency')]);
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
    return watch();
  };

  const handleClickOnSend = async (form: DepositForm) => {
    if (form.amount <= 0) {
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

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
    )} ${currencyLabels[form.selectedCurrency]}`;

    let fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${form.receiver}` },
      { label: 'popup_html_transfer_amount', value: stringifiedAmount },
    ];

    let warningMessage = await TransferUtils.getTransferWarning(
      form.receiver,
      currencyLabels[form.selectedCurrency],
      '',
      phishing,
      false,
    );
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage('popup_html_vsc_deposit_confirm_text'),
      fields: fields,
      warningMessage: warningMessage,
      skipWarningTranslation: true,
      title: 'dialog_title_vsc_deposit',
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList(
          'html_popup_transfer_fund_operation',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
        );
        addToLoadingList('html_popup_confirm_transaction_operation');

        try {
          let success;
          const memo = `to=${form.receiver}`;

          success = await TransferUtils.sendTransfer(
            activeAccount.name!,
            Config.vsc.ACCOUNT,
            formattedAmount,
            memo,
            false,
            0,
            0,
            activeAccount.keys.active!,
            options,
          );

          removeFromLoadingList('html_popup_transfer_fund_operation');

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            if (!form.receiver.startsWith('0x'))
              await FavoriteUserUtils.saveFavoriteUser(
                form.receiver,
                activeAccount,
              );

            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              const status = await VscUtils.waitForStatus(
                success?.tx_id,
                VscHistoryType.DEPOSIT,
                200,
              );
              const message =
                status === VscStatus.INCLUDED
                  ? 'bgd_ops_vsc_included'
                  : status === VscStatus.CONFIRMED
                  ? 'bgd_ops_vsc_confirmed'
                  : 'bgd_ops_vsc_not_included';

              removeFromLoadingList('html_popup_confirm_transaction_operation');
              setSuccessMessage(message);
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
    } as ConfirmationPageParams);
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

        <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
          <div className="form-fields">
            <FormInputComponent
              name="receiver"
              control={control}
              dataTestId="input-username"
              type={InputType.TEXT}
              logo={SVGIcons.INPUT_AT}
              placeholder="popup_html_receiver"
              label="popup_html_receiver"
              autocompleteValues={autocompleteFavoriteUsers}
            />
            <div className="value-panel">
              <ComplexeCustomSelect
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
                  rightActionIcon={SVGIcons.INPUT_MAX}
                />
              </div>
            </div>
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
    activeAccount: state.hive.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(
      state.hive.activeRpc?.testnet!,
    ),
    navParams: state.navigation.stack[0].params,
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

export const VscTransferComponent = connector(TransferFromVsc);

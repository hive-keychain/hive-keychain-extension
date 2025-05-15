import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
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
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { loadDelegatees } from 'src/popup/hive/actions/delegations.actions';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { PowerUtils } from 'src/popup/hive/utils/power.utils';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';

interface PowerUpDownForm {
  receiver: string;
  amount: number;
  currency: string;
}

const rules = FormUtils.createRules<PowerUpDownForm>({
  receiver: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$maxAmount')),
});

const PowerUpDown = ({
  currencyLabels,
  activeAccount,
  powerType,
  globalProperties,
  formParams,
  delegations,
  localAccounts,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } = useForm<PowerUpDownForm>({
    defaultValues: {
      receiver: formParams.receiver ? formParams.receiver : activeAccount.name,
      amount: formParams.amount ? formParams.amount : '',
      currency:
        powerType === PowerType.POWER_UP
          ? currencyLabels.hive
          : currencyLabels.hp,
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<PowerUpDownForm>>(rules, {
        context: { maxAmount: available },
        errors: { render: true },
      });
      return resolver(values, { maxAmount: available }, options);
    },
  });

  const [current, setCurrent] = useState<string | number>('...');
  const [available, setAvailable] = useState<string | number>('...');
  const [autocompleteFavoriteUsers, setAutocompleteFavoriteUsers] =
    useState<AutoCompleteValues>({
      categories: [],
    });

  const loadAutocompleteTransferUsernames = async () => {
    const autoCompleteListByCategories: AutoCompleteValues =
      await FavoriteUserUtils.getAutocompleteListByCategories(
        activeAccount.name!,
        localAccounts,
      );
    setAutocompleteFavoriteUsers(autoCompleteListByCategories);
  };

  useEffect(() => {
    setTitleContainerProperties({ title: title, isBackButtonEnabled: true });
    loadDelegatees(activeAccount.name!);
    loadAutocompleteTransferUsernames();
  }, []);

  const powerDownInfo = AccountUtils.getPowerDown(
    activeAccount.account,
    globalProperties.globals!,
  );

  useEffect(() => {
    const hiveBalance = FormatUtils.toNumber(
      activeAccount.account.balance as string,
    );

    let totalOutgoingVestingShares = 0;
    for (const delegation of delegations.outgoing) {
      totalOutgoingVestingShares += parseFloat(
        delegation.vesting_shares.toString().split(' ')[0],
      );
    }

    const hpBalance = (
      FormatUtils.toHP(
        (
          parseFloat(
            activeAccount.account.vesting_shares
              .toString()
              .replace('VESTS', ''),
          ) - totalOutgoingVestingShares
        ).toString(),
        globalProperties.globals,
      ) - (powerType === PowerType.POWER_UP ? 0 : 5)
    ).toFixed(3);

    setAvailable(
      powerType === PowerType.POWER_UP
        ? hiveBalance
        : Math.max(Number(hpBalance), 0),
    );
    setCurrent(powerType === PowerType.POWER_UP ? hpBalance : hiveBalance);
  }, [activeAccount, delegations]);

  const title =
    powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd';
  const text =
    powerType === PowerType.POWER_UP
      ? 'popup_html_powerup_text'
      : 'popup_html_powerdown_text';

  const handleButtonClick = (form: PowerUpDownForm) => {
    if (form.amount.toString().trim() === '') {
      setErrorMessage('popup_html_fill_form_error');
      return;
    }
    if (
      powerType === PowerType.POWER_DOWN &&
      Number(form.amount).toFixed(3) === '0.000'
    ) {
      return handleCancelButtonClick(form);
    }

    if (parseFloat(form.amount.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const operationString = chrome.i18n.getMessage(
      powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd',
    );
    const formattedAmount = `${parseFloat(form.amount.toString()).toFixed(3)} ${
      form.currency
    }`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
    )} ${form.currency}`;

    const fields = [];

    if (powerType === PowerType.POWER_UP) {
      fields.push({
        label: 'popup_html_transfer_from',
        value: `@${activeAccount.name}`,
      });
      fields.push({
        label: 'popup_html_transfer_to',
        value: `@${form.receiver}`,
      });
    }

    fields.push({ label: 'popup_html_amount', value: stringifiedAmount });

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString.toLowerCase()],
      ),
      title:
        powerType === PowerType.POWER_UP
          ? 'html_popup_power_up'
          : 'html_popup_power_down',
      fields: fields,
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        let success;
        try {
          switch (powerType) {
            case PowerType.POWER_UP:
              addToLoadingList('html_popup_power_up_operation');
              success = await PowerUtils.powerUp(
                activeAccount.name!,
                form.receiver,
                formattedAmount,
                activeAccount.keys.active!,
                options,
              );
              break;
            case PowerType.POWER_DOWN:
              addToLoadingList('html_popup_power_down_operation');
              success = await PowerUtils.powerDown(
                activeAccount.name!,
                `${FormatUtils.fromHP(
                  Number(form.amount).toFixed(3),
                  globalProperties.globals!,
                ).toFixed(6)} VESTS`,
                activeAccount.keys.active!,
                options,
              );
          }
          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.receiver,
              activeAccount,
            );
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              setSuccessMessage('popup_html_power_up_down_success', [
                operationString,
              ]);
            }
          } else {
            setErrorMessage('popup_html_power_up_down_fail', [operationString]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_power_up_operation');
          removeFromLoadingList('html_popup_power_down_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  const setToMax = () => {
    setValue('amount', Number(available));
  };

  const getFormParams = () => {
    return watch();
  };

  const handleCancelButtonClick = (form: PowerUpDownForm) => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      title: 'popup_html_confirm_cancel_power_down_title',
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_power_down_message',
      ),
      fields: [],
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_cancel_power_down_operation');
        try {
          let success = await PowerUtils.powerDown(
            activeAccount.name!,
            `${FormatUtils.fromHP('0', globalProperties.globals!).toFixed(
              6,
            )} VESTS`,
            activeAccount.keys.active!,
            options,
          );

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.receiver,
              activeAccount,
            );
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              setSuccessMessage('popup_html_cancel_power_down_success');
            }
          } else {
            setErrorMessage('popup_html_cancel_power_down_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_cancel_power_down_operation');
        }
      },
    } as ConfirmationPageParams);
  };

  return (
    <div className="power-up-page" data-testid={`${Screen.POWER_UP_PAGE}-page`}>
      <div className="resources">
        <ResourceItemComponent
          icon={SVGIcons.RESOURCE_ITEM_MANA}
          label="popup_html_current"
          value={`${FormatUtils.formatCurrencyValue(
            current,
            parseFloat(current.toString()) > 100000 ? 0 : 3,
          )} ${
            powerType === PowerType.POWER_UP
              ? currencyLabels.hp
              : currencyLabels.hive
          }`}
          additionalClass="blue"
        />
        <ResourceItemComponent
          icon={SVGIcons.RESOURCE_ITEM_WALLET}
          label="popup_html_available"
          value={`${FormatUtils.formatCurrencyValue(
            available,
            parseFloat(available.toString()) > 100000 ? 0 : 3,
          )} ${
            powerType === PowerType.POWER_UP
              ? currencyLabels.hive
              : currencyLabels.hp
          }`}
          additionalClass="red"
        />
      </div>

      {powerType === PowerType.POWER_DOWN &&
        powerDownInfo &&
        powerDownInfo[1] !== '0' &&
        powerDownInfo[0] !== powerDownInfo[1] && (
          <CustomTooltip
            dataTestId="custom-tool-tip-next-power-down"
            message={chrome.i18n.getMessage('popup_next_powerdown', [
              powerDownInfo[2].split('T').join(', '),
            ])}
            skipTranslation>
            <div className="power-down-panel">
              <div className="power-down-text">
                {chrome.i18n.getMessage('popup_html_powering_down')}{' '}
                {powerDownInfo[0]} / {powerDownInfo[1]} {currencyLabels.hp}
              </div>
              <SVGIcon
                className="icon-button"
                icon={SVGIcons.GLOBAL_DELETE}
                onClick={handleCancelButtonClick}
              />
            </div>
          </CustomTooltip>
        )}

      <FormContainer onSubmit={handleSubmit(handleButtonClick)}>
        <div className="text">{chrome.i18n.getMessage(text)}</div>
        <Separator fullSize type="horizontal" />
        <div className="form-fields">
          {powerType === PowerType.POWER_UP && (
            <FormInputComponent
              dataTestId="input-receiver"
              control={control}
              name="receiver"
              type={InputType.TEXT}
              logo={SVGIcons.INPUT_AT}
              placeholder="popup_html_receiver"
              label="popup_html_receiver"
              autocompleteValues={autocompleteFavoriteUsers}
            />
          )}
          <div className="amount-panel">
            <FormInputComponent
              classname="currency-fake-input"
              dataTestId="currency-input"
              control={control}
              name="currency"
              type={InputType.TEXT}
              label="popup_html_currency"
              disabled
            />
            <FormInputComponent
              classname="amount-input"
              dataTestId="amount-input"
              control={control}
              name="amount"
              type={InputType.NUMBER}
              placeholder="0.000"
              skipPlaceholderTranslation
              label="popup_html_amount"
              rightActionClicked={setToMax}
              rightActionIcon={SVGIcons.INPUT_MAX}
            />
          </div>
        </div>

        <OperationButtonComponent
          dataTestId="submit-power-up-down"
          requiredKey={KeychainKeyTypesLC.active}
          label={title}
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
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    delegations: state.hive.delegations,
    localAccounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PowerUpDownComponent = connector(PowerUpDown);

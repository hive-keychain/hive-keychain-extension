import { joiResolver } from '@hookform/resolvers/joi';
import { ResourceItemComponent } from '@popup/hive/pages/app-container/home/resources-section/resource-item/resource-item.component';
import { KeychainKeyTypesLC } from 'hive-keychain-commons';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { Conversion as Delegations } from 'src/interfaces/conversion.interface';
import {
  loadDelegatees,
  loadDelegators,
  loadPendingOutgoingUndelegations,
} from 'src/popup/hive/actions/delegations.actions';
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
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from 'src/popup/hive/store';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { DelegationUtils } from 'src/popup/hive/utils/delegation.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface DelegationForm {
  username: string;
  amount: number;
  currency: string;
}

const rules = FormUtils.createRules<DelegationForm>({
  username: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$maxAmount')),
});

const Delegations = ({
  currencyLabels,
  activeAccount,
  delegations,
  globalProperties,
  formParams,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegators,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  loadPendingOutgoingUndelegations,
}: PropsFromRedux) => {
  const [available, setAvailable] = useState<number>();
  const { control, handleSubmit, setValue, watch } = useForm<DelegationForm>({
    defaultValues: {
      username: formParams.username ? formParams.username : activeAccount.name,
      amount: formParams.amount ? formParams.amount : '',
      currency: currencyLabels.hp,
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<DelegationForm>>(rules, {
        context: { maxAmount: available },
        errors: { render: true },
      });
      return resolver(values, { maxAmount: available }, options);
    },
  });

  const [totalIncoming, setTotalIncoming] = useState<string | number>('...');
  const [totalOutgoing, setTotalOutgoing] = useState<string | number>('...');
  const [
    totalPendingOutgoingUndelegation,
    setTotalPendingOutgoingUndelegation,
  ] = useState<string | number>('...');

  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  const [incomingError, setIncomingError] = useState<string | null>(null);

  const loadAutocompleteTransferUsernames = async () => {
    const favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    setAutocompleteTransferUsernames(
      favoriteUsers ? favoriteUsers[activeAccount.name!] : [],
    );
  };

  useEffect(() => {
    loadDelegators(activeAccount.name!);
    loadDelegatees(activeAccount.name!);
    loadPendingOutgoingUndelegations(activeAccount.name!);
    setAvailable(0);
    loadAutocompleteTransferUsernames();
    setTitleContainerProperties({
      title: 'popup_html_delegations',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (delegations.pendingOutgoingUndelegation) {
      const totalPendingOutgoingUndelegationVests =
        delegations.pendingOutgoingUndelegation.reduce(
          (prev: any, cur: any) => {
            return prev + cur.vesting_shares;
          },
          0,
        );
      setTotalPendingOutgoingUndelegation(
        FormatUtils.toHP(
          totalPendingOutgoingUndelegationVests,
          globalProperties,
        ),
      );
    }
    if (delegations.incoming) {
      const totalIncomingVests = delegations.incoming.reduce(
        (prev: any, cur: any) => {
          return (
            prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
          );
        },
        0,
      );
      setTotalIncoming(
        FormatUtils.toHP(totalIncomingVests.toString(), globalProperties),
      );
    } else {
      setIncomingError('popup_html_error_retrieving_incoming_delegations');
    }
    if (delegations.outgoing) {
      let totalOutgoingVests = delegations.outgoing.reduce(
        (prev: any, cur: any) => {
          return (
            prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
          );
        },
        0,
      );

      totalOutgoingVests += delegations.pendingOutgoingUndelegation.reduce(
        (prev: any, cur: any) => {
          return prev + cur.vesting_shares;
        },
        0,
      );

      setTotalOutgoing(
        FormatUtils.toHP(totalOutgoingVests.toString(), globalProperties),
      );
    }

    const totalHp = FormatUtils.toHP(
      activeAccount.account.vesting_shares as string,
      globalProperties,
    );

    setAvailable(Math.max(totalHp - Number(totalOutgoing) - 5, 0));
  }, [delegations]);

  const setToMax = () => {
    setValue('amount', available!);
  };

  const goToIncomings = () => {
    if (!incomingError)
      navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
        delegationType: DelegationType.INCOMING,
      });
  };
  const goToOutgoing = () => {
    navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.OUTGOING,
      totalPendingOutgoingUndelegation: totalPendingOutgoingUndelegation,
      available: available,
    });
  };

  const handleButtonClick = (form: DelegationForm) => {
    if (
      parseFloat(form.amount.toString()) > parseFloat(available!.toString())
    ) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (Number(form.amount) <= 0) {
      cancelDelegation(form);
    }

    const valueS = `${parseFloat(form.amount.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
        valueS,
        `@${form.username}`,
      ]),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${form.username}` },
        { label: 'popup_html_value', value: valueS },
      ],
      title: 'popup_html_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_operation');
        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            form.username,
            FormatUtils.fromHP(
              form.amount.toString(),
              globalProperties!,
            ).toFixed(6) + ' VESTS',
            activeAccount.keys.active!,
          );
          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.username,
              activeAccount,
            );
            setSuccessMessage('popup_html_delegation_successful');
          } else {
            setErrorMessage('popup_html_delegation_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_delegation_operation');
        }
      },
    });
  };

  const cancelDelegation = (form: DelegationForm) => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${form.username}` },
      ],
      title: 'popup_html_cancel_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegation_operation');

        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            form.username,
            '0.000000 VESTS',
            activeAccount.keys.active!,
          );
          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.username,
              activeAccount,
            );
            setSuccessMessage('popup_html_cancel_delegation_successful');
          } else {
            setErrorMessage('popup_html_cancel_delegation_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_cancel_delegation_operation');
        }
      },
    });
  };

  const getFormParams = () => {
    return control;
  };

  return (
    <div
      className="delegations-page"
      data-testid={`${Screen.DELEGATION_PAGE}-page`}>
      <div className="resources">
        <ResourceItemComponent
          icon={NewIcons.RESOURCE_ITEM_DELEGATION_INCOMING}
          label="popup_html_total_incoming"
          value={`+${FormatUtils.withCommas(totalIncoming.toString())}
              ${currencyLabels.hp}`}
          onClick={goToIncomings}
          additionalClass="blue"
        />
        <ResourceItemComponent
          icon={NewIcons.RESOURCE_ITEM_DELEGATION_OUTGOING}
          label="popup_html_total_outgoing"
          value={`-${FormatUtils.withCommas(totalOutgoing.toString())}
              ${currencyLabels.hp}`}
          onClick={goToOutgoing}
          additionalClass="red"
        />
      </div>

      <div className="available-panel">
        <div className="label">
          {chrome.i18n.getMessage('popup_html_available')}
        </div>
        <div className="value">
          {FormatUtils.formatCurrencyValue(available!)} {currencyLabels.hp}
        </div>
      </div>

      <FormContainer onSubmit={handleSubmit(handleButtonClick)}>
        <div className="text">
          {chrome.i18n.getMessage('popup_html_delegations_text')}
        </div>
        <Separator type="horizontal" />
        <div className="form-fields">
          <FormInputComponent
            name="username"
            control={control}
            dataTestId="input-username"
            type={InputType.TEXT}
            logo={NewIcons.INPUT_AT}
            placeholder="popup_html_username"
            label="popup_html_username"
            autocompleteValues={autocompleteTransferUsernames}
          />

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
              name="amount"
              control={control}
              dataTestId="amount-input"
              type={InputType.NUMBER}
              label="popup_html_transfer_amount"
              placeholder="0.000"
              skipPlaceholderTranslation={true}
              rightActionIcon={NewIcons.INPUT_MAX}
              rightActionClicked={setToMax}
            />
          </div>
        </div>
        <OperationButtonComponent
          dataTestId="delegate-operation-submit-button"
          label={
            watch('amount') && Number(watch('amount')) === 0
              ? 'popup_html_cancel_delegation'
              : 'popup_html_delegate_to_user'
          }
          onClick={handleSubmit(handleButtonClick)}
          requiredKey={KeychainKeyTypesLC.active}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    delegations: state.delegations,
    globalProperties: state.globalProperties.globals,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegators,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  loadPendingOutgoingUndelegations,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const DelegationsComponent = connector(Delegations);

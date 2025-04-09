import { joiResolver } from '@hookform/resolvers/joi';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import {
  RCDelegationValue,
  RcDelegation,
} from '@interfaces/rc-delegation.interface';
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
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import { RcDelegationsUtils } from 'src/popup/hive/utils/rc-delegations.utils';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface DelegationForm {
  delegator: string;
  delegatee: string;
  gigaRcValue: string;
  hpValue: string;
  currency: string;
}

export interface IncomingOutgoingRCDelegationParams {
  delegationType: DelegationType;
  delegations: RcDelegation[];
}

const rules = FormUtils.createRules<DelegationForm>({
  delegatee: Joi.string().required(),
  delegator: Joi.string().required(),
  gigaRcValue: Joi.number().required().min(0).max(Joi.ref('$maxAmount')),
});

const RCDelegations = ({
  activeAccount,
  currencyLabels,
  properties,
  formParams,
  setTitleContainerProperties,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  navigateToWithParams,
  navigateTo,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } = useForm<DelegationForm>({
    defaultValues: {
      delegatee: formParams?.delegatee ? formParams.delegatee : '',
      delegator: activeAccount.name,
      gigaRcValue: formParams
        ? RcDelegationsUtils.rcToGigaRc(Number(formParams?.value))
        : '',
      hpValue: formParams
        ? RcDelegationsUtils.rcToHp(formParams?.value, properties)
        : '',
      currency: 'G RC',
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<DelegationForm>>(rules, {
        context: { maxAmount: parseFloat(available?.gigaRcValue!) },
        errors: { render: true },
      });
      return resolver(
        values,
        { maxAmount: parseFloat(available?.gigaRcValue!) },
        options,
      );
    },
  });

  const [available, setAvailable] = useState<RCDelegationValue>();

  const [totalIncoming, setTotalIncoming] = useState<RCDelegationValue>();
  const [totalOutgoing, setTotalOutgoing] = useState<RCDelegationValue>();
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  const [outgoingDelegations, setOutgoingDelegations] = useState<
    RcDelegation[]
  >([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_delegate_rc',
      isBackButtonEnabled: true,
    });
    initRCDelegations();
    loadAutocompleteTransferUsernames();
  }, []);

  const initRCDelegations = async () => {
    setTotalIncoming({
      hpValue: RcDelegationsUtils.rcToHp(
        activeAccount.rc.received_delegated_rc.toString(),
        properties,
      ),
      gigaRcValue: RcDelegationsUtils.rcToGigaRc(
        activeAccount.rc.received_delegated_rc,
      ),
    });
    setTotalOutgoing({
      hpValue: RcDelegationsUtils.rcToHp(
        activeAccount.rc.delegated_rc.toString(),
        properties,
      ),
      gigaRcValue: RcDelegationsUtils.rcToGigaRc(activeAccount.rc.delegated_rc),
    });

    const availableRc =
      (activeAccount.rc.max_rc * activeAccount.rc.percentage) / 100;

    setAvailable({
      hpValue: RcDelegationsUtils.rcToHp(availableRc.toString(), properties),
      gigaRcValue: RcDelegationsUtils.rcToGigaRc(availableRc),
    });

    const outgoingDelegations =
      await RcDelegationsUtils.getAllOutgoingDelegations(activeAccount.name!);

    setOutgoingDelegations(outgoingDelegations);
  };

  const handleValueChange = (value: string) => {
    setValue('gigaRcValue', value);
    setValue('hpValue', RcDelegationsUtils.gigaRcToHp(value, properties));
  };

  const getFormParams = () => {
    return watch();
  };

  const goToOutgoings = () => {
    navigateToWithParams(Screen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.OUTGOING,
      delegations: outgoingDelegations,
    });
  };

  const handleButtonClick = async (form: DelegationForm) => {
    const isCancel = Number(form.gigaRcValue) === 0;

    const fields = [
      { label: 'popup_html_rc_delegation_to', value: `@${form.delegatee}` },
      {
        label: 'popup_html_rc_delegation_value',
        value: `${RcDelegationsUtils.formatRcWithUnit(
          form.gigaRcValue,
          true,
        )} (≈ ${form.hpValue} ${currencyLabels.hp})`,
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.posting,
      message: chrome.i18n.getMessage(
        isCancel
          ? 'popup_html_cancel_rc_delegation_confirm_text'
          : 'popup_html_rc_delegation_confirm_text',
      ),
      fields: fields,
      title: isCancel
        ? 'popup_html_cancel_rc_delegation_title'
        : 'popup_html_rc_delegation_title',
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList(
          isCancel
            ? 'html_popup_cancel_delegate_rc_operation'
            : 'html_popup_delegate_rc_operation',
        );
        try {
          let success;

          success = await RcDelegationsUtils.sendDelegation(
            RcDelegationsUtils.gigaRcToRc(parseFloat(form.gigaRcValue)),
            form.delegatee,
            activeAccount.name!,
            activeAccount.keys.posting!,
            options,
          );

          removeFromLoadingList(
            isCancel
              ? 'html_popup_cancel_delegate_rc_operation'
              : 'html_popup_delegate_rc_operation',
          );

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(
              form.delegatee,
              activeAccount,
            );
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else if (!isCancel) {
              setSuccessMessage('popup_html_rc_delegation_successful', [
                `@${form.delegatee}`,
              ]);
            } else {
              setSuccessMessage('popup_html_cancel_rc_delegation_successful', [
                `@${form.delegatee}`,
              ]);
            }
          } else {
            setErrorMessage('popup_html_rc_delegation_failed');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList(
            isCancel
              ? 'html_popup_cancel_delegate_rc_operation'
              : 'html_popup_delegate_rc_operation',
          );
        }
      },
    } as ConfirmationPageParams);
  };

  const loadAutocompleteTransferUsernames = async () => {
    const favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    setAutocompleteTransferUsernames(
      favoriteUsers ? favoriteUsers[activeAccount.name!] : [],
    );
  };

  const setToPresetValue = (value: number) => {
    setValue(
      'gigaRcValue',
      RcDelegationsUtils.hpToGigaRc(value.toString(), properties),
    );
    setValue('hpValue', value.toFixed(3));
  };

  return (
    <div
      className="rc-delegations-page"
      data-testid={`${Screen.RC_DELEGATIONS_PAGE}-page`}>
      {totalIncoming?.gigaRcValue && totalOutgoing?.gigaRcValue && (
        <div className="resources">
          <ResourceItemComponent
            icon={SVGIcons.RESOURCE_ITEM_DELEGATION_INCOMING}
            label="popup_html_total_incoming"
            value={`+${RcDelegationsUtils.formatRcWithUnit(
              totalIncoming.gigaRcValue,
              true,
            )}`}
            additionalClass="blue"
            tooltipText={`≈ ${FormatUtils.withCommas(
              totalIncoming.hpValue.toString(),
            )} ${currencyLabels.hp}`}
          />
          <ResourceItemComponent
            icon={SVGIcons.RESOURCE_ITEM_DELEGATION_OUTGOING}
            label="popup_html_total_outgoing"
            value={`-${RcDelegationsUtils.formatRcWithUnit(
              totalOutgoing.gigaRcValue,
              true,
            )}`}
            additionalClass="red"
            tooltipText={`≈ ${FormatUtils.withCommas(
              totalOutgoing.hpValue.toString(),
            )} ${currencyLabels.hp}`}
            onClick={goToOutgoings}
          />
        </div>
      )}

      {available?.gigaRcValue && (
        <div className="available-panel">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_available')}
          </div>
          <div className="value">
            {FormatUtils.formatCurrencyValue(available?.gigaRcValue)} G RC
          </div>
        </div>
      )}

      <FormContainer onSubmit={handleSubmit(handleButtonClick)}>
        <div className="text">
          {chrome.i18n.getMessage('popup_html_rc_delegations_text')}
        </div>
        <Separator type="horizontal" />
        <div className="form-fields">
          <FormInputComponent
            dataTestId="input-username"
            control={control}
            name="delegatee"
            logo={SVGIcons.INPUT_AT}
            label="popup_html_username"
            placeholder="popup_html_username"
            type={InputType.TEXT}
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
              dataTestId="amount-input"
              type={InputType.NUMBER}
              label="popup_html_transfer_amount"
              placeholder="0.000"
              skipPlaceholderTranslation={true}
              hint={
                watch('hpValue')
                  ? `≈ ${watch('hpValue')} ${currencyLabels.hp}`
                  : ''
              }
              skipHintTranslation
              name="gigaRcValue"
              control={control}
              step={Number(RcDelegationsUtils.hpToGigaRc('5', properties))}
              customOnChange={handleValueChange}
            />
          </div>

          <div className="preset-button-panels">
            <div className="preset-button" onClick={() => setToPresetValue(5)}>
              5 {currencyLabels.hp}
            </div>
            <div className="preset-button" onClick={() => setToPresetValue(10)}>
              10 {currencyLabels.hp}
            </div>
            <div className="preset-button" onClick={() => setToPresetValue(50)}>
              50 {currencyLabels.hp}
            </div>
            <div
              className="preset-button"
              onClick={() => setToPresetValue(100)}>
              100 {currencyLabels.hp}
            </div>
          </div>
        </div>
        <OperationButtonComponent
          dataTestId="rc-delegate-operation-submit-button"
          label={'popup_html_delegate_to_user'}
          onClick={handleSubmit(handleButtonClick)}
          requiredKey={KeychainKeyTypesLC.posting}
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
    properties: state.hive.globalProperties,
    formParams:
      state.navigation.stack[0].params?.formParams ||
      (state.navigation.stack[0].previousParams?.formParams as RcDelegation),
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  navigateToWithParams,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const RcDelegationsComponent = connector(RCDelegations);

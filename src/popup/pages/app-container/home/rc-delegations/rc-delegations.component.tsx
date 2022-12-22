import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  RcDelegation,
  RCDelegationValue,
} from '@interfaces/rc-delegation.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { RcDelegationsUtils } from 'src/utils/rc-delegations.utils';
import TransferUtils from 'src/utils/transfer.utils';

import './rc-delegations.component.scss';

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
  const [username, setUsername] = useState(
    formParams ? formParams?.delegatee : '',
  );
  const [value, setValue] = useState<RCDelegationValue>({
    hpValue: formParams
      ? RcDelegationsUtils.rcToHp(formParams?.value, properties)
      : '0.000',
    gigaRcValue: formParams
      ? RcDelegationsUtils.rcToGigaRc(Number(formParams?.value))
      : '',
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
    setValue({
      hpValue: RcDelegationsUtils.gigaRcToHp(value, properties),
      gigaRcValue: value,
    });
  };

  const getFormParams = () => {
    return {
      delegator: activeAccount.name!,
      delegatee: username,
      value: RcDelegationsUtils.gigaRcToRc(
        Number(value.gigaRcValue),
      ).toString(),
    } as RcDelegation;
  };

  const goToOutgoings = () => {
    navigateToWithParams(Screen.RC_DELEGATIONS_INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.OUTGOING,
      delegations: outgoingDelegations,
    });
  };

  const handleButtonClick = async () => {
    if (username.trim().length === 0) {
      setErrorMessage('popup_html_username_missing');
      return;
    }

    const isCancel = Number(value.gigaRcValue) === 0;

    const fields = [
      { label: 'popup_html_rc_delegation_to', value: `@${username}` },
      {
        label: 'popup_html_rc_delegation_value',
        value: `${RcDelegationsUtils.formatRcWithUnit(
          value.gigaRcValue,
          true,
        )} (≈ ${value.hpValue} ${currencyLabels.hp})`,
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
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
      afterConfirmAction: async () => {
        addToLoadingList(
          isCancel
            ? 'html_popup_cancel_delegate_rc_operation'
            : 'html_popup_delegate_rc_operation',
        );
        try {
          let success = false;

          success = await RcDelegationsUtils.sendDelegation(
            RcDelegationsUtils.gigaRcToRc(parseFloat(value.gigaRcValue)),
            username,
            activeAccount.name!,
            activeAccount.keys.posting!,
          );

          removeFromLoadingList(
            isCancel
              ? 'html_popup_cancel_delegate_rc_operation'
              : 'html_popup_delegate_rc_operation',
          );

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);
            await TransferUtils.saveFavoriteUser(username, activeAccount);

            if (!isCancel) {
              setSuccessMessage('popup_html_rc_delegation_successful', [
                `@${username}`,
              ]);
            } else {
              setSuccessMessage('popup_html_cancel_rc_delegation_successful', [
                `@${username}`,
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
    });
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
    setValue({
      hpValue: value.toFixed(3),
      gigaRcValue: RcDelegationsUtils.hpToGigaRc(value.toString(), properties),
    });
  };

  return (
    <div className="rc-delegations-page" aria-label="rc-delegations-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_rc_delegations_text')}
      </div>

      <div className="rc-delegations-summary" aria-label="delegations-summary">
        <div className="total-incoming" aria-label="total-incoming">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_incoming')}
          </div>
          <div className="value">
            {totalIncoming && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  totalIncoming.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  +{' '}
                  {FormatUtils.withCommas(totalIncoming.gigaRcValue.toString())}{' '}
                  G RC
                </span>
              </CustomTooltip>
            )}
            {!totalIncoming && <span>...</span>}
          </div>
        </div>
        <div
          className="total-outgoing"
          onClick={goToOutgoings}
          aria-label="total-outgoing">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_outgoing')}
          </div>
          <div className="value">
            {totalOutgoing && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  totalOutgoing.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  -{' '}
                  {FormatUtils.withCommas(totalOutgoing.gigaRcValue.toString())}{' '}
                  G RC
                </span>
              </CustomTooltip>
            )}
            {!totalOutgoing && <span>...</span>}
          </div>
        </div>
        <div className="total-available">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_available')}
          </div>
          <div className="value">
            {available && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  available.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  {FormatUtils.withCommas(available?.gigaRcValue.toString())} G
                  RC
                </span>
              </CustomTooltip>
            )}
            {!available && <span>...</span>}
          </div>
        </div>
      </div>

      <div className="form-container">
        <InputComponent
          ariaLabel="input-username"
          value={username}
          onChange={setUsername}
          logo={Icons.AT}
          placeholder="popup_html_username"
          type={InputType.TEXT}
          autocompleteValues={autocompleteTransferUsernames}
        />

        <div className="amount-panel">
          <div className="amount-input-panel">
            <InputComponent
              ariaLabel="amount-input"
              type={InputType.NUMBER}
              placeholder="0.000"
              skipPlaceholderTranslation={true}
              hint={`≈ ${value?.hpValue} ${currencyLabels.hp}`}
              skipHintTranslation
              value={value?.gigaRcValue}
              step={Number(RcDelegationsUtils.hpToGigaRc('5', properties))}
              onChange={handleValueChange}
            />
          </div>
          <div className="currency">G RC</div>
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
          <div className="preset-button" onClick={() => setToPresetValue(100)}>
            100 {currencyLabels.hp}
          </div>
        </div>
      </div>

      <OperationButtonComponent
        ariaLabel="rc-delegate-operation-submit-button"
        label={'popup_html_delegate_to_user'}
        onClick={() => handleButtonClick()}
        requiredKey={KeychainKeyTypesLC.posting}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    properties: state.globalProperties,
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

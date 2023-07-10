import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { DelegationUtils } from '@hiveapp/utils/delegation.utils';
import { FavoriteUserUtils } from '@hiveapp/utils/favorite-user.utils';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
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
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './delegations.component.scss';

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
  const [username, setUsername] = useState<string>(
    formParams.username ? formParams.username : '',
  );
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : '',
  );
  const [available, setAvailable] = useState<string | number>('...');

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
    setValue(Number(available).toFixed(3));
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

  const handleButtonClick = () => {
    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (Number(value) <= 0) {
      cancelDelegation();
    }

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
        valueS,
        `@${username}`,
      ]),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: valueS },
      ],
      title: 'popup_html_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_operation');
        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            username,
            FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
              ' VESTS',
            activeAccount.keys.active!,
          );
          if (success && success.confirmed) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(username, activeAccount);
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

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${username}` },
      ],
      title: 'popup_html_cancel_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegation_operation');

        try {
          let success = await DelegationUtils.delegateVestingShares(
            activeAccount.name!,
            username,
            '0.000000 VESTS',
            activeAccount.keys.active!,
          );
          if (success && success.confirmed) {
            navigateTo(Screen.HOME_PAGE, true);
            await FavoriteUserUtils.saveFavoriteUser(username, activeAccount);
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
    return {
      value: value,
      username: username,
    };
  };

  return (
    <div
      className="delegations-page"
      data-testid={`${Screen.DELEGATION_PAGE}-page`}>
      <div className="text">
        {chrome.i18n.getMessage('popup_html_delegations_text')}
      </div>

      <div className="delegations-summary" data-testid="delegations-summary">
        <div
          className="total-incoming"
          onClick={goToIncomings}
          data-testid="total-incoming">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_incoming')}
          </div>
          <div
            className="value"
            onClick={() => {
              if (incomingError) setErrorMessage(incomingError);
            }}>
            {incomingError && (
              <Icon name={Icons.ERROR} tooltipMessage={incomingError}></Icon>
            )}
            <span data-testid="delegations-span-total-incoming">
              + {FormatUtils.withCommas(totalIncoming.toString())}{' '}
              {currencyLabels.hp}
            </span>
          </div>
        </div>
        <div
          className="total-outgoing"
          onClick={goToOutgoing}
          data-testid="total-outgoing">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_outgoing')}
          </div>
          <div data-testid="total-outgoing-value" className="value">
            - {FormatUtils.withCommas(totalOutgoing.toString())}{' '}
            {currencyLabels.hp}
          </div>
        </div>
        <div className="divider"></div>
        <div className="total-available">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_available')}
          </div>
          <div className="value">
            {FormatUtils.withCommas(available.toString())} {currencyLabels.hp}
          </div>
        </div>
      </div>

      <div className="form-container">
        <InputComponent
          dataTestId="input-username"
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
              dataTestId="amount-input"
              type={InputType.NUMBER}
              placeholder="0.000"
              skipPlaceholderTranslation={true}
              value={value}
              onChange={setValue}
              onSetToMaxClicked={setToMax}
            />
          </div>
          <div className="currency">{currencyLabels.hp}</div>
        </div>
      </div>

      <OperationButtonComponent
        dataTestId="delegate-operation-submit-button"
        label={
          value.toString().length > 0 && Number(value) === 0
            ? 'popup_html_cancel_delegation'
            : 'popup_html_delegate_to_user'
        }
        onClick={() => handleButtonClick()}
        requiredKey={KeychainKeyTypesLC.active}
        fixToBottom
      />
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

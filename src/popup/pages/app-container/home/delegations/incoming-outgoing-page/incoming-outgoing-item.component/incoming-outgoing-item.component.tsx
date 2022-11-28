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
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import moment from 'moment';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import { DelegationUtils } from 'src/utils/delegation.utils';
import FormatUtils from 'src/utils/format.utils';
import './incoming-outgoing-item.component.scss';

interface IncomingOutgoingProps {
  delegationType: DelegationType;
  username?: string;
  amount: string;
  expirationDate?: string;
  maxAvailable?: string;
}

const IncomingOutgoing = ({
  activeAccount,
  delegationType,
  username,
  amount,
  globalProperties,
  currencyLabels,
  expirationDate,
  maxAvailable,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsType) => {
  const [editModeActivated, setEditModeActivated] = useState(false);
  const [value, setValue] = useState('');
  const [amountHP, setAmountHP] = useState(
    FormatUtils.toHP(
      amount.toString().replace(' VESTS', ''),
      globalProperties,
    ).toFixed(3),
  );

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      title: 'popup_html_cancel_delegation',
      fields: [{ label: 'popup_html_transfer_to', value: `@${username}` }],
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegation_operation');
        let success = await DelegationUtils.delegateVestingShares(
          activeAccount,
          username!,
          '0.000000 VESTS',
        );
        removeFromLoadingList('html_popup_cancel_delegation_operation');

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_cancel_delegation_successful');
        } else {
          setErrorMessage('popup_html_cancel_delegation_fail');
        }
      },
    });
  };

  const enterEditMode = () => {
    setEditModeActivated(true);
    setValue(amountHP);
  };

  const cancelEdit = () => {
    setEditModeActivated(false);
    setValue(amountHP);
  };

  const saveChanges = () => {
    setEditModeActivated(false);
    setAmountHP(value);

    if (Number(value) <= 0) {
      cancelDelegation();
    }

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
        value,
        `@${username}`,
      ]),
      title: 'popup_html_delegation',
      fields: [
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: valueS },
      ],
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_operation');
        let success = await DelegationUtils.delegateVestingShares(
          activeAccount,
          username!,
          FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
            ' VESTS',
        );
        removeFromLoadingList('html_popup_delegation_operation');

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_delegation_successful');
        } else {
          setErrorMessage('popup_html_delegation_fail');
        }
      },
    });
  };

  const setToMax = () => {
    if (maxAvailable) {
      setValue((parseFloat(amountHP) + parseFloat(maxAvailable)).toFixed(3));
    }
  };

  return (
    <div className="delegation-row" key={username}>
      {username && (
        <>
          <div className="left-panel">{`@${username}`}</div>
          <div className="right-panel">
            {!editModeActivated && (
              <div
                className="value"
                onDoubleClick={() => {
                  if (delegationType === DelegationType.OUTGOING)
                    enterEditMode();
                }}>
                {FormatUtils.withCommas(amountHP)} {currencyLabels.hp}
              </div>
            )}
            {editModeActivated && (
              <InputComponent
                min={0}
                value={value}
                type={InputType.NUMBER}
                onChange={setValue}
                placeholder=""
                onSetToMaxClicked={() => setToMax()}></InputComponent>
            )}
            {delegationType === DelegationType.OUTGOING &&
              !editModeActivated && (
                <img
                  className="icon edit-delegation"
                  src="/assets/images/edit.png"
                  onClick={enterEditMode}
                />
              )}
            {delegationType === DelegationType.OUTGOING &&
              !editModeActivated && (
                <img
                  className="icon erase-delegation"
                  src="/assets/images/clear.png"
                  onClick={cancelDelegation}
                />
              )}
            {delegationType === DelegationType.OUTGOING &&
              editModeActivated && (
                <img
                  className={'icon always-displayed submit'}
                  src="/assets/images/submit.png"
                  onClick={saveChanges}
                />
              )}
            {delegationType === DelegationType.OUTGOING &&
              editModeActivated && (
                <img
                  className="icon always-displayed cancel"
                  src="/assets/images/delete.png"
                  onClick={cancelEdit}
                />
              )}
          </div>
        </>
      )}
      {expirationDate && (
        <div className="pending-undelegation">
          <div className="expiration-date">
            {moment(expirationDate).format('L')}
          </div>
          <div className="amount">
            {amountHP} {currencyLabels.hp}
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    globalProperties: state.globalProperties.globals,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsType = ConnectedProps<typeof connector> & IncomingOutgoingProps;

export const IncomingOutgoingItemComponent = connector(IncomingOutgoing);

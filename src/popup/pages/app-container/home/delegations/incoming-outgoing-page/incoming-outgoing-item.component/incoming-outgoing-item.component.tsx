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
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './incoming-outgoing-item.component.scss';

interface IncomingOutgoingProps {
  delegationType: DelegationType;
  username: string;
  amount: string;
}

const IncomingOutgoing = ({
  activeAccount,
  delegationType,
  username,
  amount,
  globalProperties,
  currencyLabels,
  navigateToWithParams,
  navigateTo,
  setErrorMessage,
  setSuccessMessage,
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
      fields: [{ label: 'popup_html_transfer_to', value: `@${username}` }],
      afterConfirmAction: async () => {
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          '0.000000 VESTS',
        );

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_power_up_down_success', [
            'popup_html_cancel_delegation',
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [
            'popup_html_cancel_delegation',
          ]);
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

    const operationString = chrome.i18n
      .getMessage('popup_html_delegations')
      .toLowerCase();
    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString],
      ),
      fields: [
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: valueS },
      ],
      afterConfirmAction: async () => {
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
            ' VESTS',
        );

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage('popup_html_power_up_down_success', [
            operationString,
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [operationString]);
        }
      },
    });
  };

  return (
    <div className="delegation-row" key={username}>
      <div className="to-from">{username}</div>
      <div className="right-panel">
        {!editModeActivated && (
          <div
            className="value"
            onDoubleClick={() => {
              if (delegationType === DelegationType.OUTGOING) enterEditMode();
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
            placeholder=""></InputComponent>
        )}
        {delegationType === DelegationType.OUTGOING && !editModeActivated && (
          <img
            className="icon edit-delegation"
            src="/assets/images/edit.png"
            onClick={enterEditMode}
          />
        )}
        {delegationType === DelegationType.OUTGOING && !editModeActivated && (
          <img
            className="icon erase-delegation"
            src="/assets/images/clear.png"
            onClick={cancelDelegation}
          />
        )}
        {delegationType === DelegationType.OUTGOING && editModeActivated && (
          <img
            className={'icon always-displayed submit'}
            src="/assets/images/submit.png"
            onClick={saveChanges}
          />
        )}
        {delegationType === DelegationType.OUTGOING && editModeActivated && (
          <img
            className="icon always-displayed cancel"
            src="/assets/images/delete.png"
            onClick={cancelEdit}
          />
        )}
      </div>
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
});
type PropsType = ConnectedProps<typeof connector> & IncomingOutgoingProps;

export const IncomingOutgoingItemComponent = connector(IncomingOutgoing);

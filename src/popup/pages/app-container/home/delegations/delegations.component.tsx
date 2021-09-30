import {
  loadDelegatees,
  loadDelegators,
} from '@popup/actions/delegations.actions';
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
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Conversion as Delegations } from 'src/interfaces/conversion.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransferUtils from 'src/utils/transfer.utils';
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
}: PropsFromRedux) => {
  const [username, setUsername] = useState<string>(
    formParams.username ? formParams.username : '',
  );
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [available, setAvailable] = useState<string | number>('...');

  const [totalIncoming, setTotalIncoming] = useState<string | number>('...');
  const [totalOutgoing, setTotalOutgoing] = useState<string | number>('...');

  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  const loadAutocompleteTransferUsernames = async () => {
    const transferTo = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.TRANSFER_TO_USERNAMES,
    );
    setAutocompleteTransferUsernames(
      transferTo ? transferTo[activeAccount.name!] : [],
    );
  };

  useEffect(() => {
    loadDelegators(activeAccount.name!);
    loadDelegatees(activeAccount.name!);
    setAvailable(0);
    loadAutocompleteTransferUsernames();
  }, []);

  useEffect(() => {
    const totalIncomingVests = delegations.incoming.reduce((prev, cur) => {
      return prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''));
    }, 0);
    const totalOutgoingVests = delegations.outgoing.reduce((prev, cur) => {
      return prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''));
    }, 0);

    setTotalIncoming(
      FormatUtils.toHP(totalIncomingVests.toString(), globalProperties),
    );
    setTotalOutgoing(
      FormatUtils.toHP(totalOutgoingVests.toString(), globalProperties),
    );

    const totalHp = FormatUtils.toHP(
      activeAccount.account.vesting_shares as string,
      globalProperties,
    );

    setAvailable(totalHp - Number(totalOutgoing) - 5);
  }, [delegations]);

  const setToMax = () => {
    setValue(Number(available).toFixed(3));
  };

  const goToIncomings = () => {
    navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.INCOMING,
    });
  };
  const goToOutgoing = () => {
    navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.OUTGOING,
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
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
            ' VESTS',
        );

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(username, activeAccount);
          setSuccessMessage('popup_html_power_up_down_success', [
            operationString,
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [operationString]);
        }
      },
    });
  };

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      fields: [{ label: 'popup_html_transfer_to', value: `@${username}` }],
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          '0.000000 VESTS',
        );

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(username, activeAccount);
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

  const getFormParams = () => {
    return {
      value: value,
      username: username,
    };
  };

  return (
    <div className="delegations-page">
      <PageTitleComponent
        title={'popup_html_delegations'}
        isBackButtonEnabled={true}
      />
      <div className="text">
        {chrome.i18n.getMessage('popup_html_delegations_text')}
      </div>

      <div className="delegations-summary">
        <div className="total-incoming" onClick={goToIncomings}>
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_incoming')}
          </div>
          <div className="value">
            + {FormatUtils.withCommas(totalIncoming.toString())}{' '}
            {currencyLabels.hp}
          </div>
        </div>
        <div className="total-outgoing" onClick={goToOutgoing}>
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_outgoing')}
          </div>
          <div className="value">
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

      <InputComponent
        value={username}
        onChange={setUsername}
        logo="arobase"
        placeholder="popup_html_username"
        type={InputType.TEXT}
        autocompleteValues={autocompleteTransferUsernames}
      />

      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipTranslation={true}
            value={value}
            onChange={setValue}
          />
          <a className="max" onClick={() => setToMax()}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </a>
        </div>
        <div className="currency">{currencyLabels.hp}</div>
      </div>

      <ButtonComponent
        label={'popup_html_delegate_to_user'}
        onClick={() => handleButtonClick()}
      />

      <ReactTooltip
        id="tooltip"
        place="top"
        type="light"
        effect="solid"
        multiline={true}
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const DelegationsComponent = connector(Delegations);

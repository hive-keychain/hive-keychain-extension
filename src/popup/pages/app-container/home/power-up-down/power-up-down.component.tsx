import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { loadDelegatees } from '@popup/actions/delegations.actions';
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
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransferUtils from 'src/utils/transfer.utils';
import './power-up-down.component.scss';

const PowerUpDown = ({
  currencyLabels,
  activeAccount,
  powerType,
  globalProperties,
  formParams,
  delegations,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [receiver, setReceiver] = useState(
    formParams.receiver ? formParams.receiver : activeAccount.name!,
  );
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : '',
  );
  const [current, setCurrent] = useState<string | number>('...');
  const [available, setAvailable] = useState<string | number>('...');
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  const loadAutocompleteTransferUsernames = async () => {
    const transferTo = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    setAutocompleteTransferUsernames(
      transferTo ? transferTo[activeAccount.name!] : [],
    );
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

  const currency =
    powerType === PowerType.POWER_UP ? currencyLabels.hive : currencyLabels.hp;

  useEffect(() => {
    const hiveBalance = FormatUtils.toNumber(activeAccount.account.balance);

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

    setAvailable(powerType === PowerType.POWER_UP ? hiveBalance : hpBalance);
    setCurrent(powerType === PowerType.POWER_UP ? hpBalance : hiveBalance);
  }, [activeAccount, delegations]);

  const title =
    powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd';
  const text =
    powerType === PowerType.POWER_UP
      ? 'popup_html_powerup_text'
      : 'popup_html_powerdown_text';

  const handleButtonClick = () => {
    if (value.toString().trim() === '') {
      setErrorMessage('popup_html_fill_form_error');
      return;
    }
    if (
      powerType === PowerType.POWER_DOWN &&
      Number(value).toFixed(3) === '0.000'
    ) {
      return handleCancelButtonClick();
    }

    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const operationString = chrome.i18n.getMessage(
      powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd',
    );
    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    const fields = [];

    if (powerType === PowerType.POWER_UP) {
      fields.push({
        label: 'popup_html_transfer_from',
        value: `@${activeAccount.name}`,
      });
      fields.push({ label: 'popup_html_transfer_to', value: `@${receiver}` });
    }

    fields.push({ label: 'popup_html_amount', value: valueS });

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
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
      afterConfirmAction: async () => {
        let success = false;
        switch (powerType) {
          case PowerType.POWER_UP:
            addToLoadingList('html_popup_power_up_operation');
            success = await HiveUtils.powerUp(
              activeAccount.name!,
              receiver,
              valueS,
            );
            removeFromLoadingList('html_popup_power_up_operation');
            break;
          case PowerType.POWER_DOWN:
            addToLoadingList('html_popup_power_down_operation');
            success = await HiveUtils.powerDown(
              activeAccount.name!,
              `${FormatUtils.fromHP(
                Number(value).toFixed(3),
                globalProperties.globals!,
              ).toFixed(6)} VESTS`,
            );
            removeFromLoadingList('html_popup_power_down_operation');
        }

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(receiver, activeAccount);
          setSuccessMessage('popup_html_power_up_down_success', [
            operationString,
          ]);
        } else {
          setErrorMessage('popup_html_power_up_down_fail', [operationString]);
        }
      },
    });
  };

  const setToMax = () => {
    setValue(available);
  };

  const getFormParams = () => {
    return {
      receiver: receiver,
      value: value,
    };
  };

  const handleCancelButtonClick = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_power_down_message',
      ),
      fields: [],
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_power_down_operation');
        let success = await HiveUtils.powerDown(
          receiver,
          `${FormatUtils.fromHP('0', globalProperties.globals!).toFixed(
            6,
          )} VESTS`,
        );

        removeFromLoadingList('html_popup_cancel_power_down_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(receiver, activeAccount);
          setSuccessMessage('popup_html_cancel_power_down_success');
        } else {
          setErrorMessage('popup_html_cancel_power_down_fail');
        }
      },
    });
  };

  return (
    <div className="power-up-page">
      <AvailableCurrentPanelComponent
        available={available}
        availableCurrency={
          powerType === PowerType.POWER_UP
            ? currencyLabels.hive
            : currencyLabels.hp
        }
        availableLabel={'popup_html_available'}
        current={current}
        currentCurrency={
          powerType === PowerType.POWER_UP
            ? currencyLabels.hp
            : currencyLabels.hive
        }
        currentLabel={'popup_html_current'}
      />
      <div className="text">{chrome.i18n.getMessage(text)}</div>

      {powerType === PowerType.POWER_DOWN &&
        powerDownInfo &&
        powerDownInfo[1] !== '0' && (
          <CustomTooltip
            message={chrome.i18n.getMessage('popup_next_powerdown', [
              powerDownInfo[2].split('T').join(', '),
            ])}
            skipTranslation>
            <div className="power-down-panel">
              <div className="power-down-text">
                {chrome.i18n.getMessage('popup_html_powering_down')}{' '}
                {powerDownInfo[0]} / {powerDownInfo[1]} {currencyLabels.hp}
              </div>
              <img
                className="icon-button"
                src="/assets/images/delete.png"
                onClick={handleCancelButtonClick}
              />
            </div>
          </CustomTooltip>
        )}

      {powerType === PowerType.POWER_UP && (
        <InputComponent
          type={InputType.TEXT}
          logo={Icons.AT}
          placeholder="popup_html_receiver"
          value={receiver}
          onChange={setReceiver}
          autocompleteValues={autocompleteTransferUsernames}
        />
      )}
      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipTranslation={true}
            value={value}
            onChange={setValue}
            onSetToMaxClicked={setToMax}
          />
        </div>
        <div className="currency">{currency}</div>
      </div>

      <OperationButtonComponent
        requiredKey={KeychainKeyTypesLC.active}
        label={title}
        onClick={() => handleButtonClick()}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    powerType: state.navigation.stack[0].params.powerType as PowerType,
    globalProperties: state.globalProperties,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    delegations: state.delegations,
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

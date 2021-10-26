import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down-top-panel/power-up-down-top-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
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
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(
    formParams.username ? formParams.username : activeAccount.name!,
  );
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [current, setCurrent] = useState<string | number>('...');
  const [available, setAvailable] = useState<string | number>('...');
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
    loadAutocompleteTransferUsernames();
  }, []);

  const powerDownInfo = AccountUtils.getPowerDown(
    activeAccount.account,
    globalProperties.globals!,
  );

  const currency =
    powerType === PowerType.POWER_UP ? currencyLabels.hive : currencyLabels.hp;

  useEffect(() => {
    const hiveBalance = FormatUtils.formatCurrencyValue(
      activeAccount.account.balance,
    );

    const hpBalance = FormatUtils.withCommas(
      (
        FormatUtils.toHP(
          activeAccount.account.vesting_shares.toString().replace('VESTS', ''),
          globalProperties.globals,
        ) - (powerType === PowerType.POWER_UP ? 0 : 5)
      ).toString(),
    );

    setAvailable(powerType === PowerType.POWER_UP ? hiveBalance : hpBalance);
    setCurrent(powerType === PowerType.POWER_UP ? hpBalance : hiveBalance);
  }, [activeAccount]);

  const title =
    powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd';
  const text =
    powerType === PowerType.POWER_UP
      ? 'popup_html_powerup_text'
      : 'popup_html_powerdown_text';

  const handleButtonClick = () => {
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
    const operationString = chrome.i18n
      .getMessage(
        powerType === PowerType.POWER_UP ? 'popup_html_pu' : 'popup_html_pd',
      )
      .toLowerCase();
    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString],
      ),
      fields: [{ label: 'popup_html_value', value: valueS }],
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        let success = false;
        switch (powerType) {
          case PowerType.POWER_UP:
            success = await HiveUtils.powerUp(username, valueS);
            break;
          case PowerType.POWER_DOWN:
            success = await HiveUtils.powerDown(
              username,
              `${FormatUtils.fromHP(
                Number(value).toFixed(3),
                globalProperties.globals!,
              ).toFixed(6)} VESTS`,
            );
            break;
        }

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

  const setToMax = () => {
    setValue(available);
  };

  const getFormParams = () => {
    return {
      username: username,
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
        let success = await HiveUtils.powerDown(
          username,
          `${FormatUtils.fromHP('0', globalProperties.globals!).toFixed(
            6,
          )} VESTS`,
        );

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(username, activeAccount);
          setSuccessMessage('popup_html_cancel_power_down_success');
        } else {
          setErrorMessage('popup_html_cancel_power_down_fail');
        }
      },
    });
  };

  return (
    <div className="power-up-page">
      <PageTitleComponent title={title} isBackButtonEnabled={true} />
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
          <div
            className="power-down-panel"
            data-for="tooltip"
            data-tip={chrome.i18n.getMessage('popup_next_powerdown', [
              powerDownInfo[2],
            ])}
            data-iscapture="true">
            <div className="power-down-text">
              {powerDownInfo[0]}/{powerDownInfo[1]} {currencyLabels.hp}
            </div>
            <img
              className="icon-button"
              src="/assets/images/delete.png"
              onClick={handleCancelButtonClick}
            />
          </div>
        )}

      {powerType === PowerType.POWER_UP && (
        <InputComponent
          type={InputType.TEXT}
          placeholder="popup_html_username"
          value={username}
          onChange={setUsername}
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
          />
          <a className="max" onClick={() => setToMax()}>
            {chrome.i18n.getMessage('popup_html_send_max')}
          </a>
        </div>
        <div className="currency">{currency}</div>
      </div>

      <ButtonComponent label={title} onClick={() => handleButtonClick()} />

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
    powerType: state.navigation.stack[0].params.powerType as PowerType,
    globalProperties: state.globalProperties,
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PowerUpDownComponent = connector(PowerUpDown);

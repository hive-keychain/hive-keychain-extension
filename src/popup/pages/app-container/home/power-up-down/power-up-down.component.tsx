import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { PowerUpDownTopPanelComponent } from '@popup/pages/app-container/home/power-up-down/power-up-down-top-panel/power-up-down-top-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './power-up-down.component.scss';

const PowerUpDown = ({
  currencyLabels,
  activeAccount,
  powerType,
  globalProperties,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(activeAccount.name!);
  const [value, setValue] = useState<string | number>(0);
  const [current, setCurrent] = useState<string | number>('...');
  const [available, setAvailable] = useState<string | number>('...');

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
      fields: [
        { label: 'popup_html_operation', value: operationString },
        { label: 'popup_html_value', value: valueS },
      ],
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
                value.toString(),
                globalProperties.globals!,
              ).toFixed(6)} VESTS`,
            );
            break;
        }

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

  const setToMax = () => {
    setValue(available);
  };

  return (
    <div className="power-up-page">
      <PageTitleComponent title={title} isBackButtonEnabled={true} />
      <PowerUpDownTopPanelComponent
        powerType={powerType}
        available={available}
        current={current}
      />
      <div className="text">{chrome.i18n.getMessage(text)}</div>
      <InputComponent
        type={InputType.TEXT}
        placeholder="popup_html_username"
        value={username}
        onChange={setUsername}
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
        <div className="currency">{currency}</div>
      </div>

      <ButtonComponent label={title} onClick={() => handleButtonClick()} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    powerType: state.navigation.params.powerType as PowerType,
    globalProperties: state.globalProperties,
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

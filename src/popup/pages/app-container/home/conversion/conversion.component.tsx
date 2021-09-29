import {
  setErrorMessage,
  setSuccessMessage
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams
} from '@popup/actions/navigation.actions';
import { ConversionType } from '@popup/pages/app-container/home/conversion/conversion-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Conversion } from 'src/interfaces/conversion.interface';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './conversion.component.scss';

const Conversion = ({
  currencyLabels,
  activeAccount,
  conversionType,
  conversions,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
}: PropsFromRedux) => {
  const [value, setValue] = useState<string | number>(0);
  const [available, setAvailable] = useState<string | number>('...');

  const currency =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? currencyLabels.hive
      : currencyLabels.hbd;

  useEffect(() => {
    const hiveBalance = FormatUtils.formatCurrencyValue(
      activeAccount.account.balance,
    );
    const hbdBalance = FormatUtils.formatCurrencyValue(
      activeAccount.account.hbd_balance,
    );

    setAvailable(
      conversionType === ConversionType.CONVERT_HIVE_TO_HBD
        ? hiveBalance
        : hbdBalance,
    );
  }, [activeAccount]);

  const title =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? 'popup_html_convert_hive'
      : 'popup_html_convert_hbd';
  const text =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? 'popup_html_convert_hive_intro'
      : 'popup_html_convert_hbd_intro';

  const handleButtonClick = () => {
    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    const operationString = chrome.i18n
      .getMessage(
        conversionType === ConversionType.CONVERT_HIVE_TO_HBD
          ? 'popup_html_convert_hive'
          : 'popup_html_convert_hbd',
      )
      .toLowerCase();
    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_power_up_down_message',
        [operationString],
      ),
      fields: [
        { label: 'popup_html_value', value: valueS },
      ],
      afterConfirmAction: async () => {
        let success = await HiveUtils.convertOperation(
          activeAccount,
          conversions,
          valueS,
          conversionType,
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

  const setToMax = () => {
    setValue(available);
  };

  return (
    <div className="power-up-page">
      <PageTitleComponent title={title} isBackButtonEnabled={true} />
      <div className="text">{chrome.i18n.getMessage(text)}</div>

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
    conversionType: state.navigation.params.conversionType as ConversionType,
    conversions: state.conversions as Conversion[],
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ConversionComponent = connector(Conversion);

import { ConversionUtils } from '@hiveapp/utils/conversion.utils';
import CurrencyUtils from '@hiveapp/utils/currency.utils';
import { Asset } from '@hiveio/dhive';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SummaryPanelComponent } from 'src/common-ui/summary-panel/summary-panel.component';
import { Conversion } from 'src/interfaces/conversion.interface';
import { fetchConversionRequests } from 'src/popup/hive/actions/conversion.actions';
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
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { RootState } from 'src/popup/hive/store';
import { Screen } from 'src/reference-data/screen.enum';
import FormatUtils from 'src/utils/format.utils';
import './conversion.component.scss';

const Conversion = ({
  currencyLabels,
  activeAccount,
  conversionType,
  conversions,
  formParams,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  fetchConversionRequests,
}: PropsFromRedux) => {
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [available, setAvailable] = useState<string | number>('...');
  const [totalPending, setTotalPending] = useState<number>(0);
  const [pendingConversions, setPendingConversions] = useState<Conversion[]>(
    [],
  );

  const currency =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? currencyLabels.hive
      : currencyLabels.hbd;

  useEffect(() => {
    setTitleContainerProperties({ title: title, isBackButtonEnabled: true });
  }, []);

  useEffect(() => {
    fetchConversionRequests(activeAccount.name!);

    const hiveBalance = FormatUtils.toNumber(activeAccount.account.balance);
    const hbdBalance = FormatUtils.toNumber(activeAccount.account.hbd_balance);

    setAvailable(
      conversionType === ConversionType.CONVERT_HIVE_TO_HBD
        ? hiveBalance
        : hbdBalance,
    );
  }, [activeAccount]);

  useEffect(() => {
    const conv: Conversion[] = conversions.filter((conversion) => {
      return (
        (conversionType === ConversionType.CONVERT_HIVE_TO_HBD &&
          conversion.collaterized) ||
        (conversionType === ConversionType.CONVERT_HBD_TO_HIVE &&
          !conversion.collaterized)
      );
    });

    setPendingConversions(conv);
    const total = conv.reduce((previous, current) => {
      return previous + Asset.fromString(current.amount).amount;
    }, 0);
    setTotalPending(total);
  }, [conversions]);

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

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        conversionType === ConversionType.CONVERT_HBD_TO_HIVE
          ? 'popup_html_confirm_hbd_to_hive_conversion'
          : 'popup_html_confirm_hive_to_hbd_conversion',
      ),
      fields: [
        { label: 'popup_html_value', value: valueS },
        { label: 'popup_html_username', value: `@${activeAccount.name!}` },
      ],
      title: title,
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_conversion_operation');
        try {
          let success = await ConversionUtils.convert(
            activeAccount.name!,
            conversions,
            valueS,
            conversionType,
            activeAccount.keys.active!,
          );

          if (success && success?.confirmed) {
            navigateTo(Screen.HOME_PAGE, true);
            setSuccessMessage(
              conversionType === ConversionType.CONVERT_HBD_TO_HIVE
                ? 'popup_html_hbd_to_hive_conversion_success'
                : 'popup_html_hive_to_hbd_conversion_success',
            );
          } else {
            setErrorMessage(
              conversionType === ConversionType.CONVERT_HBD_TO_HIVE
                ? 'popup_html_hbd_to_hive_conversion_fail'
                : 'popup_html_hive_to_hbd_conversion_fail',
            );
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_conversion_operation');
        }
      },
    });
  };

  const setToMax = () => {
    setValue(available);
  };

  const getFormParams = () => {
    return {
      value: value,
    };
  };

  const goToPendingConversion = () => {
    navigateToWithParams(Screen.PENDING_CONVERSION_PAGE, {
      pendingConversions: pendingConversions,
      currency: currency,
    });
  };

  return (
    <div
      className="conversion-page"
      data-testid={`${Screen.CONVERSION_PAGE}-page`}>
      {totalPending > 0 && (
        <SummaryPanelComponent
          top={available}
          topRight={currency}
          topLeft={'popup_html_available'}
          bottom={totalPending}
          bottomRight={currency}
          bottomLeft={'popup_html_pending'}
          onBottomPanelClick={goToPendingConversion}
        />
      )}
      {totalPending === 0 && (
        <SummaryPanelComponent
          bottom={available}
          bottomRight={currency}
          bottomLeft={'popup_html_available'}
        />
      )}
      <div className="text">{chrome.i18n.getMessage(text)}</div>

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
        <div className="currency">{currency}</div>
      </div>

      <OperationButtonComponent
        dataTestId="submit-button"
        label={title}
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
    conversionType: state.navigation.stack[0].params
      .conversionType as ConversionType,
    conversions: state.conversions as Conversion[],
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
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  fetchConversionRequests,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ConversionComponent = connector(Conversion);

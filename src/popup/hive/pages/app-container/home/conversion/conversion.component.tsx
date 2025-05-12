import { joiResolver } from '@hookform/resolvers/joi';
import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { HiveChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { Asset } from 'hive-keychain-commons';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { HiveConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { Conversion as ConversionInterface } from 'src/interfaces/conversion.interface';
import { fetchConversionRequests } from 'src/popup/hive/actions/conversion.actions';
import { ConversionType } from 'src/popup/hive/pages/app-container/home/conversion/conversion-type.enum';
import { ConversionUtils } from 'src/popup/hive/utils/conversion.utils';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';

interface ConversionForm {
  receiver: string;
  amount: number;
  currency: string;
}

const rules = FormUtils.createRules<ConversionForm>({
  receiver: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$maxAmount')),
});

const ConversionPage = ({
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
  const { control, handleSubmit, setValue, watch } = useForm<ConversionForm>({
    defaultValues: {
      receiver: formParams.receiver ? formParams.receiver : activeAccount.name,
      amount: formParams.amount ? formParams.amount : '',
      currency:
        conversionType === ConversionType.CONVERT_HIVE_TO_HBD
          ? currencyLabels.hive
          : currencyLabels.hbd,
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<ConversionForm>>(rules, {
        context: { maxAmount: available },
        errors: { render: true },
      });
      return resolver(values, { maxAmount: available }, options);
    },
  });

  const [available, setAvailable] = useState<string | number>('...');
  const [totalPending, setTotalPending] = useState<number>(0);
  const [pendingConversions, setPendingConversions] = useState<
    ConversionInterface[]
  >([]);

  useEffect(() => {
    setTitleContainerProperties({ title: title, isBackButtonEnabled: true });
  }, []);

  useEffect(() => {
    fetchConversionRequests(activeAccount.name!);

    const hiveBalance = FormatUtils.toNumber(
      activeAccount.account.balance as string,
    );
    const hbdBalance = FormatUtils.toNumber(
      activeAccount.account.hbd_balance as string,
    );

    setAvailable(
      conversionType === ConversionType.CONVERT_HIVE_TO_HBD
        ? hiveBalance
        : hbdBalance,
    );
  }, [activeAccount]);

  useEffect(() => {
    const conv: ConversionInterface[] = conversions.filter((conversion) => {
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

  const handleButtonClick = (form: ConversionForm) => {
    if (parseFloat(form.amount.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    const formattedValue = `${parseFloat(form.amount.toString()).toFixed(3)} ${
      form.currency
    }`;

    const stringifiedAmount = `${FormatUtils.formatCurrencyValue(
      parseFloat(form.amount.toString()),
    )} ${form.currency}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: KeychainKeyTypes.active,
      message: chrome.i18n.getMessage(
        conversionType === ConversionType.CONVERT_HBD_TO_HIVE
          ? 'popup_html_confirm_hbd_to_hive_conversion'
          : 'popup_html_confirm_hive_to_hbd_conversion',
      ),
      fields: [
        { label: 'popup_html_value', value: stringifiedAmount },
        { label: 'popup_html_username', value: `@${activeAccount.name!}` },
      ],
      title: title,
      formParams: getFormParams(),
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_conversion_operation');
        try {
          let success = await ConversionUtils.convert(
            activeAccount.name!,
            conversions,
            formattedValue,
            conversionType,
            activeAccount.keys.active!,
            options,
          );

          if (success) {
            navigateTo(Screen.HOME_PAGE, true);

            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else {
              setSuccessMessage(
                conversionType === ConversionType.CONVERT_HBD_TO_HIVE
                  ? 'popup_html_hbd_to_hive_conversion_success'
                  : 'popup_html_hive_to_hbd_conversion_success',
              );
            }
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
    } as HiveConfirmationPageParams);
  };

  const setToMax = () => {
    setValue('amount', Number(available));
  };

  const getFormParams = () => {
    return watch();
  };

  const goToPendingConversion = () => {
    navigateToWithParams(Screen.PENDING_CONVERSION_PAGE, {
      pendingConversions: pendingConversions,
      currency: watch('currency'),
    });
  };

  return (
    <div
      className="conversion-page"
      data-testid={`${Screen.CONVERSION_PAGE}-page`}>
      <BalanceSectionComponent
        unit={watch('currency')}
        value={available}
        label="popup_html_balance"
        decimals={3}
      />

      {totalPending > 0 && (
        <div
          className="pending-conversion-panel"
          onClick={goToPendingConversion}>
          <div className="pending-conversion-text">
            {totalPending} {watch('currency')}{' '}
            {chrome.i18n.getMessage('popup_html_pending')}{' '}
          </div>
        </div>
      )}

      <FormContainer onSubmit={handleSubmit(handleButtonClick)}>
        <div className="text">{chrome.i18n.getMessage(text)}</div>
        <Separator fullSize type="horizontal" />
        <div className="form-fields">
          <div className="amount-panel">
            <FormInputComponent
              classname="currency-fake-input"
              dataTestId="currency-input"
              control={control}
              name="currency"
              type={InputType.TEXT}
              label="popup_html_currency"
              disabled
            />
            <FormInputComponent
              name="amount"
              dataTestId="amount-input"
              control={control}
              type={InputType.NUMBER}
              placeholder="0.000"
              skipPlaceholderTranslation
              label="popup_html_amount"
              min={0}
              rightActionClicked={setToMax}
              rightActionIcon={SVGIcons.INPUT_MAX}
            />
          </div>
        </div>

        <OperationButtonComponent
          dataTestId="submit-button"
          label={title}
          onClick={handleSubmit(handleButtonClick)}
          requiredKey={KeychainKeyTypesLC.active}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    currencyLabels: (state.chain as HiveChain).mainTokens,
    conversionType: state.navigation.stack[0].params
      .conversionType as ConversionType,
    conversions: state.hive.conversions as ConversionInterface[],
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

export const ConversionComponent = connector(ConversionPage);

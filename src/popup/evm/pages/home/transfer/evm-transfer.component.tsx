import { joiResolver } from '@hookform/resolvers/joi';
import { Screen } from '@interfaces/screen.interface';
import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import { GasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmTransferUtils } from '@popup/evm/utils/evm-transfer.utils';
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
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { EVMConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { FormUtils } from 'src/utils/form.utils';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

interface TransferForm {
  receiverAddress: string;
  selectedToken: EVMToken;
  amount: number;
}

const transferFormRules = FormUtils.createRules<TransferForm>({
  receiverAddress: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
  selectedToken: Joi.object().required(),
});

const EvmTransfer = ({
  formParams,
  navParams,
  activeAccount,
  chain,
  localAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } = useForm<TransferForm>({
    defaultValues: {
      receiverAddress: formParams.receiverAddress
        ? formParams.receiverUsername
        : '',
      selectedToken: formParams.selectedToken
        ? formParams.selectedToken
        : navParams.selectedCurrency,
      amount: formParams.amount ? formParams.amount : '',
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<TransferForm>>(
        transferFormRules,
        { context: { balance: balance }, errors: { render: true } },
      );
      return resolver(values, { balance: balance }, options);
    },
  });

  const [balance, setBalance] = useState<string | number>('...');
  const [tokenOptions, setTokenOptions] = useState<OptionItem[]>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_funds',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (activeAccount) {
      setTokenOptions(
        EvmAccountUtils.filterSpamTokens(activeAccount.balances).map(
          (tokenBalance, index) => {
            return {
              label: tokenBalance.tokenInfo.symbol.toUpperCase(),
              subLabel: tokenBalance.tokenInfo.name,
              value: tokenBalance,
              img: tokenBalance.tokenInfo.logo,
              key: `item-${tokenBalance.tokenInfo.symbol}-${index}`,
            };
          },
        ),
      );
    }
  }, [activeAccount]);

  useEffect(() => {
    setBalance(watch('selectedToken').balanceInteger);
  }, [watch('selectedToken')]);

  const handleClickOnSend = async (form: TransferForm) => {
    if (form.amount <= 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(form.amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    let fields = [
      {
        label: 'popup_html_transfer_from',
        value: `${FormatUtils.shortenString(activeAccount.address, 10)}`,
      },
      {
        label: 'popup_html_transfer_to',
        value: `${FormatUtils.shortenString(form.receiverAddress, 10)}`,
      },
      {
        label: 'popup_html_transfer_amount',
        value: `${FormatUtils.formatCurrencyValue(
          form.amount,
        )} ${form.selectedToken.tokenInfo.symbol.toUpperCase()}`,
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      message: chrome.i18n.getMessage('popup_html_transfer_confirm_text'),
      fields: fields,
      title: 'popup_html_transfer_funds',
      formParams: watch(),
      hasGasFee: true,
      token: form.selectedToken,
      receiverAddress: form.receiverAddress,
      amount: form.amount,
      wallet: localAccounts[0].wallet,
      afterConfirmAction: async (gasFee: GasFeeEstimation) => {
        addToLoadingList('html_popup_transfer_fund_operation');
        try {
          const transactionReceipt = await EvmTransferUtils.transfer(
            chain,
            form.selectedToken,
            form.receiverAddress,
            form.amount,
            localAccounts[0].wallet,
            gasFee,
          );
          Logger.log(transactionReceipt);
          setSuccessMessage('popup_html_evm_transfer_successful');
        } catch (err) {
          Logger.error('Error during transfer', err);
          setErrorMessage('popup_html_transfer_failed');
        } finally {
          removeFromLoadingList('html_popup_transfer_fund_operation');
        }
      },
    } as EVMConfirmationPageParams);
  };

  const setAmountToMaxValue = () => {
    setValue('amount', Number(balance));
  };

  return (
    <>
      <div
        className="transfer-funds-page"
        data-testid={`${Screen.TRANSFER_FUND_PAGE}-page`}>
        <BalanceSectionComponent
          value={balance}
          unit={watch('selectedToken').tokenInfo.symbol}
          label="popup_html_balance"
        />

        {tokenOptions && (
          <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
            <div className="form-fields">
              <FormInputComponent
                name="receiverAddress"
                control={control}
                dataTestId="input-address"
                type={InputType.TEXT}
                logo={SVGIcons.INPUT_AT}
                placeholder="popup_html_address"
                label="popup_html_username"
              />
              <div className="value-panel">
                <ComplexeCustomSelect
                  label="popup_html_currency"
                  options={tokenOptions}
                  selectedItem={
                    {
                      value: watch('selectedToken'),
                      label:
                        watch('selectedToken').tokenInfo.symbol.toUpperCase(),
                      subLabel: watch('selectedToken').tokenInfo.name,
                      img: watch('selectedToken').tokenInfo.logo,
                    } as OptionItem
                  }
                  setSelectedItem={(item) => {
                    setValue('selectedToken', item.value);
                  }}
                />

                <div className="value-input-panel">
                  <FormInputComponent
                    name="amount"
                    control={control}
                    dataTestId="amount-input"
                    type={InputType.NUMBER}
                    label="popup_html_transfer_amount"
                    placeholder="0.000"
                    skipPlaceholderTranslation
                    min={0}
                    rightActionClicked={setAmountToMaxValue}
                    rightActionIcon={SVGIcons.INPUT_MAX}
                  />
                </div>
              </div>
            </div>
            <ButtonComponent
              dataTestId="send-transfer"
              onClick={handleSubmit(handleClickOnSend)}
              label={'popup_html_send_transfer'}
            />
          </FormContainer>
        )}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    navParams: state.navigation.stack[0].params,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransferComponent = connector(EvmTransfer);

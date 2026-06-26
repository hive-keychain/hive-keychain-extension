import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import { EvmSignerUtils } from '@popup/evm/utils/evm-signer.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import Decimal from 'decimal.js';
import { ethers, parseUnits } from 'ethers';
import Joi from 'joi';
import React, { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import { BalanceSectionComponent } from 'src/common-ui/balance-section/balance-section.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { EVMConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { EvmAddressComponent } from 'src/common-ui/evm/evm-address/evm-address.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { KeychainError } from 'src/keychain-error';
import { FormUtils } from 'src/utils/form.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface TransferForm {
  receiverAddress: string;
  selectedToken: NativeAndErc20Token;
  amount: string;
}

const transferFormRules = FormUtils.createRules<TransferForm>({
  receiverAddress: Joi.string().required(),
  amount: Joi.string()
    .required()
    .custom((value, helpers) => {
      try {
        new Decimal(value);
        return value;
      } catch {
        return helpers.error('number.base');
      }
    }),
  selectedToken: Joi.object().required(),
});

const formatExactDecimalWithCommas = (
  value: string,
  decimals: number,
  removeTrailingZeros = false,
) => {
  const parts = new Decimal(value).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let finalNumber = parts.join('.');

  if (removeTrailingZeros) {
    finalNumber = finalNumber.replace(
      /^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/,
      '$1$2$3',
    );
  }

  return finalNumber;
};

const toDecimalString = (amount: string | number) =>
  new Decimal(amount).toFixed();

const NATIVE_MAX_ESTIMATE_DEBOUNCE_MS = 350;

export const getEvmTransferValueHex = (
  amount: string | number,
  decimals: number,
) => ethers.toQuantity(parseUnits(toDecimalString(amount), decimals));

export const getEvmTransferMaxAmount = (
  balance: string | number,
  feeToReserve?: Decimal.Value,
  decimals = 18,
) =>
  Decimal.max(new Decimal(balance).sub(feeToReserve ?? 0), 0)
    .toDecimalPlaces(decimals, Decimal.ROUND_DOWN)
    .toFixed();

export const getEvmTransferErrorMessage = (error: unknown) => {
  if (error instanceof KeychainError) {
    return {
      key: error.message,
      params: error.messageParams ?? [],
    };
  }

  return {
    key: 'popup_html_transfer_failed',
    params: [],
  };
};

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
  navigateToWithParams,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } = useForm<TransferForm>({
    defaultValues: {
      receiverAddress: formParams.receiverAddress
        ? formParams.receiverUsername
        : '',
      selectedToken: formParams?.selectedToken
        ? formParams?.selectedToken
        : navParams?.selectedCurrency,
      amount: formParams.amount ? formParams.amount.toString() : '',
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
  const [autocompleteValues, setAutocompleteValues] =
    useState<AutoCompleteValues>();
  const [nativeMaxAmount, setNativeMaxAmount] = useState<{
    key: string;
    value?: string;
  }>();
  const nativeMaxRequestId = useRef(0);
  const selectedToken = useWatch({ control, name: 'selectedToken' });
  const receiverAddress = useWatch({ control, name: 'receiverAddress' });

  const prefillReceiverAddress = (values: AutoCompleteValues) => {
    if (!formParams.receiverAddress) return;

    const prefilledValue = values.categories
      .flatMap((category) => category.values)
      .find(
        (value) =>
          value.value.toLowerCase() ===
          formParams.receiverAddress.toLowerCase(),
      )?.value;

    if (prefilledValue) {
      setValue('receiverAddress', prefilledValue);
    }
  };

  const loadTokenOptions = async (isCancelled: () => boolean) => {
    const filteredTokens = (await EvmTokensUtils.filterTokensBasedOnSettings(
      activeAccount.nativeAndErc20Tokens.value,
    )) as NativeAndErc20Token[];

    if (isCancelled()) return;

    setTokenOptions(
      filteredTokens.map((tokenBalance, index) => {
        return {
          label: tokenBalance.tokenInfo.symbol,
          subLabel: tokenBalance.tokenInfo.name,
          value: tokenBalance,
          img: tokenBalance.tokenInfo.logo,
          key: `item-${tokenBalance.tokenInfo.symbol}-${index}`,
        };
      }),
    );

    if (!watch('selectedToken')) {
      setValue(
        'selectedToken',
        filteredTokens.find(
          (t) => t.tokenInfo.type === EVMSmartContractType.NATIVE,
        )!,
      );
    }
  };

  const loadAutocomplete = async (isCancelled: () => boolean) => {
    const values = await EvmAddressesUtils.getWhiteListAutocomplete(
      chain,
      localAccounts,
      activeAccount.wallet.address,
    );

    if (isCancelled()) return;

    setAutocompleteValues(values);
    prefillReceiverAddress(values);

    const enrichedValues = await EvmAddressesUtils.enrichWhiteListAutocomplete(
      values,
    );

    if (isCancelled()) return;

    setAutocompleteValues(enrichedValues);
  };

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_funds',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (activeAccount) {
      let cancelled = false;

      void loadTokenOptions(() => cancelled);

      return () => {
        cancelled = true;
      };
    }
  }, [activeAccount]);

  useEffect(() => {
    if (activeAccount) {
      let cancelled = false;

      void loadAutocomplete(() => cancelled);

      return () => {
        cancelled = true;
      };
    }
  }, [activeAccount, chain, localAccounts, formParams.receiverAddress]);

  useEffect(() => {
    if (selectedToken) setBalance(selectedToken.balanceInteger);
  }, [selectedToken]);

  const handleClickOnSend = async (form: TransferForm) => {
    const amount = new Decimal(form.amount);

    if (amount.lessThanOrEqualTo(0)) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (amount.greaterThan(new Decimal(balance.toString()))) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    const recipientValidation =
      await EvmAddressesUtils.validateTransferRecipient(
        form.receiverAddress,
        chain.chainId,
        localAccounts,
      );
    if (!recipientValidation.valid) {
      setErrorMessage(
        recipientValidation.messageKey,
        recipientValidation.messageParams ?? [],
      );
      return;
    }
    const receiverAddress = recipientValidation.address;

    const decimals =
      form.selectedToken.tokenInfo.type === EVMSmartContractType.ERC20
        ? form.selectedToken.tokenInfo.decimals
        : 18;

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation({
        to: receiverAddress,
        contract:
          form.selectedToken.tokenInfo.type === EVMSmartContractType.ERC20
            ? form.selectedToken.tokenInfo.contractAddress
            : undefined,
        tokenContract:
          form.selectedToken.tokenInfo.type === EVMSmartContractType.ERC20
            ? form.selectedToken.tokenInfo.contractAddress
            : undefined,
        chainId: chain.chainId,
        tokenType: form.selectedToken.tokenInfo.type,
      });

    let fields = [
      {
        label: 'popup_html_transfer_from',
        value: (
          <EvmAddressComponent
            address={activeAccount.address}
            chainId={chain.chainId}
            canCopy
            localAccounts={localAccounts}
          />
        ),
      },
      {
        label: 'popup_html_transfer_to',
        value: (
          <EvmAddressComponent
            address={receiverAddress}
            chainId={chain.chainId}
            canCopy
            localAccounts={localAccounts}
          />
        ),
        warnings: await EvmTransactionParserUtils.getAddressWarning(
          receiverAddress,
          chain.chainId,
          transactionInfo,
          localAccounts,
        ),
      },
      {
        label: 'popup_html_transfer_amount',
        value: (
          <div className="value-content-horizontal">
            {form.selectedToken.tokenInfo && (
              <EvmTokenLogo tokenInfo={form.selectedToken.tokenInfo} />
            )}
            <span>{`${formatExactDecimalWithCommas(
              form.amount,
              decimals,
              true,
            )} ${
              form.selectedToken.tokenInfo.symbol
            }`}</span>
          </div>
        ),
      },
    ];

    let transactionData: ProviderTransactionData;
    try {
      transactionData = {
        from: activeAccount.address,
        type: chain.defaultTransactionType,
        to:
          form.selectedToken.tokenInfo.type === EVMSmartContractType.NATIVE
            ? receiverAddress
            : form.selectedToken.tokenInfo.contractAddress,
        data:
          form.selectedToken.tokenInfo.type === EVMSmartContractType.NATIVE
            ? ''
            : await encodeTransferData(
                form.selectedToken.tokenInfo,
                activeAccount,
                receiverAddress,
                form.amount,
              ),
        value:
          form.selectedToken.tokenInfo.type === EVMSmartContractType.NATIVE
            ? getEvmTransferValueHex(form.amount, decimals)
            : '0x0',
      };
    } catch {
      setErrorMessage('transaction_wrong_format_decimal_error', [
        decimals.toString(),
      ]);
      return;
    }
    const ledgerClearSigningWarning =
      EvmLedgerUtils.getClearSigningFallbackWarning(
        activeAccount.wallet,
        transactionData.data,
      );
    if (ledgerClearSigningWarning) {
      const smartContractField = fields.find(
        (field) => field.label === 'evm_operation_smart_contract_address',
      );
      if (smartContractField) {
        smartContractField.warnings = [
          ...(smartContractField.warnings ?? []),
          ledgerClearSigningWarning,
        ];
      }
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      message: I18nUtils.getMessage('popup_html_transfer_confirm_text'),
      fields: fields,
      title: 'popup_html_transfer_funds',
      formParams: watch(),
      hasGasFee: true,
      tokenInfo: form.selectedToken.tokenInfo,
      receiverAddress,
      amount: form.amount,
      wallet: activeAccount.wallet,
      transactionData: transactionData,
      afterConfirmAction: async (gasFee: GasFeeEstimationBase) => {
        addToLoadingList(
          'html_popup_transfer_fund_operation',
          EvmSignerUtils.isLedgerWallet(activeAccount.wallet)
            ? PrivateKeyType.LEDGER
            : undefined,
        );
        try {
          const transactionResponse = await EvmTransactionsUtils.send(
            activeAccount.wallet,
            {
              value: transactionData.value,
              to: transactionData.to,
              type: Number(transactionData.type),
              data: transactionData.data,
            },
            gasFee,
            chain.chainId,
          );

          navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
            pageTitle: 'popup_html_transfer_funds',
            transactionResponse: transactionResponse,
            detailFields: [
              {
                label: 'popup_html_transfer_from',
                value: activeAccount.address,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              } as EvmUserHistoryItemDetail,
              {
                label: 'popup_html_transfer_to',
                value: receiverAddress,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              } as EvmUserHistoryItemDetail,
              {
                label: 'popup_html_transfer_amount',
                value: form.amount.toString(),
                type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
              } as EvmUserHistoryItemDetail,
            ],
            tokenInfo: form.selectedToken.tokenInfo,
            gasFee: gasFee,
            transactionData: transactionData,
          });
        } catch (err) {
          Logger.error('Error during transfer', err);
          const errorMessage = getEvmTransferErrorMessage(err);
          setErrorMessage(errorMessage.key, errorMessage.params);
        } finally {
          removeFromLoadingList('html_popup_transfer_fund_operation');
        }
      },
    } as EVMConfirmationPageParams);
  };

  const getNativeTransferFeeToReserve = async (
    token: NativeAndErc20Token,
    receiver: string,
  ) => {
    const to = ethers.isAddress(receiver) ? receiver : activeAccount.address;
    const estimate = await GasFeeUtils.estimate(
      chain,
      activeAccount.address,
      chain.defaultTransactionType,
      token.tokenInfo.priceUsd ?? 0,
      undefined,
      {
        from: activeAccount.address,
        type: chain.defaultTransactionType,
        to,
        data: '',
        value: '0x0',
      },
    );

    return (
      estimate.aggressive?.estimatedFeeInEth ??
      estimate.suggested?.estimatedFeeInEth ??
      estimate.custom?.estimatedFeeInEth
    );
  };

  const getNativeMaxEstimateKey = (
    token: NativeAndErc20Token,
    receiver: string,
    currentBalance: string | number,
  ) =>
    [
      chain.chainId,
      activeAccount.address.toLowerCase(),
      ethers.isAddress(receiver)
        ? receiver.toLowerCase()
        : activeAccount.address.toLowerCase(),
      currentBalance.toString(),
      token.tokenInfo.priceUsd ?? 0,
    ].join(':');

  const estimateNativeMaxAmount = async (
    token: NativeAndErc20Token,
    receiver: string,
    currentBalance: string | number,
    key: string,
  ) => {
    const feeToReserve = await getNativeTransferFeeToReserve(token, receiver);
    return {
      key,
      value: getEvmTransferMaxAmount(currentBalance, feeToReserve, 18),
    };
  };

  useEffect(() => {
    if (
      !selectedToken ||
      selectedToken.tokenInfo.type !== EVMSmartContractType.NATIVE ||
      balance === '...'
    ) {
      setNativeMaxAmount(undefined);
      return;
    }

    try {
      new Decimal(balance.toString());
    } catch {
      setNativeMaxAmount(undefined);
      return;
    }

    const normalizedReceiverAddress = receiverAddress ?? '';
    const key = getNativeMaxEstimateKey(
      selectedToken,
      normalizedReceiverAddress,
      balance,
    );
    const requestId = ++nativeMaxRequestId.current;
    setNativeMaxAmount((previous) =>
      previous?.key === key && previous.value ? previous : { key },
    );

    const timeout = setTimeout(() => {
      estimateNativeMaxAmount(
        selectedToken,
        normalizedReceiverAddress,
        balance,
        key,
      )
        .then((estimate) => {
          if (nativeMaxRequestId.current === requestId) {
            setNativeMaxAmount(estimate);
          }
        })
        .catch((error) => {
          Logger.error(
            'Error while pre-estimating native transfer max amount',
            error,
          );
          if (nativeMaxRequestId.current === requestId) {
            setNativeMaxAmount({ key });
          }
        });
    }, NATIVE_MAX_ESTIMATE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      nativeMaxRequestId.current += 1;
    };
  }, [selectedToken, receiverAddress, balance, chain, activeAccount.address]);

  const setAmountToMaxValue = async () => {
    const selectedToken = watch('selectedToken');

    if (selectedToken.tokenInfo.type !== EVMSmartContractType.NATIVE) {
      setValue('amount', balance.toString());
      return;
    }

    try {
      const receiverAddress = watch('receiverAddress') ?? '';
      const nativeMaxKey = getNativeMaxEstimateKey(
        selectedToken,
        receiverAddress,
        balance,
      );
      if (nativeMaxAmount?.key === nativeMaxKey && nativeMaxAmount.value) {
        setValue('amount', nativeMaxAmount.value);
        return;
      }

      const estimate = await estimateNativeMaxAmount(
        selectedToken,
        receiverAddress,
        balance,
        nativeMaxKey,
      );
      setNativeMaxAmount(estimate);
      setValue('amount', estimate.value);
    } catch (error) {
      Logger.error('Error while estimating native transfer max amount', error);
      setErrorMessage('evm_gas_fee_warning_not_available');
    }
  };

  const encodeTransferData = async (
    tokenInfo: EvmSmartContractInfoErc20,
    selectedAccount: EvmActiveAccount,
    receiverAddress: string,
    amount: string,
  ) => {
    const contractInterface = new ethers.Interface(Erc20Abi);

    const finalAmount = parseUnits(
      toDecimalString(amount),
      (tokenInfo as EvmSmartContractInfoErc20).decimals,
    );
    return contractInterface.encodeFunctionData('transfer', [
      receiverAddress,
      finalAmount,
    ]);
  };

  return (
    <>
      {watch('selectedToken') && (
        <div
          className="transfer-funds-page"
          data-testid={`${Screen.TRANSFER_FUND_PAGE}-page`}>
          <BalanceSectionComponent
            value={watch('selectedToken').formattedBalance}
            unit={watch('selectedToken').tokenInfo.symbol}
            label="popup_html_balance"
            skipFormat
          />

          {tokenOptions && (
            <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
              <div className="form-fields">
                <FormInputComponent
                  name="receiverAddress"
                  control={control}
                  dataTestId="input-address"
                  type={InputType.TEXT}
                  placeholder="evm_contact_address"
                  label="evm_contact_address"
                  autocompleteValues={autocompleteValues}
                />
                <div className="value-panel">
                  <ComplexeCustomSelect
                    label="popup_html_currency"
                    options={tokenOptions}
                    selectedItem={
                      {
                        value: watch('selectedToken'),
                        label: watch('selectedToken').tokenInfo.symbol,
                        subLabel: watch('selectedToken').tokenInfo.name,
                        img: watch('selectedToken').tokenInfo.logo,
                      } as OptionItem
                    }
                    setSelectedItem={(item) => {
                      setValue('selectedToken', item.value);
                    }}
                    generateImageIfNull
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
      )}
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
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmTransferComponent = connector(EvmTransfer);

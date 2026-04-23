import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import {
  CustomGasFeeForm,
  FullGasFeeEstimation,
  GasFeeEstimationBase,
} from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeePanelItem } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel-item.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { ethers, HDNodeWallet } from 'ethers';
import EventEmitter from 'events';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

interface GasFeePanelProps {
  chain: EvmChain;
  wallet: HDNodeWallet;
  selectedFee?: GasFeeEstimationBase;
  onSelectFee: (fee: GasFeeEstimationBase) => void;
  multiplier?: number;
  transactionType: EvmTransactionType;
  transactionData?: ProviderTransactionData;
  forceOpenGasFeePanelEvent?: EventEmitter;
  setErrorMessage: (error: EtherRPCCustomError) => void;
}

export const GasFeePanel = ({
  chain,
  wallet,
  selectedFee,
  onSelectFee,
  multiplier,
  transactionType,
  transactionData,
  forceOpenGasFeePanelEvent,
  setErrorMessage,
}: GasFeePanelProps) => {
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();

  const [gasFeeWarning, setgasFeeWarning] = useState<string>();
  const [customFeeFormWarning, setCustomFeeFormWarning] = useState<string>();

  const [isCustomFeePanelOpened, setCustomFeePanelOpened] =
    useState<boolean>(false);
  const [customGasFeeForm, setCustomGasFeeForm] = useState<CustomGasFeeForm>({
    gasLimit: '0',
    maxBaseFeeInGwei: '0',
    priorityFeeInGwei: '0',
    gasPriceInGwei: '0',
    type: transactionType,
  });

  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);

  const [mainTokenPrice, setMainTokenPrice] = useState<number>();

  useEffect(() => {
    forceOpenGasFeePanelEvent?.addListener('forceOpenCustomFeePanel', () => {
      openCustomFeePanel();
    });
  }, []);

  useEffect(() => {
    if (transactionData) init();
  }, [transactionData]);

  useEffect(() => {
    if (selectedFee) {
      const gasLimit = new Decimal(selectedFee.gasLimit ?? 0);
      const gasPriceInGwei = new Decimal(selectedFee?.gasPriceInGwei ?? 0);
      const maxBaseFeeInGwei = new Decimal(
        selectedFee?.baseFeePerGasInGwei ?? 0,
      );
      const priorityFeeInGwei = new Decimal(selectedFee.priorityFeeInGwei ?? 0);
      setCustomGasFeeForm({
        gasLimit: gasLimit.toFixed(),
        type: transactionType,
        gasPriceInGwei: gasPriceInGwei.toFixed(),
        maxBaseFeeInGwei: maxBaseFeeInGwei.toFixed(),
        priorityFeeInGwei: priorityFeeInGwei.toFixed(),

        gasPriceInEth: new Decimal(
          ethers.formatUnits(Number(gasLimit.toFixed(0)), 'gwei'),
        ).mul(gasPriceInGwei),
        priorityFeeInEth: new Decimal(
          ethers.formatUnits(Number(gasLimit.toFixed(0)), 'gwei'),
        ).mul(priorityFeeInGwei),
        maxBaseFeeInEth: new Decimal(
          ethers.formatUnits(Number(gasLimit.toFixed(0)), 'gwei'),
        ).mul(maxBaseFeeInGwei),
      });
    }
  }, [selectedFee]);

  const init = async () => {
    let estimate;

    const mainTokenInfo = await EvmTokensUtils.getMainTokenInfo(
      chain as EvmChain,
    );
    setMainTokenPrice(mainTokenInfo.priceUsd);

    try {
      estimate = await GasFeeUtils.estimate(
        chain,
        wallet,
        transactionType,
        mainTokenInfo.priceUsd,
        transactionData?.gasLimit
          ? Number(transactionData.gasLimit)
          : undefined,
        transactionData,
      );

      if (!!multiplier && selectedFee) {
        const increasedFee: GasFeeEstimationBase = {
          ...selectedFee,
          estimatedFeeInEth: new Decimal(selectedFee.estimatedFeeInEth).mul(
            multiplier,
          ),
          estimatedFeeUSD: new Decimal(selectedFee.estimatedFeeUSD).mul(
            multiplier,
          ),
          maxFeeInEth: new Decimal(selectedFee.maxFeeInEth).mul(multiplier),
          maxFeeUSD: new Decimal(selectedFee.maxFeeUSD).mul(multiplier),
          maxFeePerGasInGwei: selectedFee.maxFeePerGasInGwei
            ? new Decimal(selectedFee.maxFeePerGasInGwei).mul(multiplier)
            : undefined,
          priorityFeeInGwei: selectedFee.priorityFeeInGwei
            ? new Decimal(selectedFee.priorityFeeInGwei).mul(multiplier)
            : undefined,
        };

        if (
          estimate?.aggressive?.estimatedFeeInEth &&
          estimate.aggressive.estimatedFeeInEth < increasedFee.estimatedFeeInEth
        )
          estimate.aggressive.deactivated = true;
        if (
          estimate?.medium?.estimatedFeeInEth &&
          estimate.medium.estimatedFeeInEth < increasedFee.estimatedFeeInEth
        )
          estimate.medium.deactivated = true;

        onSelectFee(increasedFee);
        estimate.increased = increasedFee;
      } else {
        if (estimate?.suggestedByDApp) {
          onSelectFee(estimate.suggestedByDApp);
        } else if (estimate.suggested) {
          onSelectFee(estimate.suggested);
        } else {
          // No suggested by dapp, no suggested, so we select the custom fee
          onSelectFee(estimate.custom!);
        }
      }

      if (
        estimate.custom &&
        !estimate.suggestedByDApp &&
        !estimate.suggested &&
        !chain.onlyCustomFee
      ) {
        // Backend data not available so we display a warning
        setgasFeeWarning('evm_gas_fee_warning_not_available');
      } else if (chain.onlyCustomFee) {
        setgasFeeWarning('evm_gas_fee_warning_not_available_for_chain');
      }
      setFeeEstimation(estimate);
    } catch (err: any) {
      Logger.error('Catch in gas fee Panel', { err });
      console.log('err', err);
      const error = EthersUtils.getErrorMessage(
        err.code,
        err.reason,
        err.shortMessage,
        err.message,
      );
      setErrorMessage(error);
    }
  };

  const openCustomFeePanel = () => {
    setCustomFeePanelOpened(true);
    setIsAdvancedPanelOpen(true);
  };

  const selectGasFee = (gasFee: GasFeeEstimationBase) => {
    onSelectFee(gasFee);
    setIsAdvancedPanelOpen(false);
  };

  const getDecimalValue = (rawValue?: string) => {
    if (!rawValue?.length) return new Decimal(0);

    try {
      return new Decimal(rawValue);
    } catch {
      return new Decimal(0);
    }
  };

  const getCustomFeeInEth = (gweiValue?: string, gasLimitValue?: string) => {
    return getDecimalValue(gweiValue)
      .mul(getDecimalValue(gasLimitValue))
      .div(EvmFormatUtils.GWEI);
  };

  const updateCustomFee = (
    key: 'maxBaseFee' | 'priorityFee' | 'gasPrice' | 'gasLimit',
    value: string,
  ) => {
    console.log({ key, value });
    const newState = { ...customGasFeeForm };
    switch (key) {
      case 'maxBaseFee': {
        newState.maxBaseFeeInGwei = value;

        // newState.maxBaseFeeInEth = new Decimal()

        newState.maxBaseFeeInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
        console.log({ newState });
        console.log({ maxBaseFeeInEth: newState.maxBaseFeeInEth.toString() });
        break;
      }
      case 'priorityFee': {
        newState.priorityFeeInGwei = value;
        newState.priorityFeeInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
        console.log({ newState });
        console.log({ priorityFeeInEth: newState.priorityFeeInEth.toString() });
        break;
      }
      case 'gasPrice': {
        newState.gasPriceInGwei = value;
        newState.gasPriceInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
        console.log({ newState });
        console.log({ gasPriceInEth: newState.gasPriceInEth.toString() });
        break;
      }
      case 'gasLimit': {
        newState.gasLimit = value;

        if (
          customGasFeeForm.gasPriceInGwei &&
          !isNaN(parseFloat(customGasFeeForm.gasPriceInGwei))
        ) {
          newState.gasPriceInEth = getCustomFeeInEth(
            customGasFeeForm.gasPriceInGwei,
            value,
          );
          console.log({ newState });
          console.log({ gasPriceInEth: newState.gasPriceInEth.toString() });
        }

        if (
          customGasFeeForm.priorityFeeInGwei &&
          !isNaN(parseFloat(customGasFeeForm.priorityFeeInGwei))
        ) {
          newState.priorityFeeInEth = getCustomFeeInEth(
            customGasFeeForm.priorityFeeInGwei,
            value,
          );
          console.log({ newState });
          console.log({
            priorityFeeInEth: newState.priorityFeeInEth.toString(),
          });
        }

        if (
          customGasFeeForm.maxBaseFeeInGwei &&
          !isNaN(parseFloat(customGasFeeForm.maxBaseFeeInGwei))
        ) {
          newState.maxBaseFeeInEth = getCustomFeeInEth(
            customGasFeeForm.maxBaseFeeInGwei,
            value,
          );
          console.log({ newState });
          console.log({ maxBaseFeeInEth: newState.maxBaseFeeInEth.toString() });
        }

        break;
      }
    }

    setCustomGasFeeForm(newState);
  };

  const saveCustomFee = () => {
    try {
      let customMaxFee = new Decimal(0);
      let customEstimatedFee = new Decimal(0);

      switch (transactionType) {
        case EvmTransactionType.EIP_1559: {
          customMaxFee = Decimal.add(
            customGasFeeForm.maxBaseFeeInEth!,
            customGasFeeForm.priorityFeeInEth!,
          );
          if (feeEstimation?.extraInfo) {
            customEstimatedFee = Decimal.add(
              Decimal.div(
                new Decimal(feeEstimation?.extraInfo.baseFee.estimated!),
                EvmFormatUtils.GWEI,
              ),
              customGasFeeForm.priorityFeeInEth!,
            );
          } else customEstimatedFee = customMaxFee;
          break;
        }
        case EvmTransactionType.LEGACY: {
          customMaxFee = customGasFeeForm.gasPriceInEth!;
          break;
        }
      }

      if (customGasFeeForm.priorityFeeInEth?.greaterThan(customMaxFee)) {
        setCustomFeeFormWarning(
          'evm_gas_fee_warning_priority_fee_higher_than_max_fee',
        );
        return;
      }

      if (Number(customGasFeeForm.gasLimit) < 21000) {
        setCustomFeeFormWarning('evm_gas_fee_warning_gas_limit_too_low');
        return;
      }

      let customDuration = new Decimal(-1);
      if (
        feeEstimation?.aggressive?.maxFeeInEth &&
        customMaxFee >= feeEstimation.aggressive.maxFeeInEth
      ) {
        customDuration = feeEstimation.aggressive.estimatedMaxDuration;
      } else if (
        feeEstimation?.medium?.maxFeeInEth &&
        customMaxFee >= feeEstimation.medium.maxFeeInEth
      ) {
        customDuration = feeEstimation.medium.estimatedMaxDuration;
      } else if (
        feeEstimation?.low?.maxFeeInEth &&
        customMaxFee >= feeEstimation.low.maxFeeInEth
      ) {
        customDuration = feeEstimation.low.estimatedMaxDuration;
      }

      const custom: GasFeeEstimationBase = {
        estimatedFeeInEth: customEstimatedFee,
        maxFeeInEth: customMaxFee,
        estimatedMaxDuration: customDuration,
        gasLimit: new Decimal(customGasFeeForm.gasLimit),
        type: customGasFeeForm.type,
        gasPriceInGwei: new Decimal(customGasFeeForm.gasPriceInGwei),
        maxFeePerGasInGwei: new Decimal(customGasFeeForm.maxBaseFeeInGwei).add(
          new Decimal(customGasFeeForm.priorityFeeInGwei),
        ),
        priorityFeeInGwei: new Decimal(customGasFeeForm.priorityFeeInGwei),
        estimatedFeeUSD: customEstimatedFee.mul(new Decimal(mainTokenPrice!)),
        maxFeeUSD: customMaxFee.mul(new Decimal(mainTokenPrice!)),
        name: 'popup_html_evm_custom_gas_fee_custom',
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      } as GasFeeEstimationBase;
      onSelectFee(custom);

      const fullGasFeeEstimation = {
        ...feeEstimation,
        custom: custom,
      };

      setFeeEstimation(fullGasFeeEstimation as FullGasFeeEstimation);
      closeCustomFeePanel();
    } catch (err) {
      console.log('catch in saveCustomFee', { err });
    }
  };

  const getFeeLabel = () => {
    switch (selectedFee?.type) {
      case EvmTransactionType.EIP_1559:
        return 'popup_html_evm_gas_max_fee_label';
      case EvmTransactionType.LEGACY:
        return 'popup_html_evm_transaction_fee';
      default:
        return 'popup_html_evm_gas_max_fee_label';
    }
  };

  const handlePanelOnClick = () => {
    if (isExpandablePanelOpened) {
      setIsAdvancedPanelOpen(true);
    }
    if (
      chain.onlyCustomFee ||
      (feeEstimation &&
        !feeEstimation.suggestedByDApp &&
        !feeEstimation.suggested)
    ) {
      openCustomFeePanel();
    } else {
      setExpandablePanelOpened(true);
    }
    return;
  };

  const closeCustomFeePanel = () => {
    setCustomFeePanelOpened(false);
    setIsAdvancedPanelOpen(false);
  };

  return (
    <>
      {feeEstimation && selectedFee && (
        <div
          className={`gas-fee-panel expandable`}
          onClick={() => handlePanelOnClick()}>
          <div className="title-row">
            <SVGIcon className="gas-fee-settings" icon={selectedFee.icon} />
            <div className="title">
              {chrome.i18n.getMessage('popup_html_evm_gas_fee')} :{' '}
              {chrome.i18n.getMessage(selectedFee.name)}
            </div>
            {!isExpandablePanelOpened && (
              <div className="gas-fee-estimate">
                <div className="gas-fee-value">
                  {!selectedFee.estimatedFeeInEth.equals(-1) ? (
                    <>
                      {FormatUtils.formatCurrencyValue(
                        selectedFee.estimatedFeeInEth.toFixed(),
                        8,
                      )}{' '}
                      {chain.mainToken}
                    </>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="gas-fee-value usd-value">
                  {Number(selectedFee.estimatedFeeUSD.toFixed(2)) === 0
                    ? '~'
                    : ''}{' '}
                  {selectedFee.estimatedFeeUSD.toFixed(2)}
                  {' USD'}
                </div>
              </div>
            )}
            {isExpandablePanelOpened && (
              <SVGIcon
                className="gas-fee-settings"
                icon={SVGIcons.EVM_GAS_FEE_DETAILS}
              />
            )}
            <SVGIcon
              icon={SVGIcons.WALLET_HISTORY_EXPAND_COLLAPSE}
              className={`expand-collapse ${
                isExpandablePanelOpened ? 'open' : 'closed'
              }`}
              onClick={(event) => {
                event.stopPropagation();
                setExpandablePanelOpened(!isExpandablePanelOpened);
              }}
            />
          </div>
          {gasFeeWarning && (
            <div className="gas-fee-warning">
              {chrome.i18n.getMessage(gasFeeWarning)}
            </div>
          )}
          {isExpandablePanelOpened && (
            <div className="details">
              {selectedFee.type !== EvmTransactionType.LEGACY && (
                <>
                  <div className="gas-fee-top-row">
                    <div className="label gas-fee-label">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_gas_fee_estimate_label',
                      )}
                    </div>
                    <div className="label gas-fee">
                      <div>
                        {!selectedFee.estimatedFeeInEth.equals(-1) ? (
                          <>
                            {FormatUtils.formatCurrencyValue(
                              selectedFee.estimatedFeeInEth.toFixed(),
                              8,
                            )}{' '}
                            {chain.mainToken}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                      {!selectedFee.estimatedFeeInEth.equals(-1) &&
                        !!selectedFee.estimatedFeeUSD && (
                          <div className="label usd-value">
                            {selectedFee.estimatedFeeUSD.toFixed(2)}
                            {' USD'}
                          </div>
                        )}
                    </div>
                  </div>
                  <Separator fullSize type="horizontal" />
                </>
              )}

              <div className="gas-fee-top-row">
                <div className="label gas-fee-label">
                  {chrome.i18n.getMessage(getFeeLabel())}
                </div>
                <div className="label gas-fee">
                  <div className="label gas-fee">
                    <div>
                      {!selectedFee.maxFeeInEth.equals(-1) ? (
                        <>
                          {FormatUtils.formatCurrencyValue(
                            selectedFee.maxFeeInEth.toFixed(),
                            8,
                          )}{' '}
                          {chain.mainToken}
                        </>
                      ) : (
                        '-'
                      )}
                    </div>
                    {!selectedFee.maxFeeInEth.equals(-1) &&
                      !!selectedFee.maxFeeUSD && (
                        <div className="label usd-value">
                          {selectedFee.maxFeeUSD.toFixed(2)}
                          {' USD'}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {!selectedFee.estimatedMaxDuration.equals(-1) && (
                <>
                  <Separator fullSize type="horizontal" />
                  <div className="gas-fee-top-row">
                    <div className="label duration">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_gas_fee_estimate_duration_label',
                      )}
                    </div>
                    <div className="label duration">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_gas_fee_estimate_duration',
                        [selectedFee.estimatedMaxDuration.toString()],
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      {isAdvancedPanelOpen && feeEstimation && (
        <PopupContainer
          className="edit-gas-fee-popup"
          children={
            <div className="edit-gas-fee-content">
              <div className="title">
                <span>
                  {chrome.i18n.getMessage('popup_html_evm_edit_gas_fee')}
                </span>
                <SVGIcon
                  icon={SVGIcons.TOP_BAR_CLOSE_BTN}
                  onClick={() => {
                    setIsAdvancedPanelOpen(false);
                    setCustomFeePanelOpened(false);
                  }}
                />
              </div>
              <Separator fullSize type="horizontal" />
              {!isCustomFeePanelOpened && (
                <>
                  {!feeEstimation.increased && feeEstimation.low && (
                    <GasFeePanelItem
                      estimation={feeEstimation.low}
                      icon={SVGIcons.EVM_GAS_FEE_LOW}
                      additionalClass={'low'}
                      onSelectGasFee={() => selectGasFee(feeEstimation.low!)}
                      label={'popup_html_evm_custom_gas_fee_low'}
                    />
                  )}

                  {feeEstimation.increased && (
                    <GasFeePanelItem
                      estimation={feeEstimation.increased}
                      icon={SVGIcons.EVM_GAS_FEE_LOW}
                      additionalClass={'increased'}
                      onSelectGasFee={() =>
                        selectGasFee(feeEstimation.increased!)
                      }
                      label={'popup_html_evm_custom_gas_fee_increased'}
                    />
                  )}

                  {feeEstimation.medium && (
                    <GasFeePanelItem
                      estimation={feeEstimation.medium}
                      icon={SVGIcons.EVM_GAS_FEE_MEDIUM}
                      additionalClass={'medium'}
                      onSelectGasFee={() => selectGasFee(feeEstimation.medium!)}
                      label={'popup_html_evm_custom_gas_fee_medium'}
                    />
                  )}
                  {feeEstimation.aggressive && (
                    <GasFeePanelItem
                      estimation={feeEstimation.aggressive}
                      icon={SVGIcons.EVM_GAS_FEE_HIGH}
                      additionalClass={'aggressive'}
                      onSelectGasFee={() =>
                        selectGasFee(feeEstimation.aggressive!)
                      }
                      label={'popup_html_evm_custom_gas_fee_aggressive'}
                    />
                  )}

                  <Separator type={'horizontal'} fullSize />

                  <div
                    className="custom-fee-row custom"
                    onClick={() => openCustomFeePanel()}>
                    <SVGIcon icon={SVGIcons.EVM_GAS_FEE_CUSTOM} />
                    <div className="label type">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_custom_gas_fee_custom',
                      )}
                    </div>
                    <div className="label duration">
                      {feeEstimation.custom &&
                      !feeEstimation.custom.estimatedMaxDuration.equals(-1)
                        ? chrome.i18n.getMessage(
                            'popup_html_evm_gas_fee_estimate_duration',
                            [
                              feeEstimation.custom.estimatedMaxDuration.toString(),
                            ],
                          )
                        : '-'}
                    </div>
                    <div className="label gas-fee">
                      {feeEstimation.custom &&
                      !feeEstimation.custom.maxFeeInEth.equals(-1)
                        ? FormatUtils.formatCurrencyValue(
                            feeEstimation.custom.maxFeeInEth.toFixed(),
                            8,
                          )
                        : '-'}
                    </div>
                  </div>

                  {feeEstimation.suggestedByDApp && (
                    <>
                      <Separator type={'horizontal'} fullSize />
                      <div
                        className="custom-fee-row suggested-by-dapp"
                        onClick={() => openCustomFeePanel()}>
                        <SVGIcon icon={SVGIcons.EVM_GAS_FEE_SUGGESTED} />
                        <div className="label type">
                          {chrome.i18n.getMessage(
                            'popup_html_evm_suggested_by_dapp_gas_fee_custom',
                          )}
                        </div>
                        <div className="label duration">
                          {feeEstimation.suggestedByDApp &&
                          !feeEstimation.suggestedByDApp.maxFeeInEth.equals(-1)
                            ? chrome.i18n.getMessage(
                                'popup_html_evm_gas_fee_estimate_duration',
                                [
                                  feeEstimation.suggestedByDApp.estimatedMaxDuration.toString(),
                                ],
                              )
                            : '-'}
                        </div>
                        <div className="label gas-fee">
                          {feeEstimation.suggestedByDApp &&
                          !feeEstimation.suggestedByDApp.maxFeeInEth.equals(-1)
                            ? FormatUtils.formatCurrencyValue(
                                feeEstimation.suggestedByDApp.maxFeeInEth.toFixed(),
                                8,
                              )
                            : '-'}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              {isCustomFeePanelOpened && customGasFeeForm && (
                <div className="custom-gas-fee-panel">
                  {customGasFeeForm.type === EvmTransactionType.EIP_1559 && (
                    <>
                      {customFeeFormWarning && (
                        <div className="gas-fee-warning">
                          {chrome.i18n.getMessage(customFeeFormWarning)}
                        </div>
                      )}
                      <div className="base-fee-panel">
                        <InputComponent
                          label="popup_html_evm_gas_fee_form_base_fee"
                          placeholder="popup_html_evm_gas_fee_form_base_fee"
                          type={InputType.NUMBER}
                          value={customGasFeeForm.maxBaseFeeInGwei}
                          onChange={(value) =>
                            updateCustomFee('maxBaseFee', value)
                          }
                          hint={`≈${
                            customGasFeeForm.maxBaseFeeInEth
                              ? customGasFeeForm.maxBaseFeeInEth?.toString()
                              : 0
                          } ${chain.mainToken}`}
                          skipHintTranslation
                        />
                        {feeEstimation.extraInfo && (
                          <div className="data-panel">
                            <div className="data-block">
                              <span className="label">
                                {chrome.i18n.getMessage(
                                  'popup_html_evm_custom_fee_current',
                                )}
                                {': '}
                              </span>
                              <span
                                className={`value ${feeEstimation.extraInfo.trends.baseFee}`}>
                                {feeEstimation.extraInfo.baseFee.estimated}
                              </span>
                            </div>
                            <div className="data-block">
                              <span className="label">
                                {chrome.i18n.getMessage(
                                  'popup_html_evm_custom_fee_latest',
                                )}
                                {': '}
                              </span>
                              <span className={`value`}>
                                {
                                  feeEstimation.extraInfo.baseFee.baseFeeRange
                                    .min
                                }
                                -
                                {
                                  feeEstimation.extraInfo.baseFee.baseFeeRange
                                    .max
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="priority-fee-panel">
                        <InputComponent
                          label="popup_html_evm_gas_fee_form_priority_fee"
                          placeholder="popup_html_evm_gas_fee_form_priority_fee"
                          type={InputType.NUMBER}
                          value={customGasFeeForm.priorityFeeInGwei}
                          onChange={(value) =>
                            updateCustomFee('priorityFee', value)
                          }
                          hint={`≈${
                            customGasFeeForm.priorityFeeInEth
                              ? customGasFeeForm.priorityFeeInEth?.toString()
                              : 0
                          } ${chain.mainToken}`}
                          skipHintTranslation
                        />
                        {feeEstimation.extraInfo && (
                          <div className="data-panel">
                            <div className="data-block">
                              <span className="label">
                                {chrome.i18n.getMessage(
                                  'popup_html_evm_custom_fee_current',
                                )}
                                {': '}
                              </span>
                              <span
                                className={`value ${feeEstimation.extraInfo.trends.priorityFee}`}>
                                {feeEstimation.extraInfo.priorityFee.latest.min}
                                -
                                {feeEstimation.extraInfo.priorityFee.latest.max}
                              </span>
                            </div>
                            <div className="data-block">
                              <span className="label">
                                {chrome.i18n.getMessage(
                                  'popup_html_evm_custom_fee_latest',
                                )}
                                {': '}
                              </span>
                              <span className={`value`}>
                                {
                                  feeEstimation.extraInfo.priorityFee.history
                                    .min
                                }
                                -
                                {
                                  feeEstimation.extraInfo.priorityFee.history
                                    .max
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {customGasFeeForm.type === EvmTransactionType.LEGACY && (
                    <div className="gas-price-panel">
                      <InputComponent
                        label="popup_html_evm_gas_fee_form_gas_price"
                        placeholder="popup_html_evm_gas_fee_form_gas_price"
                        type={InputType.NUMBER}
                        value={new Decimal(
                          customGasFeeForm.gasPriceInGwei,
                        ).toFixed()}
                        onChange={(value) => updateCustomFee('gasPrice', value)}
                        hint={`≈${
                          customGasFeeForm.gasPriceInGwei
                            ? customGasFeeForm.gasPriceInGwei?.toString()
                            : 0
                        } ${chain.mainToken}`}
                        skipHintTranslation
                        step={'any'}
                      />
                    </div>
                  )}
                  <div className="priority-fee-panel">
                    <InputComponent
                      label="popup_html_evm_gas_fee_form_gas_limit"
                      placeholder="popup_html_evm_gas_fee_form_gas_limit"
                      type={InputType.NUMBER}
                      value={customGasFeeForm.gasLimit}
                      onChange={(value) => updateCustomFee('gasLimit', value)}
                      skipHintTranslation
                      step={1}
                    />
                  </div>
                  <div className="button-panel">
                    <ButtonComponent
                      type={ButtonType.ALTERNATIVE}
                      height="small"
                      label="popup_html_button_label_cancel"
                      onClick={() => closeCustomFeePanel()}
                    />
                    <ButtonComponent
                      height="small"
                      label="popup_html_operation_button_save"
                      onClick={saveCustomFee}
                    />
                  </div>
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  );
};

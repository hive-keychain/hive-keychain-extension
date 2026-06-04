import { EtherRPCCustomError } from '@popup/evm/interfaces/evm-errors.interface';
import { EvmSmartContractInfo } from '@popup/evm/interfaces/evm-tokens.interface';
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
import EventEmitter from 'events';
import React, { useEffect, useRef, useState } from 'react';
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

import { I18nUtils } from 'src/utils/i18n.utils';
interface GasFeePanelProps {
  chain: EvmChain;
  fromAddress: string;
  /** When set (e.g. send-tx dialog pre-fetched native metadata), skips duplicate native/light-node fetch */
  prefetchedMainTokenInfo?: EvmSmartContractInfo;
  selectedFee?: GasFeeEstimationBase;
  onSelectFee: (fee: GasFeeEstimationBase) => void;
  multiplier?: number;
  transactionType: EvmTransactionType;
  transactionData?: ProviderTransactionData;
  forceOpenGasFeePanelEvent?: EventEmitter;
  setErrorMessage: (error: EtherRPCCustomError) => void;
  /** Fires when the initial gas estimate request finishes (success or error). */
  onInitialEstimationComplete?: () => void;
  /** Re-runs gas estimation while preserving visible values. */
  refreshKey?: string | number;
  onRefreshStateChange?: (refreshing: boolean) => void;
  isActive?: boolean;
  defaultFeeLevel?: 'low' | 'medium' | 'aggressive';
}

export const GasFeePanel = ({
  chain,
  fromAddress,
  prefetchedMainTokenInfo,
  selectedFee,
  onSelectFee,
  multiplier,
  transactionType,
  transactionData,
  forceOpenGasFeePanelEvent,
  setErrorMessage,
  onInitialEstimationComplete,
  refreshKey,
  onRefreshStateChange,
  isActive = true,
  defaultFeeLevel,
}: GasFeePanelProps) => {
  const initGenerationRef = useRef(0);
  const lastRefreshKeyRef = useRef<string | number>();
  const customFeeWasSavedRef = useRef(false);
  const latestIsActiveRef = useRef(isActive);
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();
  const [isRefreshing, setRefreshing] = useState(false);

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
    latestIsActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const handler = () => {
      openCustomFeePanel();
    };
    forceOpenGasFeePanelEvent?.addListener('forceOpenCustomFeePanel', handler);
    return () => {
      forceOpenGasFeePanelEvent?.removeListener(
        'forceOpenCustomFeePanel',
        handler,
      );
    };
  }, [forceOpenGasFeePanelEvent]);

  useEffect(() => {
    if (transactionData) void init(false);
  }, [transactionData]);

  useEffect(() => {
    if (
      !transactionData ||
      refreshKey === undefined ||
      lastRefreshKeyRef.current === refreshKey
    ) {
      return;
    }
    lastRefreshKeyRef.current = refreshKey;
    void init(true);
  }, [refreshKey]);

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

        gasPriceInEth: gasLimit.mul(gasPriceInGwei).div(1e9),
        priorityFeeInEth: gasLimit.mul(priorityFeeInGwei).div(1e9),
        maxBaseFeeInEth: gasLimit.mul(maxBaseFeeInGwei).div(1e9),
      });
    }
  }, [selectedFee]);

  const getInitialFeeSelection = (estimate: FullGasFeeEstimation) => {
    if (defaultFeeLevel && estimate[defaultFeeLevel]) {
      return estimate[defaultFeeLevel];
    }
    if (estimate.suggestedByDApp) {
      return estimate.suggestedByDApp;
    }
    if (estimate.suggested) {
      return estimate.suggested;
    }
    return estimate.custom;
  };

  const multiplyDecimal = (value: Decimal | undefined, multiplier: number) => {
    return value ? new Decimal(value).mul(multiplier) : undefined;
  };

  const getFeeComparisonValue = (fee: GasFeeEstimationBase) => {
    return fee.maxFeePerGasInGwei ?? fee.gasPriceInGwei ?? fee.maxFeeInEth;
  };

  const isAtLeastMultiplierAboveCurrent = (
    fee: GasFeeEstimationBase | undefined,
    currentFee: GasFeeEstimationBase,
    multiplier: number,
  ) => {
    const feeValue = fee ? getFeeComparisonValue(fee) : undefined;
    const currentValue = getFeeComparisonValue(currentFee);

    return (
      !!feeValue && feeValue.greaterThanOrEqualTo(currentValue.mul(multiplier))
    );
  };

  const getMultipliedCustomFee = (
    currentFee: GasFeeEstimationBase,
    multiplier: number,
  ): GasFeeEstimationBase => {
    return {
      ...currentFee,
      estimatedFeeInEth: new Decimal(currentFee.estimatedFeeInEth).mul(
        multiplier,
      ),
      estimatedFeeUSD: new Decimal(currentFee.estimatedFeeUSD).mul(multiplier),
      maxFeeInEth: new Decimal(currentFee.maxFeeInEth).mul(multiplier),
      maxFeeUSD: new Decimal(currentFee.maxFeeUSD).mul(multiplier),
      baseFeePerGasInGwei: multiplyDecimal(
        currentFee.baseFeePerGasInGwei,
        multiplier,
      ),
      gasPriceInGwei: multiplyDecimal(currentFee.gasPriceInGwei, multiplier),
      maxFeePerGasInGwei: multiplyDecimal(
        currentFee.maxFeePerGasInGwei,
        multiplier,
      ),
      priorityFeeInGwei: multiplyDecimal(
        currentFee.priorityFeeInGwei,
        multiplier,
      ),
      icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      name: 'popup_html_evm_custom_gas_fee_custom',
    };
  };

  const buildFallbackCustomFee = (): GasFeeEstimationBase => {
    const fallbackGasLimit = Number(transactionData?.gasLimit ?? 21000);
    return {
      type: transactionType,
      estimatedFeeInEth: new Decimal(0),
      maxFeeInEth: new Decimal(0),
      estimatedFeeUSD: new Decimal(0),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(0),
      gasLimit: new Decimal(fallbackGasLimit),
      priorityFeeInGwei: new Decimal(0),
      maxFeePerGasInGwei: new Decimal(0),
      gasPriceInGwei: new Decimal(0),
      icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      name: 'popup_html_evm_custom_gas_fee_custom',
    };
  };

  const init = async (silentRefresh: boolean) => {
    const generation = ++initGenerationRef.current;
    let estimate;
    const shouldShowRefreshIndicator =
      silentRefresh && !!feeEstimation && !!selectedFee;
    if (shouldShowRefreshIndicator) {
      setRefreshing(true);
      onRefreshStateChange?.(true);
    }

    try {
      const mainTokenInfo =
        prefetchedMainTokenInfo ??
        (await EvmTokensUtils.getMainTokenInfo(chain as EvmChain));
      setMainTokenPrice(mainTokenInfo.priceUsd ?? undefined);

      estimate = await GasFeeUtils.estimate(
        chain,
        fromAddress,
        transactionType,
        mainTokenInfo.priceUsd ?? 0,
        transactionData?.gasLimit
          ? Number(transactionData.gasLimit)
          : undefined,
        transactionData,
      );

      if (silentRefresh && !latestIsActiveRef.current) {
        return;
      }

      if (!!multiplier && selectedFee) {
        const multipliedCustomFee = getMultipliedCustomFee(
          selectedFee,
          multiplier,
        );
        const preferredFee = defaultFeeLevel
          ? estimate[defaultFeeLevel]
          : undefined;

        if (
          isAtLeastMultiplierAboveCurrent(preferredFee, selectedFee, multiplier)
        ) {
          onSelectFee(preferredFee!);
        } else {
          estimate.custom = multipliedCustomFee;
          onSelectFee(multipliedCustomFee);
        }
      } else if (!customFeeWasSavedRef.current) {
        onSelectFee(getInitialFeeSelection(estimate)!);
      }

      if (
        estimate.custom &&
        !estimate.suggestedByDApp &&
        !estimate.suggested &&
        !chain.onlyCustomFee &&
        !chain.isCustom
      ) {
        // Backend data not available so we display a warning
        setgasFeeWarning('evm_gas_fee_warning_not_available');
      } else if (chain.onlyCustomFee || chain.isCustom) {
        setgasFeeWarning('evm_gas_fee_warning_not_available_for_chain');
      }
      setFeeEstimation(estimate);
    } catch (err: any) {
      Logger.error('Catch in gas fee Panel', { err });
      const fallbackCustomFee = buildFallbackCustomFee();
      setFeeEstimation({ custom: fallbackCustomFee });
      onSelectFee(fallbackCustomFee);
      setgasFeeWarning('evm_gas_fee_warning_not_available_for_chain');

      const error = EthersUtils.getErrorMessage(
        err.code,
        err.reason,
        err.shortMessage,
        err.message,
      );
      // console.log('error', error.message);
      // forceOpenGasFeePanelEvent?.emit('forceOpenCustomFeePanel');
      // if (
      //   error.message !==
      //   'evm_transaction_result_error_message_insufficient_funds'
      // ) {
      //   // setErrorMessage(error);
      //   // setErrorMessage({
      //   //   message: 'evm_error_gas_estimate',
      //   // } as EtherRPCCustomError);

      // }
    } finally {
      if (generation === initGenerationRef.current) {
        onInitialEstimationComplete?.();
        if (shouldShowRefreshIndicator) {
          setRefreshing(false);
          onRefreshStateChange?.(false);
        }
      }
    }
  };

  const openCustomFeePanel = () => {
    setCustomFeePanelOpened(true);
    setIsAdvancedPanelOpen(true);
  };

  const selectGasFee = (gasFee: GasFeeEstimationBase) => {
    customFeeWasSavedRef.current = false;
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
    const newState = { ...customGasFeeForm };
    switch (key) {
      case 'maxBaseFee': {
        newState.maxBaseFeeInGwei = value;

        // newState.maxBaseFeeInEth = new Decimal()

        newState.maxBaseFeeInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
        break;
      }
      case 'priorityFee': {
        newState.priorityFeeInGwei = value;
        newState.priorityFeeInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
        break;
      }
      case 'gasPrice': {
        newState.gasPriceInGwei = value;
        newState.gasPriceInEth = getCustomFeeInEth(
          value,
          customGasFeeForm.gasLimit,
        );
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
        }

        if (
          customGasFeeForm.priorityFeeInGwei &&
          !isNaN(parseFloat(customGasFeeForm.priorityFeeInGwei))
        ) {
          newState.priorityFeeInEth = getCustomFeeInEth(
            customGasFeeForm.priorityFeeInGwei,
            value,
          );
        }

        if (
          customGasFeeForm.maxBaseFeeInGwei &&
          !isNaN(parseFloat(customGasFeeForm.maxBaseFeeInGwei))
        ) {
          newState.maxBaseFeeInEth = getCustomFeeInEth(
            customGasFeeForm.maxBaseFeeInGwei,
            value,
          );
        }

        break;
      }
    }

    setCustomGasFeeForm(newState);
  };

  const saveCustomFee = () => {
    try {
      const gasLimit = getDecimalValue(customGasFeeForm.gasLimit);
      const gasPriceInGwei = getDecimalValue(customGasFeeForm.gasPriceInGwei);
      const maxBaseFeeInGwei = getDecimalValue(
        customGasFeeForm.maxBaseFeeInGwei,
      );
      const priorityFeeInGwei = getDecimalValue(
        customGasFeeForm.priorityFeeInGwei,
      );
      const maxBaseFeeInEth = getCustomFeeInEth(
        customGasFeeForm.maxBaseFeeInGwei,
        customGasFeeForm.gasLimit,
      );
      const priorityFeeInEth = getCustomFeeInEth(
        customGasFeeForm.priorityFeeInGwei,
        customGasFeeForm.gasLimit,
      );
      const gasPriceInEth = getCustomFeeInEth(
        customGasFeeForm.gasPriceInGwei,
        customGasFeeForm.gasLimit,
      );
      const price = new Decimal(mainTokenPrice ?? 0);
      let customMaxFee = new Decimal(0);
      let customEstimatedFee = new Decimal(0);

      switch (transactionType) {
        case EvmTransactionType.EIP_1559: {
          customMaxFee = Decimal.add(maxBaseFeeInEth, priorityFeeInEth);
          if (feeEstimation?.extraInfo) {
            customEstimatedFee = Decimal.add(
              Decimal.div(
                new Decimal(feeEstimation?.extraInfo.baseFee.estimated!),
                EvmFormatUtils.GWEI,
              ),
              priorityFeeInEth,
            );
          } else customEstimatedFee = customMaxFee;
          break;
        }
        case EvmTransactionType.LEGACY: {
          customMaxFee = gasPriceInEth;
          customEstimatedFee = customMaxFee;
          break;
        }
      }

      if (priorityFeeInEth.greaterThan(customMaxFee)) {
        setCustomFeeFormWarning(
          'evm_gas_fee_warning_priority_fee_higher_than_max_fee',
        );
        return;
      }

      if (Number(customGasFeeForm.gasLimit) < 21000) {
        setCustomFeeFormWarning('evm_gas_fee_warning_gas_limit_too_low');
        return;
      }

      let customDuration = new Decimal(0);
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

      const customFeeCandidate = {
        estimatedFeeInEth: customEstimatedFee,
        maxFeeInEth: customMaxFee,
        estimatedMaxDuration: customDuration,
        gasLimit,
        type: customGasFeeForm.type ?? transactionType,
        gasPriceInGwei,
        maxFeePerGasInGwei: maxBaseFeeInGwei.add(priorityFeeInGwei),
        priorityFeeInGwei,
        estimatedFeeUSD: customEstimatedFee.mul(price),
        maxFeeUSD: customMaxFee.mul(price),
        name: 'popup_html_evm_custom_gas_fee_custom',
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
      } as GasFeeEstimationBase;

      if (GasFeeUtils.isGasFeeEstimateInvalid(customFeeCandidate)) {
        setCustomFeeFormWarning('evm_gas_fee_warning_not_available_for_chain');
        return;
      }

      const custom: GasFeeEstimationBase = customFeeCandidate;
      customFeeWasSavedRef.current = true;
      onSelectFee(custom);

      const fullGasFeeEstimation = {
        ...feeEstimation,
        custom: custom,
      };

      setFeeEstimation(fullGasFeeEstimation as FullGasFeeEstimation);
      closeCustomFeePanel();
    } catch (_err) {
      // Custom fee validation failed; keep the panel open for correction.
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
      chain.isCustom ||
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
              {I18nUtils.getMessage('popup_html_evm_gas_fee')} :{' '}
              {I18nUtils.getMessage(selectedFee.name)}
              {isRefreshing && (
                <span
                  className="gas-fee-refresh-spinner"
                  data-testid="gas-fee-refresh-spinner"
                />
              )}
            </div>
            {!isExpandablePanelOpened && (
              <div className="gas-fee-estimate">
                <div className="gas-fee-value">
                  {GasFeeUtils.hasDisplayableEstimatedFee(selectedFee) ? (
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
              {I18nUtils.getMessage(gasFeeWarning)}
            </div>
          )}
          {isExpandablePanelOpened && (
            <div className="details">
              {selectedFee.type !== EvmTransactionType.LEGACY && (
                <>
                  <div className="gas-fee-top-row">
                    <div className="label gas-fee-label">
                      {I18nUtils.getMessage(
                        'popup_html_evm_gas_fee_estimate_label',
                      )}
                    </div>
                    <div className="label gas-fee">
                      <div>
                        {GasFeeUtils.hasDisplayableEstimatedFee(selectedFee) ? (
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
                      {GasFeeUtils.hasDisplayableEstimatedFee(selectedFee) &&
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
                  {I18nUtils.getMessage(getFeeLabel())}
                </div>
                <div className="label gas-fee">
                  <div className="label gas-fee">
                    <div>
                      {GasFeeUtils.hasDisplayableMaxFee(selectedFee) ? (
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
                    {GasFeeUtils.hasDisplayableMaxFee(selectedFee) &&
                      !!selectedFee.maxFeeUSD && (
                        <div className="label usd-value">
                          {selectedFee.maxFeeUSD.toFixed(2)}
                          {' USD'}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {GasFeeUtils.hasDisplayableDuration(selectedFee) && (
                <>
                  <Separator fullSize type="horizontal" />
                  <div className="gas-fee-top-row">
                    <div className="label duration">
                      {I18nUtils.getMessage(
                        'popup_html_evm_gas_fee_estimate_duration_label',
                      )}
                    </div>
                    <div className="label duration">
                      {I18nUtils.getMessage(
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
          useBodyPortal
          className="edit-gas-fee-popup"
          children={
            <div className="edit-gas-fee-content">
              <div className="title">
                <span>
                  {I18nUtils.getMessage('popup_html_evm_edit_gas_fee')}
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
                      {I18nUtils.getMessage(
                        'popup_html_evm_custom_gas_fee_custom',
                      )}
                    </div>
                    <div className="label duration">
                      {feeEstimation.custom &&
                      GasFeeUtils.hasDisplayableDuration(feeEstimation.custom)
                        ? I18nUtils.getMessage(
                            'popup_html_evm_gas_fee_estimate_duration',
                            [
                              feeEstimation.custom.estimatedMaxDuration.toString(),
                            ],
                          )
                        : '-'}
                    </div>
                    <div className="label gas-fee">
                      {feeEstimation.custom &&
                      GasFeeUtils.hasDisplayableMaxFee(feeEstimation.custom)
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
                          {I18nUtils.getMessage(
                            'popup_html_evm_suggested_by_dapp_gas_fee_custom',
                          )}
                        </div>
                        <div className="label duration">
                          {feeEstimation.suggestedByDApp &&
                          GasFeeUtils.hasDisplayableMaxFee(
                            feeEstimation.suggestedByDApp,
                          )
                            ? I18nUtils.getMessage(
                                'popup_html_evm_gas_fee_estimate_duration',
                                [
                                  feeEstimation.suggestedByDApp.estimatedMaxDuration.toString(),
                                ],
                              )
                            : '-'}
                        </div>
                        <div className="label gas-fee">
                          {feeEstimation.suggestedByDApp &&
                          GasFeeUtils.hasDisplayableMaxFee(
                            feeEstimation.suggestedByDApp,
                          )
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
                          {I18nUtils.getMessage(customFeeFormWarning)}
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
                                {I18nUtils.getMessage(
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
                                {I18nUtils.getMessage(
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
                                {I18nUtils.getMessage(
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
                                {I18nUtils.getMessage(
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
                        value={customGasFeeForm.gasPriceInGwei}
                        onChange={(value) => updateCustomFee('gasPrice', value)}
                        hint={`≈${
                          customGasFeeForm.gasPriceInEth
                            ? customGasFeeForm.gasPriceInEth?.toString()
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

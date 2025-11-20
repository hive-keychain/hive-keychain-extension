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
import { EvmPrices } from '@popup/evm/reducers/prices.reducer';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
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

interface GasFeePanelProps {
  chain: EvmChain;
  tokenInfo?: EvmSmartContractInfo;
  wallet: HDNodeWallet;
  selectedFee?: GasFeeEstimationBase;
  onSelectFee: (fee: GasFeeEstimationBase) => void;
  multiplier?: number;
  transactionType: EvmTransactionType;
  transactionData?: ProviderTransactionData;
  prices: EvmPrices;
  forceOpenGasFeePanelEvent?: EventEmitter;
  setErrorMessage: (error: EtherRPCCustomError) => void;
}

export const GasFeePanel = ({
  chain,
  tokenInfo,
  wallet,
  selectedFee,
  onSelectFee,
  multiplier,
  transactionType,
  transactionData,
  prices,
  forceOpenGasFeePanelEvent,
  setErrorMessage,
}: GasFeePanelProps) => {
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();

  const [customFeeWarning, setCustomFeeWarning] = useState<string>();

  const [isCustomFeePanelOpened, setCustomFeePanelOpened] =
    useState<boolean>(false);
  const [customGasFeeForm, setCustomGasFeeForm] = useState<CustomGasFeeForm>({
    gasLimit: '0',
    maxBaseFeeInGwei: '0',
    priorityFeeInGwei: '0',
    gasPriceInGwei: '0',
    type: transactionType,
  });

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
      console.log('selectedFee', {
        gasLimit: selectedFee.gasLimit.toFixed(),
        gasPrice: selectedFee.gasPrice?.toFixed(),
        maxFeePerGas: selectedFee.maxFeePerGas?.toFixed(),
        priorityFee: selectedFee.priorityFee?.toFixed(),
        maxFee: selectedFee.maxFee.toFixed(),
        estimatedFee: selectedFee.estimatedFee.toFixed(),
        estimatedFeeUSD: selectedFee.estimatedFeeUSD.toFixed(),
        estimatedMaxDuration: selectedFee.estimatedMaxDuration.toFixed(),
        name: selectedFee.name,
        icon: selectedFee.icon,
        type: selectedFee.type,
      });
      const gasLimit = new Decimal(selectedFee.gasLimit ?? 0);
      const gasPriceInGwei = new Decimal(selectedFee?.gasPrice ?? 0);
      const maxBaseFeeInGwei = new Decimal(selectedFee?.maxFeePerGas ?? 0).sub(
        new Decimal(selectedFee?.priorityFee ?? 0),
      );
      const priorityFeeInGwei = new Decimal(selectedFee.priorityFee ?? 0);
      setCustomGasFeeForm({
        gasLimit: gasLimit.toFixed(),
        type: transactionType,
        gasPriceInGwei: gasPriceInGwei.toFixed(),
        maxBaseFeeInGwei: maxBaseFeeInGwei.toFixed(),
        priorityFeeInGwei: priorityFeeInGwei.toFixed(),

        gasPriceInEth: new Decimal(
          ethers.formatUnits(gasLimit.toNumber(), 'gwei'),
        ).mul(gasPriceInGwei),
        priorityFeeInEth: new Decimal(
          ethers.formatUnits(gasLimit.toNumber(), 'gwei'),
        ).mul(priorityFeeInGwei),
        maxBaseFeeInEth: new Decimal(
          ethers.formatUnits(gasLimit.toNumber(), 'gwei'),
        ).mul(maxBaseFeeInGwei),
      });
    }
  }, [selectedFee]);

  const init = async () => {
    let estimate;
    console.log('init gas fee panel');
    try {
      estimate = await GasFeeUtils.estimate(
        chain,
        wallet,
        transactionType,
        prices,
        undefined,
        transactionData,
      );

      console.log(
        {
          low: {
            estimatedFee: estimate?.low?.estimatedFee?.toFixed(),
            estimatedFeeUSD: estimate?.low?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.low?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.low?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.low?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.low?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.low?.priorityFee?.toFixed(),
          },
          medium: {
            estimatedFee: estimate?.medium?.estimatedFee?.toFixed(),
            estimatedFeeUSD: estimate?.medium?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.medium?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.medium?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.medium?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.medium?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.medium?.priorityFee?.toFixed(),
          },
          aggressive: {
            estimatedFee: estimate?.aggressive?.estimatedFee?.toFixed(),
            estimatedFeeUSD: estimate?.aggressive?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.aggressive?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.aggressive?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.aggressive?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.aggressive?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.aggressive?.priorityFee?.toFixed(),
          },
          suggested: {
            estimatedFee: estimate?.suggested?.estimatedFee?.toFixed(),
            estimatedFeeUSD: estimate?.suggested?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.suggested?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.suggested?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.suggested?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.suggested?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.suggested?.priorityFee?.toFixed(),
          },
          custom: {
            estimatedFee: estimate?.custom?.estimatedFee?.toFixed(),
            estimatedFeeUSD: estimate?.custom?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.custom?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.custom?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.custom?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.custom?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.custom?.priorityFee?.toFixed(),
          },
          suggestedByDApp: {
            estimatedFee: estimate?.suggestedByDApp?.estimatedFee?.toFixed(),
            estimatedFeeUSD:
              estimate?.suggestedByDApp?.estimatedFeeUSD?.toFixed(),
            estimatedMaxDuration:
              estimate?.suggestedByDApp?.estimatedMaxDuration?.toFixed(),
            maxFee: estimate?.suggestedByDApp?.maxFee?.toFixed(),
            maxFeeUSD: estimate?.suggestedByDApp?.maxFeeUSD?.toFixed(),
            maxFeePerGas: estimate?.suggestedByDApp?.maxFeePerGas?.toFixed(),
            priorityFee: estimate?.suggestedByDApp?.priorityFee?.toFixed(),
          },
        },
        'in init',
      );

      if (!!multiplier && selectedFee) {
        const increasedFee: GasFeeEstimationBase = {
          ...selectedFee,
          estimatedFee: new Decimal(selectedFee.estimatedFee).mul(multiplier),
          estimatedFeeUSD: new Decimal(selectedFee.estimatedFeeUSD).mul(
            multiplier,
          ),
          maxFee: new Decimal(selectedFee.maxFee).mul(multiplier),
          maxFeeUSD: new Decimal(selectedFee.maxFeeUSD).mul(multiplier),
          maxFeePerGas: selectedFee.maxFeePerGas
            ? new Decimal(selectedFee.maxFeePerGas).mul(multiplier)
            : undefined,
          priorityFee: selectedFee.priorityFee
            ? new Decimal(selectedFee.priorityFee).mul(multiplier)
            : undefined,
        };

        // switch (transactionType) {
        //   case EvmTransactionType.EIP_1559: {
        //     increasedFee.estimatedFee = new Decimal(increasedFee.gasLimit)
        //       .mul(new Decimal(increasedFee.maxFeePerGas!))
        //       .div(EvmFormatUtils.GWEI);
        //     break;
        //   }
        //   case EvmTransactionType.LEGACY: {
        //     increasedFee.estimatedFee = new Decimal(increasedFee.gasLimit)
        //       .mul(new Decimal(increasedFee.gasPrice!))
        //       .div(EvmFormatUtils.GWEI);
        //     break;
        //   }
        // }

        if (
          estimate?.aggressive?.estimatedFee &&
          estimate.aggressive.estimatedFee < increasedFee.estimatedFee
        )
          estimate.aggressive.deactivated = true;
        if (
          estimate?.medium?.estimatedFee &&
          estimate.medium.estimatedFee < increasedFee.estimatedFee
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
        setCustomFeeWarning('evm_gas_fee_warning_not_available');
      } else if (chain.onlyCustomFee) {
        setCustomFeeWarning('evm_gas_fee_warning_not_available_for_chain');
      }
      setFeeEstimation(estimate);
    } catch (err: any) {
      console.log('Catch in gas fee Panel', { err });
      const error = EthersUtils.getErrorMessage(err.code, err.reason);
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

  const updateCustomFee = (
    key: 'maxBaseFee' | 'priorityFee' | 'gasPrice' | 'gasLimit',
    value: string,
  ) => {
    const valueNumber = value.length > 0 ? new Decimal(value) : new Decimal(0);

    const newState = { ...customGasFeeForm };
    switch (key) {
      case 'maxBaseFee': {
        newState.maxBaseFeeInGwei = value;
        newState.maxBaseFeeInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm.gasLimit!).toNumber(),
            'gwei',
          ),
        );
        break;
      }
      case 'priorityFee': {
        newState.priorityFeeInGwei = value;
        newState.priorityFeeInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm.gasLimit!).toNumber(),
            'gwei',
          ),
        );
        break;
      }
      case 'gasPrice': {
        newState.gasPriceInGwei = value;
        newState.gasPriceInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm.gasLimit!).toNumber(),
            'gwei',
          ),
        );
        break;
      }
      case 'gasLimit': {
        newState.gasLimit = value;

        newState.gasPriceInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm?.gasPriceInGwei!).toNumber(),
            'gwei',
          ),
        );
        newState.priorityFeeInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm?.priorityFeeInGwei!).toNumber(),
            'gwei',
          ),
        );
        newState.maxBaseFeeInEth = new Decimal(
          ethers.formatUnits(
            valueNumber.mul(customGasFeeForm.maxBaseFeeInGwei!).toNumber(),
            'gwei',
          ),
        );

        break;
      }
    }

    setCustomGasFeeForm(newState);
  };

  const saveCustomFee = () => {
    try {
      let customMaxFee = new Decimal(0);
      let customEstimatedFee = new Decimal(0);

      if (
        customGasFeeForm.priorityFeeInGwei > customGasFeeForm.maxBaseFeeInGwei
      ) {
        setCustomFeeWarning(
          'evm_gas_fee_warning_priority_fee_higher_than_max_fee',
        );
        return;
      }

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

      let customDuration = new Decimal(-1);
      if (
        feeEstimation?.aggressive?.maxFee &&
        customMaxFee >= feeEstimation.aggressive.maxFee
      ) {
        customDuration = feeEstimation.aggressive.estimatedMaxDuration;
      } else if (
        feeEstimation?.medium?.maxFee &&
        customMaxFee >= feeEstimation.medium.maxFee
      ) {
        customDuration = feeEstimation.medium.estimatedMaxDuration;
      } else if (
        feeEstimation?.low?.maxFee &&
        customMaxFee >= feeEstimation.low.maxFee
      ) {
        customDuration = feeEstimation.low.estimatedMaxDuration;
      }

      const custom: GasFeeEstimationBase = {
        estimatedFee: customEstimatedFee,
        maxFee: customMaxFee,
        estimatedMaxDuration: customDuration,
        gasLimit: new Decimal(customGasFeeForm.gasLimit),
        type: customGasFeeForm.type,
        gasPrice: EvmFormatUtils.gweiToWei(
          new Decimal(customGasFeeForm.gasPriceInGwei),
        ),
        maxFeePerGas: EvmFormatUtils.gweiToWei(
          new Decimal(customGasFeeForm.maxBaseFeeInGwei),
        ),
        priorityFee: EvmFormatUtils.gweiToWei(
          new Decimal(customGasFeeForm.priorityFeeInGwei),
        ),
        estimatedFeeUSD: customEstimatedFee.mul(
          new Decimal(prices[chain.mainToken.toLowerCase()]?.usd ?? 0),
        ),
        maxFeeUSD: customMaxFee.mul(
          new Decimal(prices[chain.mainToken.toLowerCase()]?.usd ?? 0),
        ),
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
      console.log(err);
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
    setIsAdvancedPanelOpen(true);
    if (
      chain.onlyCustomFee ||
      (feeEstimation &&
        !feeEstimation.suggestedByDApp &&
        !feeEstimation.suggested)
    ) {
      openCustomFeePanel();
    }
  };

  const closeCustomFeePanel = () => {
    setCustomFeePanelOpened(false);
    setIsAdvancedPanelOpen(false);
  };

  return (
    <>
      {feeEstimation && selectedFee && (
        <div className="gas-fee-panel" onClick={() => handlePanelOnClick()}>
          <div className="title-row">
            <SVGIcon className="gas-fee-settings" icon={selectedFee.icon} />
            <div className="title">
              {chrome.i18n.getMessage('popup_html_evm_gas_fee')} :{' '}
              {chrome.i18n.getMessage(selectedFee.name)}
            </div>
            <SVGIcon
              className="gas-fee-settings"
              icon={SVGIcons.EVM_GAS_FEE_DETAILS}
            />
          </div>
          {customFeeWarning && (
            <div className="gas-fee-warning">
              {chrome.i18n.getMessage(customFeeWarning)}
            </div>
          )}
          <div className="details">
            {selectedFee.type !== EvmTransactionType.LEGACY && (
              <div className="gas-fee-top-row">
                <div className="label gas-fee-label">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_gas_fee_estimate_label',
                  )}
                </div>
                <div className="label gas-fee">
                  <div>
                    {!selectedFee.estimatedFee.equals(-1) ? (
                      <>
                        {FormatUtils.formatCurrencyValue(
                          selectedFee.estimatedFee.toFixed(),
                          8,
                        )}{' '}
                        {chain.mainToken}
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                  {!selectedFee.estimatedFee.equals(-1) &&
                    !!selectedFee.estimatedFeeUSD && (
                      <div className="label usd-value">
                        {selectedFee.estimatedFeeUSD.toFixed(2)}
                        {' USD'}
                      </div>
                    )}
                </div>
              </div>
            )}

            <div className="gas-fee-top-row">
              <div className="label gas-fee-label">
                {chrome.i18n.getMessage(getFeeLabel())}
              </div>
              <div className="label gas-fee">
                <div className="label gas-fee">
                  <div>
                    {!selectedFee.maxFee.equals(-1) ? (
                      <>
                        {FormatUtils.formatCurrencyValue(
                          selectedFee.maxFee.toFixed(),
                          8,
                        )}{' '}
                        {chain.mainToken}
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                  {!selectedFee.maxFee.equals(-1) &&
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
            )}
          </div>
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
                      !feeEstimation.custom.maxFee.equals(-1)
                        ? FormatUtils.formatCurrencyValue(
                            feeEstimation.custom.maxFee.toFixed(),
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
                          !feeEstimation.suggestedByDApp.maxFee.equals(-1)
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
                          !feeEstimation.suggestedByDApp.maxFee.equals(-1)
                            ? FormatUtils.formatCurrencyValue(
                                feeEstimation.suggestedByDApp.maxFee.toFixed(),
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
                      {customFeeWarning && (
                        <div className="gas-fee-warning">
                          {chrome.i18n.getMessage(customFeeWarning)}
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

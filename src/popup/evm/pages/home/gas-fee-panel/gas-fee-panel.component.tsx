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
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import { HDNodeWallet } from 'ethers';
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
import { MathUtils } from 'src/utils/math.utils';

interface GasFeePanelProps {
  chain: EvmChain;
  tokenInfo?: EvmSmartContractInfo;
  wallet: HDNodeWallet;
  selectedFee?: GasFeeEstimationBase;
  onSelectFee: (fee: GasFeeEstimationBase) => void;
  multiplier?: number;
  transactionType: EvmTransactionType;
  transactionData?: ProviderTransactionData;
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
}: GasFeePanelProps) => {
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();

  const [isCustomFeePanelOpened, setCustomFeePanelOpened] =
    useState<boolean>(false);
  const [customGasFeeForm, setCustomGasFeeForm] = useState<CustomGasFeeForm>({
    gasLimit: 0,
    maxBaseFeeInGwei: 0,
    priorityFeeInGwei: 0,
    gasPriceInGwei: 0,
    type: transactionType,
  });

  useEffect(() => {
    if (transactionData) init();
  }, [transactionData]);

  useEffect(() => {
    if (
      selectedFee &&
      selectedFee.name !== 'popup_html_evm_custom_gas_fee_custom'
    ) {
      const gasLimit = selectedFee.gasLimit ?? 0;
      const gasPriceInGwei = selectedFee?.gasPrice ?? 0;
      const maxBaseFeeInGwei =
        (selectedFee?.maxFeePerGas ?? 0) - (selectedFee?.priorityFee ?? 0);
      const priorityFeeInGwei = selectedFee.priorityFee ?? 0;

      setCustomGasFeeForm({
        gasLimit: selectedFee.gasLimit ?? 0,
        type: transactionType,
        gasPriceInGwei: gasPriceInGwei,
        maxBaseFeeInGwei: maxBaseFeeInGwei,
        priorityFeeInGwei: priorityFeeInGwei,
        gasPriceValue: EvmFormatUtils.etherToGwei(
          Number(gasLimit) * gasPriceInGwei,
        ),
        priorityFeeValue: EvmFormatUtils.etherToGwei(
          Number(gasLimit) * priorityFeeInGwei,
        ),
        maxBaseFeeValue: EvmFormatUtils.etherToGwei(
          Number(gasLimit) * maxBaseFeeInGwei,
        ),
      });
    }
  }, [selectedFee]);

  const init = async () => {
    const estimate = await GasFeeUtils.estimate(
      chain,
      wallet,
      transactionType,
      undefined,
      transactionData,
    );
    if (!!multiplier && selectedFee) {
      const increasedFee: GasFeeEstimationBase = {
        ...selectedFee,
        maxFeePerGas: selectedFee.maxFeePerGas
          ? Number(
              new Decimal(selectedFee.maxFeePerGas)
                .mul(multiplier)
                .toFixed(MathUtils.countDecimals(selectedFee.maxFeePerGas)),
            )
          : undefined,
        priorityFee: selectedFee.priorityFee
          ? Number(
              new Decimal(selectedFee.priorityFee)
                .mul(multiplier)
                .toFixed(MathUtils.countDecimals(selectedFee.priorityFee)),
            )
          : undefined,
      };

      switch (transactionType) {
        case EvmTransactionType.EIP_1559: {
          increasedFee.estimatedFee = EvmFormatUtils.etherToGwei(
            increasedFee.gasLimit * increasedFee.maxFeePerGas!,
          );
          break;
        }
        case EvmTransactionType.LEGACY: {
          increasedFee.estimatedFee = EvmFormatUtils.etherToGwei(
            increasedFee.gasLimit * increasedFee.gasPrice!,
          );
          break;
        }
      }

      if (estimate.aggressive.estimatedFee < increasedFee.estimatedFee)
        estimate.aggressive.deactivated = true;
      if (estimate.medium.estimatedFee < increasedFee.estimatedFee)
        estimate.medium.deactivated = true;

      onSelectFee(increasedFee);
      estimate.increased = increasedFee;
    } else {
      if (estimate.suggestedByDApp) {
        onSelectFee(estimate.suggestedByDApp);
      } else {
        onSelectFee(estimate.suggested);
      }
    }
    setFeeEstimation(estimate);
  };

  const openCustomFeePanel = () => {
    setCustomFeePanelOpened(true);
  };

  const selectGasFee = (gasFee: GasFeeEstimationBase) => {
    onSelectFee(gasFee);
    setIsAdvancedPanelOpen(false);
  };

  const updateCustomFee = (
    key: 'maxBaseFee' | 'priorityFee' | 'gasPrice' | 'gasLimit',
    value: number,
  ) => {
    const newState = { ...customGasFeeForm };
    switch (key) {
      case 'maxBaseFee': {
        newState.maxBaseFeeInGwei = Number(value);
        newState.maxBaseFeeValue = EvmFormatUtils.etherToGwei(
          value * feeEstimation?.custom?.gasLimit!,
        );
        break;
      }
      case 'priorityFee': {
        newState.priorityFeeInGwei = Number(value);
        newState.priorityFeeValue = EvmFormatUtils.etherToGwei(
          value * feeEstimation?.custom?.gasLimit!,
        );
        break;
      }
      case 'gasPrice': {
        newState.gasPriceInGwei = Number(value);
        newState.gasPriceValue = EvmFormatUtils.etherToGwei(
          value * feeEstimation?.custom.gasPrice!,
        );
        break;
      }
      case 'gasLimit': {
        newState.gasLimit = Number(value);
        newState.gasPriceValue = EvmFormatUtils.etherToGwei(
          Number(value) * customGasFeeForm?.gasPriceInGwei!,
        );
        newState.priorityFeeValue = EvmFormatUtils.etherToGwei(
          Number(value) * customGasFeeForm?.priorityFeeInGwei!,
        );
        newState.maxBaseFeeValue = EvmFormatUtils.etherToGwei(
          Number(value) * customGasFeeForm.maxBaseFeeInGwei!,
        );
        break;
      }
    }

    setCustomGasFeeForm(newState);
  };

  const saveCustomFee = () => {
    let customMaxFee = 0;
    let customEstimatedFee = 0;

    switch (transactionType) {
      case EvmTransactionType.EIP_1559: {
        customMaxFee = Decimal.add(
          customGasFeeForm.maxBaseFeeValue!,
          customGasFeeForm.priorityFeeValue!,
        ).toNumber();
        customEstimatedFee = Decimal.add(
          Decimal.div(
            Number(feeEstimation?.extraInfo.baseFee.estimated!),
            EvmFormatUtils.GWEI,
          ),
          customGasFeeForm.priorityFeeValue!,
        ).toNumber();
        break;
      }
      case EvmTransactionType.LEGACY: {
        customMaxFee = customGasFeeForm.gasPriceValue!;
        break;
      }
    }

    let customDuration = 0;
    if (!feeEstimation) return;
    if (customMaxFee >= feeEstimation!.aggressive!.maxFee) {
      customDuration = feeEstimation.aggressive.estimatedMaxDuration;
    } else if (customMaxFee >= feeEstimation!.medium!.maxFee) {
      customDuration = feeEstimation.medium.estimatedMaxDuration;
    } else {
      customDuration = feeEstimation.low.estimatedMaxDuration;
    }

    const custom: GasFeeEstimationBase = {
      estimatedFee: customEstimatedFee,
      maxFee: customMaxFee,
      estimatedMaxDuration: customDuration,
      gasLimit: customGasFeeForm.gasLimit,
      type: customGasFeeForm.type,
      gasPrice: customGasFeeForm.gasPriceInGwei,
      maxFeePerGas: customGasFeeForm.maxBaseFeeInGwei,
      priorityFee: customGasFeeForm.priorityFeeInGwei,
      name: 'popup_html_evm_custom_gas_fee_custom',
      icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
    } as GasFeeEstimationBase;
    onSelectFee(custom);

    const fullGasFeeEstimation = {
      ...feeEstimation,
      custom: custom,
    };

    setFeeEstimation(fullGasFeeEstimation as FullGasFeeEstimation);
    setCustomFeePanelOpened(false);
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

  return (
    <>
      {feeEstimation && selectedFee && (
        <div
          className="gas-fee-panel"
          onClick={() => setIsAdvancedPanelOpen(true)}>
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
          <div className="details">
            {selectedFee.type !== EvmTransactionType.LEGACY && (
              <div className="gas-fee-top-row">
                <div className="label gas-fee-label">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_gas_fee_estimate_label',
                  )}
                </div>
                <div className="label gas-fee">
                  {FormatUtils.formatCurrencyValue(selectedFee.estimatedFee, 8)}{' '}
                  {chain.mainToken}
                </div>
              </div>
            )}

            <div className="gas-fee-top-row">
              <div className="label gas-fee-label">
                {chrome.i18n.getMessage(getFeeLabel())}
              </div>
              <div className="label gas-fee">
                {FormatUtils.formatCurrencyValue(selectedFee.maxFee, 8)}{' '}
                {chain.mainToken}
              </div>
            </div>
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
                  {!feeEstimation.increased && (
                    <div
                      className="custom-fee-row low"
                      onClick={() => selectGasFee(feeEstimation.low)}>
                      <SVGIcon icon={SVGIcons.EVM_GAS_FEE_LOW} />
                      <div className="label type">
                        {chrome.i18n.getMessage(
                          'popup_html_evm_custom_gas_fee_low',
                        )}
                      </div>
                      <div className="label duration">
                        {chrome.i18n.getMessage(
                          'popup_html_evm_gas_fee_estimate_duration',
                          [feeEstimation.low.estimatedMaxDuration.toString()],
                        )}
                      </div>
                      <div className="label gas-fee">
                        {FormatUtils.formatCurrencyValue(
                          feeEstimation.low.maxFee,
                          8,
                        )}
                      </div>
                    </div>
                  )}

                  {feeEstimation.increased && (
                    <div
                      className="custom-fee-row increased"
                      onClick={() => selectGasFee(feeEstimation.increased!)}>
                      <SVGIcon icon={SVGIcons.EVM_GAS_FEE_LOW} />
                      <div className="label type">
                        {chrome.i18n.getMessage(
                          'popup_html_evm_custom_gas_fee_increased',
                        )}
                      </div>
                      <div className="label duration">
                        {chrome.i18n.getMessage(
                          'popup_html_evm_gas_fee_estimate_duration',
                          [
                            feeEstimation.increased.estimatedMaxDuration.toString(),
                          ],
                        )}
                      </div>
                      <div className="label gas-fee">
                        {FormatUtils.formatCurrencyValue(
                          feeEstimation.increased.maxFee,
                          8,
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`custom-fee-row medium ${
                      feeEstimation.medium.deactivated ? 'deactivated' : ''
                    }`}
                    onClick={() => selectGasFee(feeEstimation.medium)}>
                    <SVGIcon icon={SVGIcons.EVM_GAS_FEE_MEDIUM} />
                    <div className="label type">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_custom_gas_fee_medium',
                      )}
                    </div>
                    <div className="label duration">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_gas_fee_estimate_duration',
                        [feeEstimation.medium.estimatedMaxDuration.toString()],
                      )}
                    </div>
                    <div className="label gas-fee">
                      {FormatUtils.formatCurrencyValue(
                        feeEstimation.medium.maxFee,
                        8,
                      )}
                    </div>
                  </div>
                  <div
                    className={`custom-fee-row aggressive ${
                      feeEstimation.aggressive.deactivated ? 'deactivated' : ''
                    }`}
                    onClick={() => selectGasFee(feeEstimation.aggressive)}>
                    <SVGIcon icon={SVGIcons.EVM_GAS_FEE_HIGH} />
                    <div className="label type">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_custom_gas_fee_aggresive',
                      )}
                    </div>
                    <div className="label duration">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_gas_fee_estimate_duration',
                        [
                          feeEstimation.aggressive.estimatedMaxDuration.toString(),
                        ],
                      )}
                    </div>
                    <div className="label gas-fee">
                      {FormatUtils.formatCurrencyValue(
                        feeEstimation.aggressive.maxFee,
                        8,
                      )}
                    </div>
                  </div>
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
                      feeEstimation.custom.maxFee !== -1
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
                      feeEstimation.custom.maxFee !== -1
                        ? FormatUtils.formatCurrencyValue(
                            feeEstimation.custom.maxFee,
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
                          feeEstimation.suggestedByDApp.maxFee !== -1
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
                          feeEstimation.suggestedByDApp.maxFee !== -1
                            ? FormatUtils.formatCurrencyValue(
                                feeEstimation.suggestedByDApp.maxFee,
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
                            customGasFeeForm.maxBaseFeeValue
                              ? customGasFeeForm.maxBaseFeeValue?.toString()
                              : 0
                          } ${chain.mainToken}`}
                          skipHintTranslation
                        />
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
                              {feeEstimation.extraInfo.baseFee.baseFeeRange.min}
                              -
                              {feeEstimation.extraInfo.baseFee.baseFeeRange.max}
                            </span>
                          </div>
                        </div>
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
                            customGasFeeForm.priorityFeeValue
                              ? customGasFeeForm.priorityFeeValue?.toString()
                              : 0
                          } ${chain.mainToken}`}
                          skipHintTranslation
                        />
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
                              {feeEstimation.extraInfo.priorityFee.latest.min}-
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
                              {feeEstimation.extraInfo.priorityFee.history.min}-
                              {feeEstimation.extraInfo.priorityFee.history.max}
                            </span>
                          </div>
                        </div>
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
                          customGasFeeForm.gasPriceInGwei
                            ? customGasFeeForm.gasPriceInGwei?.toString()
                            : 0
                        } ${chain.mainToken}`}
                        skipHintTranslation
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
                    />
                  </div>
                  <div className="button-panel">
                    <ButtonComponent
                      type={ButtonType.ALTERNATIVE}
                      height="small"
                      label="popup_html_button_label_cancel"
                      onClick={() => setCustomFeePanelOpened(false)}
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

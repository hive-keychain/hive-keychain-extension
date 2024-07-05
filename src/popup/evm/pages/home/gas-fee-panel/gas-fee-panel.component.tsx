import { EVMToken } from '@popup/evm/interfaces/active-account.interface';
import {
  CustomGasFeeForm,
  FullGasFeeEstimation,
  GasFeeEstimation,
} from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface GasFeePanelProps {
  chain: EvmChain;
  token: EVMToken;
  receiverAddress: string;
  amount: number;
  wallet: HDNodeWallet;
}

export const GasFeePanel = ({
  chain,
  token,
  receiverAddress,
  amount,
  wallet,
}: GasFeePanelProps) => {
  const [isAdvancedPanelOpen, setIsAdvancedPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();
  const [selectedFee, setSelectedFee] = useState<GasFeeEstimation>();
  const [isCustomFeePanelOpened, setCustomFeePanelOpened] =
    useState<boolean>(false);
  const [customGasFeeForm, setCustomGasFeeForm] = useState<CustomGasFeeForm>({
    gasLimit: 0,
    maxBaseFeeInGwei: 0,
    priorityFeeInGwei: 0,
  });

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const estimate = await GasFeeUtils.estimate(
      chain,
      token,
      receiverAddress,
      amount,
      wallet,
    );
    setFeeEstimation(estimate);
    setSelectedFee(estimate.suggested);
  };

  const openCustomFeePanel = () => {
    setCustomFeePanelOpened(true);
  };

  const selectGasFee = (gasFee: GasFeeEstimation) => {
    setSelectedFee(gasFee);
    setIsAdvancedPanelOpen(false);
  };

  const updateCustomFee = (key: keyof CustomGasFeeForm, value: number) => {
    const newState = { ...customGasFeeForm };
    newState[key] = value;
    setCustomGasFeeForm(newState);
  };

  const saveCustomFee = () => {
    // TODO calculate custom fee
    setCustomFeePanelOpened(false);
  };

  return (
    <>
      {feeEstimation && selectedFee && (
        <div
          className="gas-fee-panel"
          onClick={() => setIsAdvancedPanelOpen(true)}>
          <div className="title-row">
            <div className="title">
              {chrome.i18n.getMessage('popup_html_evm_gas_fee')}
            </div>
            <SVGIcon
              className="gas-fee-settings"
              icon={SVGIcons.EVM_GAS_FEE_DETAILS}
            />
          </div>
          <div className="details">
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
            <div className="gas-fee-bottom-row">
              <div className="label duration">
                {chrome.i18n.getMessage(
                  'popup_html_evm_gas_fee_estimate_duration',
                  [selectedFee.estimatedMaxDuration.toString()],
                )}
              </div>
              <div className="label max-fee">
                {chrome.i18n.getMessage('popup_html_evm_gas_max_fee_label')}
                {': '}
                {FormatUtils.formatCurrencyValue(
                  feeEstimation.max.estimatedFee,
                  8,
                )}{' '}
                {chain.mainToken}
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
                  <div
                    className="custom-fee-row low"
                    onClick={() => selectGasFee(feeEstimation.low)}>
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
                        feeEstimation.low.estimatedFee,
                        8,
                      )}
                    </div>
                  </div>

                  <div
                    className="custom-fee-row medium"
                    onClick={() => selectGasFee(feeEstimation.medium)}>
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
                        feeEstimation.medium.estimatedFee,
                        8,
                      )}
                    </div>
                  </div>
                  <div
                    className="custom-fee-row aggressive"
                    onClick={() => selectGasFee(feeEstimation.aggressive)}>
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
                        feeEstimation.aggressive.estimatedFee,
                        8,
                      )}
                    </div>
                  </div>
                  <Separator type={'horizontal'} fullSize />
                  <div
                    className="custom-fee-row custom"
                    onClick={() => openCustomFeePanel()}>
                    <div className="label type">
                      {chrome.i18n.getMessage(
                        'popup_html_evm_custom_gas_fee_custom',
                      )}
                    </div>
                    <div className="label duration">
                      {feeEstimation.custom
                        ? feeEstimation.custom?.estimatedMaxDuration
                        : '-'}
                    </div>
                    <div className="label gas-fee">
                      {feeEstimation.custom
                        ? feeEstimation.custom?.estimatedFee
                        : '-'}
                    </div>
                  </div>
                </>
              )}
              {isCustomFeePanelOpened && customGasFeeForm && (
                <div className="custom-gas-fee-panel">
                  <InputComponent
                    label="popup_html_evm_gas_fee_form_base_fee"
                    placeholder="popup_html_evm_gas_fee_form_base_fee"
                    type={InputType.NUMBER}
                    value={customGasFeeForm.maxBaseFeeInGwei}
                    onChange={(value) =>
                      updateCustomFee('maxBaseFeeInGwei', value)
                    }
                  />
                  <InputComponent
                    label="popup_html_evm_gas_fee_form_priority_fee"
                    placeholder="popup_html_evm_gas_fee_form_priority_fee"
                    type={InputType.NUMBER}
                    value={customGasFeeForm.priorityFeeInGwei}
                    onChange={(value) =>
                      updateCustomFee('priorityFeeInGwei', value)
                    }
                  />
                  <ButtonComponent
                    label="popup_html_operation_button_save"
                    onClick={saveCustomFee}
                  />
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  );
};

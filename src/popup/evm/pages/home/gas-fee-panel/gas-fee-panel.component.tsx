import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { FullGasFeeEstimation } from '@popup/evm/interfaces/gas-fee.interface';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import FormatUtils from 'src/utils/format.utils';

interface GasFeePanelProps {
  chain: EvmChain;
  token: EvmErc20TokenBalanceWithPrice;
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
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [feeEstimation, setFeeEstimation] = useState<FullGasFeeEstimation>();

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
  };

  return (
    <>
      {feeEstimation && (
        <div className="gas-fee-panel" onClick={() => setIsPanelOpen(true)}>
          <div className="gas-fee-top-row">
            <div className="label gas-fee-label">
              {chrome.i18n.getMessage('popup_html_evm_gas_fee_estimate_label')}
            </div>
            <div className="label gas-fee">
              {FormatUtils.formatCurrencyValue(
                feeEstimation.suggested.estimatedFee,
                8,
              )}
            </div>
          </div>
          <div className="gas-fee-bottom-row">
            <div className="label duration">
              {chrome.i18n.getMessage(
                'popup_html_evm_gas_fee_estimate_duration',
                [feeEstimation.suggested.estimatedMaxDuration.toString()],
              )}
            </div>
            <div className="label max-fee">
              {chrome.i18n.getMessage('popup_html_evm_gas_max_fee_label')}
              {': '}
              {FormatUtils.formatCurrencyValue(
                feeEstimation.max.estimatedFee,
                8,
              )}
            </div>
          </div>
        </div>
      )}
      {isPanelOpen && feeEstimation && (
        <PopupContainer
          children={
            <div className="edit-gas-fee-content">
              <div className="title">
                <span>
                  {chrome.i18n.getMessage('popup_html_evm_edit_gas_fee')}
                </span>
                <SVGIcon
                  icon={SVGIcons.TOP_BAR_CLOSE_BTN}
                  onClick={() => setIsPanelOpen(false)}
                />
              </div>
              <Separator fullSize type="horizontal" />
              <div className="custom-fee-row low">
                <div className="label type">
                  {chrome.i18n.getMessage('popup_html_evm_custom_gas_fee_low')}
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

              <div className="custom-fee-row medium">
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
              <div className="custom-fee-row aggressive">
                <div className="label type">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_custom_gas_fee_aggresive',
                  )}
                </div>
                <div className="label duration">
                  {chrome.i18n.getMessage(
                    'popup_html_evm_gas_fee_estimate_duration',
                    [feeEstimation.aggressive.estimatedMaxDuration.toString()],
                  )}
                </div>
                <div className="label gas-fee">
                  {FormatUtils.formatCurrencyValue(
                    feeEstimation.aggressive.estimatedFee,
                    8,
                  )}
                </div>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

import { EvmErc20TokenBalanceWithPrice } from '@moralisweb3/common-evm-utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

interface GasFeePanelProps {
  chain: Chain;
  token: EvmErc20TokenBalanceWithPrice;
}

export const GasFeePanel = ({ chain, token }: GasFeePanelProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    console.log(token);
    const estimate = await GasFeeUtils.estimate(chain, token);
    console.log(estimate);
  };

  return (
    <>
      <div className="gas-fee-panel" onClick={() => setIsPanelOpen(true)}>
        <div className="gas-fee-top-row">
          <div className="label gas-fee-label">
            {chrome.i18n.getMessage('popup_html_evm_gas_fee_estimate_label')}
          </div>
          <div className="label gas-fee">0.0123456</div>
        </div>
        <div className="gas-fee-bottom-row">
          <div className="label duration">
            {chrome.i18n.getMessage(
              'popup_html_evm_gas_fee_estimate_duration',
              ['30'],
            )}
          </div>
          <div className="label max-fee">
            {chrome.i18n.getMessage('popup_html_evm_gas_max_fee_label')} :{' '}
            {'0.0011245'}
          </div>
        </div>
      </div>
      {isPanelOpen && (
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
                    ['30'],
                  )}
                </div>
                <div className="label gas-fee">0.000001</div>
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
                    ['30'],
                  )}
                </div>
                <div className="label gas-fee">0.000001</div>
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
                    ['30'],
                  )}
                </div>
                <div className="label gas-fee">0.000001</div>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

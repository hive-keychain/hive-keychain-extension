import React, { useEffect, useState } from 'react';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';

export const GasFeePanel = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {}, []);

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
      {isPanelOpen && <PopupContainer children={'Popup'} />}
    </>
  );
};

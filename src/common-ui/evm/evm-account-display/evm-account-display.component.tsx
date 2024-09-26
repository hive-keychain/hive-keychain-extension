import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/addresses.utils';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  active?: EvmActiveAccount;
  account: EvmAccount;
  status?: DappStatusEnum;
  editable?: boolean;
  copiable?: boolean;
  onCopy?: (account: EvmAccount) => void;
};

const EvmAccountDisplay = ({
  account,
  active,
  status,
  editable,
  copiable,
  onCopy,
}: Props) => {
  return (
    <div className="evm-account-display">
      <DappStatusComponent
        svg={EvmAddressesUtils.getIdenticonFromAddress(account.wallet.address)}
        status={status}
      />
      <div className="account-info">
        <div className="top-line">
          <div className="account-name">
            {EvmAccountUtils.getDefaultAccountName(account)}
          </div>
          {editable && <div className="edit-icon"></div>}
          {editable && (
            <SVGIcon
              icon={!account.hide ? SVGIcons.INPUT_HIDE : SVGIcons.INPUT_SHOW}
              className="hide-token"
              onClick={() => {}}
              tooltipMessage="html_popup_evm_hide_account"
              tooltipPosition="left"
            />
          )}
        </div>
        <div className="bottom-line">
          <div className="account-address">
            {EvmFormatUtils.formatAddress(account.wallet.address)}
            {copiable && (
              <div
                onClick={() => {
                  if (onCopy) onCopy(account);
                }}>
                <SVGIcon className={'copy-icon'} icon={SVGIcons.SELECT_COPY} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EvmAccountDisplayComponent = EvmAccountDisplay;

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
  activeAccount?: EvmActiveAccount;
  account: EvmAccount;
  status?: DappStatusEnum;
  editable?: boolean;
  copiable?: boolean;
  onCopy?: (account: EvmAccount) => void;
  onHideOrShow?: (seedId: number, addressId: number, hide: boolean) => void;
  onEdit?: (account: EvmAccount) => void;
  fullAddress?: boolean;
};

export const EvmAccountDisplayComponent = ({
  account,
  activeAccount,
  status,
  editable,
  copiable,
  fullAddress,
  onCopy,
  onHideOrShow,
  onEdit,
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
            {EvmAccountUtils.getAccountName(account)}
          </div>
          {editable && (
            <SVGIcon
              className="edit-icon"
              icon={SVGIcons.EVM_ACCOUNT_EDIT}
              onClick={() => {
                if (onEdit) onEdit(account);
              }}
            />
          )}
        </div>
        <div className="bottom-line">
          <div
            className={`account-address ${fullAddress ? 'full-address' : ''}`}>
            {fullAddress
              ? account.wallet.address
              : EvmFormatUtils.formatAddress(account.wallet.address)}
          </div>
        </div>
      </div>
      <div className="action-panel">
        {editable && (
          <SVGIcon
            icon={account.hide ? SVGIcons.INPUT_HIDE : SVGIcons.INPUT_SHOW}
            className="hide-token"
            onClick={() => {
              if (onHideOrShow)
                onHideOrShow(account.seedId, account.id, !account.hide);
            }}
            tooltipMessage={
              account.hide
                ? 'html_popup_evm_show_account'
                : 'html_popup_evm_hide_account'
            }
            tooltipPosition="left"
          />
        )}
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
  );
};

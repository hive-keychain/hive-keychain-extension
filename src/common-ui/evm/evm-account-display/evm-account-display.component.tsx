import { EvmAccountInfo } from '@common-ui/evm/evm-account-display/evm-account-info.component';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import React from 'react';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

type Props = {
  activeAccount?: EvmActiveAccount;
  account: EvmAccountOrPublic;
  status?: DappStatusEnum;
  editable?: boolean;
  hideable?: boolean;
  deletable?: boolean;
  copiable?: boolean;
  onCopy?: (account: EvmAccountOrPublic) => void;
  onHideOrShow?: (seedId: number, addressId: number, hide: boolean) => void;
  onDelete?: (account: EvmAccountOrPublic) => void;
  onEdit?: (account: EvmAccountOrPublic) => void;
  fullAddress?: boolean;
  fullName?: boolean;
};

export const EvmAccountDisplayComponent = ({
  account,
  activeAccount,
  status,
  editable,
  hideable,
  deletable,
  copiable,
  fullAddress,
  fullName,
  onCopy,
  onHideOrShow,
  onDelete,
  onEdit,
}: Props) => {
  const address = EvmAccountUtils.getEvmAccountAddress(account);
  return (
    <div className="evm-account-display">
      <DappStatusComponent address={address} status={status} />
      <EvmAccountInfo
        account={account}
        editable={editable}
        fullAddress={fullAddress}
        fullName={fullName}
        onEdit={onEdit}
      />
      <div className="action-panel">
        {hideable && (
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
        {deletable && (
          <SVGIcon
            icon={SVGIcons.EVM_ACCOUNT_DELETE}
            className="delete-account"
            onClick={() => {
              if (onDelete) onDelete(account);
            }}
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

import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { EvmAccountOrPublic } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import React from 'react';

interface Props {
  account: EvmAccountOrPublic;
  fullAddress?: boolean;
  fullName?: boolean;
  editable?: boolean;
  onEdit?: (account: EvmAccountOrPublic) => void;
}

export const EvmAccountInfo = ({
  account,
  editable,
  fullAddress,
  fullName,
  onEdit,
}: Props) => {
  const addr = EvmAccountUtils.getEvmAccountAddress(account);
  return (
    <div className="account-info">
      <div className="top-line">
        <div className="account-name">
          {fullName
            ? EvmAccountUtils.getAccountFullname(account)
            : EvmAccountUtils.getAccountName(account)}
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
        <div className={`account-address ${fullAddress ? 'full-address' : ''}`}>
          {fullAddress ? addr : EvmFormatUtils.formatAddress(addr)}
        </div>
      </div>
    </div>
  );
};

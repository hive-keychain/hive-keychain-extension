import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';

interface Props {
  account: EvmAccount;
  fullAddress?: boolean;
  editable?: boolean;
  onEdit?: (account: EvmAccount) => void;
}

export const EvmAccountInfo = ({
  account,
  editable,
  fullAddress,
  onEdit,
}: Props) => {
  return (
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
        <div className={`account-address ${fullAddress ? 'full-address' : ''}`}>
          {fullAddress
            ? account.wallet.address
            : EvmFormatUtils.formatAddress(account.wallet.address)}
        </div>
      </div>
    </div>
  );
};

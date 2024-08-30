import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React from 'react';
import {
  DappStatusComponent,
  DappStatusEnum,
} from 'src/common-ui/evm/dapp-status/dapp-status.component';

type Props = {
  active: EvmActiveAccount;
  account: EvmAccount;
};
export const EvmAccountDisplayComponent = ({ account, active }: Props) => {
  return (
    <div className="evm-account-display">
      <DappStatusComponent
        imageUrl=""
        status={
          account.wallet.address === active.address
            ? DappStatusEnum.CONNECTED
            : DappStatusEnum.OTHER_ACCOUNT_CONNECTED
        }
      />
      <div className="account-info">
        <div className="account-name">{`${chrome.i18n.getMessage(
          'dialog_account',
        )} ${active.wallet.index}`}</div>
        <div className="account-address">
          {EvmFormatUtils.formatAddress(active.address)}
        </div>
      </div>
    </div>
  );
};

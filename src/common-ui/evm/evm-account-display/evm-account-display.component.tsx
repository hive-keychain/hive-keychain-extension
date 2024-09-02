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

type Props = {
  active?: EvmActiveAccount;
  account: EvmAccount;
  status: DappStatusEnum;
};
export const EvmAccountDisplayComponent = ({
  account,
  active,
  status,
}: Props) => {
  return (
    <div className="evm-account-display">
      <DappStatusComponent
        svg={EvmAddressesUtils.getIdenticonFromAddress(account.wallet.address)}
        status={status}
      />
      <div className="account-info">
        <div className="account-name">
          {EvmAccountUtils.getDefaultAccountName(account)}
        </div>
        <div className="account-address">
          {EvmFormatUtils.formatAddress(account.wallet.address)}
        </div>
      </div>
    </div>
  );
};

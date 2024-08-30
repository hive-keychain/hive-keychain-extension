import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { RequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  addresses: string[];
  data: RequestMessage;
}

export const ConnectAccounts = (props: Props) => {
  const { addresses, data, request } = props;
  const [accountsToConnect, setAccountsToConnect] = useState<any>({});

  useEffect(() => {
    const accounts: any = {};
    for (const address of addresses) {
      accounts[address] = false;
    }
    setAccountsToConnect(accounts);
  }, []);

  const toggleAccount = (address: string) => {
    const oldState = { ...accountsToConnect };
    oldState[address] = !oldState[address];
    setAccountsToConnect(oldState);
  };

  const saveInStorage = () => {
    console.log({ accountsToConnect });
    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_BACK_CONNECTED_WALLETS,
      value: {
        data: data,
        tab: data.tab,
        domain: data.domain,
        connectedAccounts: accountsToConnect,
      },
    });
  };

  return (
    <EvmOperation
      data={request}
      domain={data.domain}
      tab={0}
      title={chrome.i18n.getMessage('evm_connect_wallet')}
      onConfirm={saveInStorage}>
      <div>{data.domain}</div>
      {accountsToConnect &&
        Object.keys(accountsToConnect).map((address) => (
          <CheckboxPanelComponent
            onChange={() => toggleAccount(address)}
            checked={accountsToConnect[address]}
            title={EvmFormatUtils.formatAddress(address)}
            skipTranslation
          />
        ))}
    </EvmOperation>
  );
};

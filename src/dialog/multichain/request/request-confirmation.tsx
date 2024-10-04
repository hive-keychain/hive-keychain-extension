import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';
import { ConnectAccounts } from 'src/dialog/evm/requests/connect-accounts';
import { DecryptMessage } from 'src/dialog/evm/requests/decrypt-message/decrypt-message';
import { GetEncryptionKey } from 'src/dialog/evm/requests/get-encryption-key';
import { PersonalSign } from 'src/dialog/evm/requests/personal-sign';
import { SignTypedData } from 'src/dialog/evm/requests/sign-typed-data';
import AddAccount from 'src/dialog/hive/requests/add-account';
import AddAccountAuthority from 'src/dialog/hive/requests/authority/add-account-authority';
import AddKeyAuthority from 'src/dialog/hive/requests/authority/add-key-authority';
import RemoveAccountAuthority from 'src/dialog/hive/requests/authority/remove-account-authority';
import RemoveKeyAuthority from 'src/dialog/hive/requests/authority/remove-key-authority';
import Broadcast from 'src/dialog/hive/requests/broadcast';
import Convert from 'src/dialog/hive/requests/convert';
import CreateClaimedAccount from 'src/dialog/hive/requests/create-claimed-account';
import CustomJson from 'src/dialog/hive/requests/custom-json';
import DecodeMemo from 'src/dialog/hive/requests/decode-memo';
import Delegation from 'src/dialog/hive/requests/delegation';
import EncodeMemo from 'src/dialog/hive/requests/encode-memo';
import EncodeWithKeys from 'src/dialog/hive/requests/encode-with-keys';
import Post from 'src/dialog/hive/requests/post';
import PowerDown from 'src/dialog/hive/requests/power/power-down';
import PowerUp from 'src/dialog/hive/requests/power/power-up';
import CreateProposal from 'src/dialog/hive/requests/proposals/create-proposal';
import RemoveProposal from 'src/dialog/hive/requests/proposals/remove-proposal';
import UpdateProposalVote from 'src/dialog/hive/requests/proposals/update-proposal-vote';
import Proxy from 'src/dialog/hive/requests/proxy';
import RecurrentTransfer from 'src/dialog/hive/requests/recurrent-transfer';
import SendToken from 'src/dialog/hive/requests/send-token';
import SignBuffer from 'src/dialog/hive/requests/sign-buffer';
import SignTx from 'src/dialog/hive/requests/sign-tx';
import Swap from 'src/dialog/hive/requests/swap';
import Transfer from 'src/dialog/hive/requests/transfer';
import Vote from 'src/dialog/hive/requests/vote';
import WitnessVote from 'src/dialog/hive/requests/witness-vote';

type Props = {
  data: HiveRequestMessage | EvmRequestMessage;
};

export type HiveRequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM;
  data: KeychainRequest;
  rpc: Rpc;
  tab: number;
  domain: string;
  accounts?: string[];
  hiveEngineConfig: HiveEngineConfig;
};

export type EvmRequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM_EVM;
  data: EvmRequest;
  tab: number;
  domain: string;
  accounts?: EvmAccount[];
};

const RequestConfirmation = ({ data }: Props) => {
  if (data.command === DialogCommand.SEND_DIALOG_CONFIRM) {
    data = data as HiveRequestMessage;
    const request = data.data as KeychainRequest;
    switch (request.type) {
      case KeychainRequestTypes.addAccount:
        return <AddAccount {...data} data={request} />;
      case KeychainRequestTypes.vote:
        return <Vote {...data} data={request} />;
      case KeychainRequestTypes.decode:
        return <DecodeMemo {...data} data={request} />;
      case KeychainRequestTypes.encode:
        return <EncodeMemo {...data} data={request} />;
      case KeychainRequestTypes.encodeWithKeys:
        return <EncodeWithKeys {...data} data={request} />;
      case KeychainRequestTypes.custom:
        return <CustomJson {...data} data={request} />;
      case KeychainRequestTypes.signBuffer:
        return <SignBuffer {...data} data={request} />;
      case KeychainRequestTypes.updateProposalVote:
        return <UpdateProposalVote {...data} data={request} />;
      case KeychainRequestTypes.transfer:
        return <Transfer {...data} data={request} />;
      case KeychainRequestTypes.addAccountAuthority:
        return <AddAccountAuthority {...data} data={request} />;
      case KeychainRequestTypes.removeAccountAuthority:
        return <RemoveAccountAuthority {...data} data={request} />;
      case KeychainRequestTypes.addKeyAuthority:
        return <AddKeyAuthority {...data} data={request} />;
      case KeychainRequestTypes.removeKeyAuthority:
        return <RemoveKeyAuthority {...data} data={request} />;
      case KeychainRequestTypes.delegation:
        return <Delegation {...data} data={request} />;
      case KeychainRequestTypes.powerUp:
        return <PowerUp {...data} data={request} />;
      case KeychainRequestTypes.powerDown:
        return <PowerDown {...data} data={request} />;
      case KeychainRequestTypes.witnessVote:
        return <WitnessVote {...data} data={request} />;
      case KeychainRequestTypes.proxy:
        return <Proxy {...data} data={request} />;
      case KeychainRequestTypes.signTx:
        return <SignTx {...data} data={request} />;
      case KeychainRequestTypes.convert:
        return <Convert {...data} data={request} />;
      case KeychainRequestTypes.recurrentTransfer:
        return <RecurrentTransfer {...data} data={request} />;
      case KeychainRequestTypes.createProposal:
        return <CreateProposal {...data} data={request} />;
      case KeychainRequestTypes.removeProposal:
        return <RemoveProposal {...data} data={request} />;
      case KeychainRequestTypes.sendToken:
        return <SendToken {...data} data={request} />;
      case KeychainRequestTypes.createClaimedAccount:
        return <CreateClaimedAccount {...data} data={request} />;
      case KeychainRequestTypes.post:
        return <Post {...data} data={request} />;
      case KeychainRequestTypes.broadcast:
        return <Broadcast {...data} data={request} />;
      case KeychainRequestTypes.swap:
        return <Swap {...data} data={request} />;
      default:
        return null;
    }
  } else if (data.command === DialogCommand.SEND_DIALOG_CONFIRM_EVM) {
    data = data as EvmRequestMessage;
    const request = data.data as EvmRequest;
    switch (request.method) {
      case EvmRequestMethod.GET_ACCOUNTS:
      case EvmRequestMethod.REQUEST_ACCOUNTS: {
        return (
          <ConnectAccounts
            request={request}
            accounts={data.accounts!}
            data={data}
          />
        );
      }

      case EvmRequestMethod.ETH_SIGN_DATA_4: {
        return (
          <SignTypedData
            request={request}
            accounts={data.accounts!}
            data={data}
          />
        );
      }

      case EvmRequestMethod.PERSONAL_SIGN: {
        return (
          <PersonalSign
            request={request}
            accounts={data.accounts!}
            data={data}
          />
        );
      }

      case EvmRequestMethod.GET_ENCRYPTION_KEY: {
        return (
          <GetEncryptionKey
            request={request}
            data={data}
            accounts={data.accounts!}
          />
        );
      }

      case EvmRequestMethod.ETH_DECRYPT: {
        return (
          <DecryptMessage
            request={request}
            data={data}
            accounts={data.accounts!}
          />
        );
      }

      default: {
        return <div>{JSON.stringify(data)}</div>;
      }
    }
  }
  return null;
};

export default RequestConfirmation;

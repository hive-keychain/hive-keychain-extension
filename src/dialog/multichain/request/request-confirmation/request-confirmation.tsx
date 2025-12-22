import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { AddChain } from '@dialog/evm/requests/add-chain/add-chain';
import {
  EvmRequestMessage,
  HiveRequestMessage,
} from '@dialog/interfaces/messages.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';
import { ConnectAccounts } from 'src/dialog/evm/requests/connect-accounts';
import { DecryptMessage } from 'src/dialog/evm/requests/decrypt-message/decrypt-message';
import { GetEncryptionKey } from 'src/dialog/evm/requests/get-encryption-key';
import { PersonalSign } from 'src/dialog/evm/requests/personal-sign';
import { SendTransaction } from 'src/dialog/evm/requests/send-transaction/send-transaction';
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
  message: HiveRequestMessage | EvmRequestMessage;
  afterCancel: (requestId: number, tab: number) => void;
};

export const RequestConfirmation = ({ message, afterCancel }: Props) => {
  const displayRequest = (
    displayedMessage: HiveRequestMessage | EvmRequestMessage,
  ) => {
    if (displayedMessage.command === DialogCommand.SEND_DIALOG_CONFIRM) {
      const request = displayedMessage.request as KeychainRequest;
      switch (request.type) {
        case KeychainRequestTypes.addAccount:
          return (
            <AddAccount
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.vote:
          return (
            <Vote
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.decode:
          return (
            <DecodeMemo
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.encode:
          return (
            <EncodeMemo
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.encodeWithKeys:
          return (
            <EncodeWithKeys
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.custom:
          return (
            <CustomJson
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.signBuffer:
          return (
            <SignBuffer
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.updateProposalVote:
          return (
            <UpdateProposalVote
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.transfer:
          return (
            <Transfer
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.addAccountAuthority:
          return (
            <AddAccountAuthority
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.removeAccountAuthority:
          return (
            <RemoveAccountAuthority
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.addKeyAuthority:
          return (
            <AddKeyAuthority
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.removeKeyAuthority:
          return (
            <RemoveKeyAuthority
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.delegation:
          return (
            <Delegation
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.powerUp:
          return (
            <PowerUp
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.powerDown:
          return (
            <PowerDown
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.witnessVote:
          return (
            <WitnessVote
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.proxy:
          return (
            <Proxy
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.signTx:
          return (
            <SignTx
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.convert:
          return (
            <Convert
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.recurrentTransfer:
          return (
            <RecurrentTransfer
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.createProposal:
          return (
            <CreateProposal
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.removeProposal:
          return (
            <RemoveProposal
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.sendToken:
          return (
            <SendToken
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.createClaimedAccount:
          return (
            <CreateClaimedAccount
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.post:
          return (
            <Post
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.broadcast:
          return (
            <Broadcast
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        case KeychainRequestTypes.swap:
          return (
            <Swap
              {...displayedMessage}
              data={request}
              afterCancel={afterCancel}
            />
          );
        default:
          return null;
      }
    } else if (
      displayedMessage.command === DialogCommand.SEND_DIALOG_CONFIRM_EVM
    ) {
      const request = displayedMessage.request as EvmRequest;
      switch (request.method) {
        case EvmRequestMethod.GET_ACCOUNTS:
        case EvmRequestMethod.REQUEST_ACCOUNTS: {
          return (
            <ConnectAccounts
              request={request}
              accounts={displayedMessage.accounts!}
              data={displayedMessage}
              afterCancel={afterCancel}
            />
          );
        }
        case EvmRequestMethod.ETH_SIGN_DATA:
        case EvmRequestMethod.ETH_SIGN_DATA_3:
        case EvmRequestMethod.ETH_SIGN_DATA_4: {
          return (
            <SignTypedData
              request={request}
              accounts={displayedMessage.accounts!}
              data={displayedMessage}
              afterCancel={afterCancel}
            />
          );
        }

        case EvmRequestMethod.PERSONAL_SIGN: {
          return (
            <PersonalSign
              request={request}
              accounts={displayedMessage.accounts!}
              data={displayedMessage}
              afterCancel={afterCancel}
            />
          );
        }

        case EvmRequestMethod.GET_ENCRYPTION_KEY: {
          return (
            <GetEncryptionKey
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
              afterCancel={afterCancel}
            />
          );
        }

        case EvmRequestMethod.ETH_DECRYPT: {
          return (
            <DecryptMessage
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
              afterCancel={afterCancel}
            />
          );
        }

        case EvmRequestMethod.SEND_TRANSACTION: {
          return (
            <SendTransaction
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
              afterCancel={afterCancel}
            />
          );
        }

        case EvmRequestMethod.WALLET_REQUEST_PERMISSIONS: {
          const requestedPermission = Object.keys(request.params[0])[0];
          switch (requestedPermission) {
            case EvmRequestPermission.ETH_ACCOUNTS: {
              return (
                <ConnectAccounts
                  request={request}
                  accounts={displayedMessage.accounts!}
                  data={displayedMessage}
                  afterCancel={afterCancel}
                />
              );
            }
          }
        }

        case EvmRequestMethod.WALLET_ADD_ETH_CHAIN: {
          return (
            <AddChain
              request={request}
              data={displayedMessage}
              afterCancel={afterCancel}
            />
          );
        }

        default: {
          return <div>{JSON.stringify(displayedMessage)}</div>;
        }
      }
    }
  };

  return <>{displayRequest(message)}</>;
};

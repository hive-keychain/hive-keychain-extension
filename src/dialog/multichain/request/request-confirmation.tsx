import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { SVGIcons } from '@common-ui/icons.enum';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
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
import React, { useEffect, useState } from 'react';
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
};

type RequestsMessages = HiveRequestMessage[] | EvmRequestMessage[];

export const RequestConfirmation = ({ message }: Props) => {
  const [displayedRequestIndex, setDisplayedRequestIndex] = useState(0);
  const [requestsMessages, setRequestsMessages] = useState<RequestsMessages>(
    [],
  );
  useEffect(() => {
    if (
      message.command === DialogCommand.SEND_DIALOG_CONFIRM_EVM ||
      message.command === DialogCommand.SEND_DIALOG_CONFIRM
    ) {
      setRequestsMessages([...requestsMessages, message] as RequestsMessages);
    }
  }, [message]);

  const displayRequest = (
    displayedMessage: HiveRequestMessage | EvmRequestMessage,
  ) => {
    if (displayedMessage.command === DialogCommand.SEND_DIALOG_CONFIRM) {
      const message = requestsMessages[
        displayedRequestIndex
      ] as HiveRequestMessage;
      const request = message.request as KeychainRequest;
      switch (request.type) {
        case KeychainRequestTypes.addAccount:
          return <AddAccount {...displayedMessage} data={request} />;
        case KeychainRequestTypes.vote:
          return <Vote {...displayedMessage} data={request} />;
        case KeychainRequestTypes.decode:
          return <DecodeMemo {...displayedMessage} data={request} />;
        case KeychainRequestTypes.encode:
          return <EncodeMemo {...displayedMessage} data={request} />;
        case KeychainRequestTypes.encodeWithKeys:
          return <EncodeWithKeys {...displayedMessage} data={request} />;
        case KeychainRequestTypes.custom:
          return <CustomJson {...displayedMessage} data={request} />;
        case KeychainRequestTypes.signBuffer:
          return <SignBuffer {...displayedMessage} data={request} />;
        case KeychainRequestTypes.updateProposalVote:
          return <UpdateProposalVote {...displayedMessage} data={request} />;
        case KeychainRequestTypes.transfer:
          return <Transfer {...displayedMessage} data={request} />;
        case KeychainRequestTypes.addAccountAuthority:
          return <AddAccountAuthority {...displayedMessage} data={request} />;
        case KeychainRequestTypes.removeAccountAuthority:
          return (
            <RemoveAccountAuthority {...displayedMessage} data={request} />
          );
        case KeychainRequestTypes.addKeyAuthority:
          return <AddKeyAuthority {...displayedMessage} data={request} />;
        case KeychainRequestTypes.removeKeyAuthority:
          return <RemoveKeyAuthority {...displayedMessage} data={request} />;
        case KeychainRequestTypes.delegation:
          return <Delegation {...displayedMessage} data={request} />;
        case KeychainRequestTypes.powerUp:
          return <PowerUp {...displayedMessage} data={request} />;
        case KeychainRequestTypes.powerDown:
          return <PowerDown {...displayedMessage} data={request} />;
        case KeychainRequestTypes.witnessVote:
          return <WitnessVote {...displayedMessage} data={request} />;
        case KeychainRequestTypes.proxy:
          return <Proxy {...displayedMessage} data={request} />;
        case KeychainRequestTypes.signTx:
          return <SignTx {...displayedMessage} data={request} />;
        case KeychainRequestTypes.convert:
          return <Convert {...displayedMessage} data={request} />;
        case KeychainRequestTypes.recurrentTransfer:
          return <RecurrentTransfer {...displayedMessage} data={request} />;
        case KeychainRequestTypes.createProposal:
          return <CreateProposal {...displayedMessage} data={request} />;
        case KeychainRequestTypes.removeProposal:
          return <RemoveProposal {...displayedMessage} data={request} />;
        case KeychainRequestTypes.sendToken:
          return <SendToken {...displayedMessage} data={request} />;
        case KeychainRequestTypes.createClaimedAccount:
          return <CreateClaimedAccount {...displayedMessage} data={request} />;
        case KeychainRequestTypes.post:
          return <Post {...displayedMessage} data={request} />;
        case KeychainRequestTypes.broadcast:
          return <Broadcast {...displayedMessage} data={request} />;
        case KeychainRequestTypes.swap:
          return <Swap {...displayedMessage} data={request} />;
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
            />
          );
        }

        case EvmRequestMethod.PERSONAL_SIGN: {
          return (
            <PersonalSign
              request={request}
              accounts={displayedMessage.accounts!}
              data={displayedMessage}
            />
          );
        }

        case EvmRequestMethod.GET_ENCRYPTION_KEY: {
          return (
            <GetEncryptionKey
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
            />
          );
        }

        case EvmRequestMethod.ETH_DECRYPT: {
          return (
            <DecryptMessage
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
            />
          );
        }

        case EvmRequestMethod.SEND_TRANSACTION: {
          return (
            <SendTransaction
              request={request}
              data={displayedMessage}
              accounts={displayedMessage.accounts!}
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
                />
              );
            }
          }
        }

        case EvmRequestMethod.WALLET_ADD_ETH_CHAIN: {
          return <AddChain request={request} data={displayedMessage} />;
        }

        default: {
          return <div>{JSON.stringify(displayedMessage)}</div>;
        }
      }
    }
  };

  return (
    <>
      {requestsMessages.length > 1 && (
        <div className="multiple-page-container">
          {displayedRequestIndex > 0 && (
            <SVGIcon
              className="previous-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() =>
                setDisplayedRequestIndex(displayedRequestIndex - 1)
              }
            />
          )}
          {displayedRequestIndex + 1} / {requestsMessages.length}
          {displayedRequestIndex < requestsMessages.length - 1 && (
            <SVGIcon
              className="next-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() =>
                setDisplayedRequestIndex(displayedRequestIndex + 1)
              }
            />
          )}
        </div>
      )}
      {requestsMessages.length > 0 && (
        <>{displayRequest(requestsMessages[displayedRequestIndex])}</>
      )}
    </>
  );
};

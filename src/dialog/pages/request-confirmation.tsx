import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import {
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';
import AddAccount from 'src/dialog/pages/requests/add-account';
import AddAccountAuthority from 'src/dialog/pages/requests/authority/add-account-authority';
import AddKeyAuthority from 'src/dialog/pages/requests/authority/add-key-authority';
import RemoveAccountAuthority from 'src/dialog/pages/requests/authority/remove-account-authority';
import RemoveKeyAuthority from 'src/dialog/pages/requests/authority/remove-key-authority';
import Broadcast from 'src/dialog/pages/requests/broadcast';
import Convert from 'src/dialog/pages/requests/convert';
import CreateClaimedAccount from 'src/dialog/pages/requests/create-claimed-account';
import CustomJson from 'src/dialog/pages/requests/custom-json';
import DecodeMemo from 'src/dialog/pages/requests/decode-memo';
import Delegation from 'src/dialog/pages/requests/delegation';
import EncodeMemo from 'src/dialog/pages/requests/encode-memo';
import EncodeWithKeys from 'src/dialog/pages/requests/encode-with-keys';
import Post from 'src/dialog/pages/requests/post';
import PowerDown from 'src/dialog/pages/requests/power/power-down';
import PowerUp from 'src/dialog/pages/requests/power/power-up';
import CreateProposal from 'src/dialog/pages/requests/proposals/create-proposal';
import RemoveProposal from 'src/dialog/pages/requests/proposals/remove-proposal';
import UpdateProposalVote from 'src/dialog/pages/requests/proposals/update-proposal-vote';
import Proxy from 'src/dialog/pages/requests/proxy';
import RecurrentTransfer from 'src/dialog/pages/requests/recurrent-transfer';
import SendToken from 'src/dialog/pages/requests/send-token';
import SignBuffer from 'src/dialog/pages/requests/sign-buffer';
import SignTx from 'src/dialog/pages/requests/sign-tx';
import Swap from 'src/dialog/pages/requests/swap';
import Transfer from 'src/dialog/pages/requests/transfer';
import Vote from 'src/dialog/pages/requests/vote';
import VscCallContract from 'src/dialog/pages/requests/vsc-call-contract';
import VscDeposit from 'src/dialog/pages/requests/vsc-deposit';
import VscStaking from 'src/dialog/pages/requests/vsc-staking';
import VscTransfer from 'src/dialog/pages/requests/vsc-transfer';
import VscWithdrawal from 'src/dialog/pages/requests/vsc-withdrawal';
import WitnessVote from 'src/dialog/pages/requests/witness-vote';

type Props = {
  data: RequestMessage;
};

type RequestMessage = {
  command: DialogCommand.SEND_DIALOG_CONFIRM;
  data: KeychainRequest;
  rpc: Rpc;
  tab: number;
  domain: string;
  accounts?: string[];
  hiveEngineConfig: HiveEngineConfig;
};

const RequestConfirmation = ({ data }: Props) => {
  switch (data.data.type) {
    case KeychainRequestTypes.addAccount:
      return <AddAccount {...data} data={data.data} />;
    case KeychainRequestTypes.vote:
      return <Vote {...data} data={data.data} />;
    case KeychainRequestTypes.decode:
      return <DecodeMemo {...data} data={data.data} />;
    case KeychainRequestTypes.encode:
      return <EncodeMemo {...data} data={data.data} />;
    case KeychainRequestTypes.encodeWithKeys:
      return <EncodeWithKeys {...data} data={data.data} />;
    case KeychainRequestTypes.custom:
      return <CustomJson {...data} data={data.data} />;
    case KeychainRequestTypes.signBuffer:
      return <SignBuffer {...data} data={data.data} />;
    case KeychainRequestTypes.updateProposalVote:
      return <UpdateProposalVote {...data} data={data.data} />;
    case KeychainRequestTypes.transfer:
      return <Transfer {...data} data={data.data} />;
    case KeychainRequestTypes.addAccountAuthority:
      return <AddAccountAuthority {...data} data={data.data} />;
    case KeychainRequestTypes.removeAccountAuthority:
      return <RemoveAccountAuthority {...data} data={data.data} />;
    case KeychainRequestTypes.addKeyAuthority:
      return <AddKeyAuthority {...data} data={data.data} />;
    case KeychainRequestTypes.removeKeyAuthority:
      return <RemoveKeyAuthority {...data} data={data.data} />;
    case KeychainRequestTypes.delegation:
      return <Delegation {...data} data={data.data} />;
    case KeychainRequestTypes.powerUp:
      return <PowerUp {...data} data={data.data} />;
    case KeychainRequestTypes.powerDown:
      return <PowerDown {...data} data={data.data} />;
    case KeychainRequestTypes.witnessVote:
      return <WitnessVote {...data} data={data.data} />;
    case KeychainRequestTypes.proxy:
      return <Proxy {...data} data={data.data} />;
    case KeychainRequestTypes.signTx:
      return <SignTx {...data} data={data.data} />;
    case KeychainRequestTypes.convert:
      return <Convert {...data} data={data.data} />;
    case KeychainRequestTypes.recurrentTransfer:
      return <RecurrentTransfer {...data} data={data.data} />;
    case KeychainRequestTypes.createProposal:
      return <CreateProposal {...data} data={data.data} />;
    case KeychainRequestTypes.removeProposal:
      return <RemoveProposal {...data} data={data.data} />;
    case KeychainRequestTypes.sendToken:
      return <SendToken {...data} data={data.data} />;
    case KeychainRequestTypes.createClaimedAccount:
      return <CreateClaimedAccount {...data} data={data.data} />;
    case KeychainRequestTypes.post:
      return <Post {...data} data={data.data} />;
    case KeychainRequestTypes.broadcast:
      return <Broadcast {...data} data={data.data} />;
    case KeychainRequestTypes.swap:
      return <Swap {...data} data={data.data} />;
    case KeychainRequestTypes.vscCallContract:
      return <VscCallContract {...data} data={data.data} />;
    case KeychainRequestTypes.vscDeposit:
      return <VscDeposit {...data} data={data.data} />;
    case KeychainRequestTypes.vscWithdrawal:
      return <VscWithdrawal {...data} data={data.data} />;
    case KeychainRequestTypes.vscTransfer:
      return <VscTransfer {...data} data={data.data} />;
    case KeychainRequestTypes.vscStaking:
      return <VscStaking {...data} data={data.data} />;
    default:
      return null;
  }
};

export default RequestConfirmation;

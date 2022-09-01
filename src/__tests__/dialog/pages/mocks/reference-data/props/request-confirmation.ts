import { KeychainKeyTypes } from '@interfaces/keychain.interface';
import requestAddAccount from 'src/__tests__/utils-for-testing/data/props/dialog/request-addAccount';
import requestAddAccountAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-addAccountAuthority';
import requestAddKeyAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-addKeyAuthority';
import requestBroadcast from 'src/__tests__/utils-for-testing/data/props/dialog/request-broadcast';
import requestConvert from 'src/__tests__/utils-for-testing/data/props/dialog/request-convert';
import requestCreateClaimedAccount from 'src/__tests__/utils-for-testing/data/props/dialog/request-createClaimedAccount';
import requestCustomJSON from 'src/__tests__/utils-for-testing/data/props/dialog/request-customJSON';
import requestDecodeMemo from 'src/__tests__/utils-for-testing/data/props/dialog/request-decodeMemo';
import requestDelegation from 'src/__tests__/utils-for-testing/data/props/dialog/request-delegation';
import requestEncodeMemo from 'src/__tests__/utils-for-testing/data/props/dialog/request-encodeMemo';
import requestPost from 'src/__tests__/utils-for-testing/data/props/dialog/request-post';
import requestPowerDown from 'src/__tests__/utils-for-testing/data/props/dialog/request-powerDown';
import requestPowerUp from 'src/__tests__/utils-for-testing/data/props/dialog/request-powerUp';
import requestProposals from 'src/__tests__/utils-for-testing/data/props/dialog/request-proposals';
import requestProxy from 'src/__tests__/utils-for-testing/data/props/dialog/request-proxy';
import requestRecurrentTransfer from 'src/__tests__/utils-for-testing/data/props/dialog/request-recurrentTransfer';
import requestRemoveAccountAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-removeAccountAuthority';
import requestRemoveKeyAuthority from 'src/__tests__/utils-for-testing/data/props/dialog/request-removeKeyAuthority';
import requestSendToken from 'src/__tests__/utils-for-testing/data/props/dialog/request-sendToken';
import requestSignBuffer from 'src/__tests__/utils-for-testing/data/props/dialog/request-signBuffer';
import requestSignTx from 'src/__tests__/utils-for-testing/data/props/dialog/request-signTx';
import requestTransfer from 'src/__tests__/utils-for-testing/data/props/dialog/request-transfer';
import requestVote from 'src/__tests__/utils-for-testing/data/props/dialog/request-vote';
import requestWitnessVote from 'src/__tests__/utils-for-testing/data/props/dialog/request-witnessVote';
import {
  PropsRequestAddAccount,
  PropsRequestRemoveProposal,
  PropsRequestSignBuffer,
  PropsRequestsSignTx,
} from 'src/__tests__/utils-for-testing/types/props-types';

const requests = [
  {
    headerKey: 'popup_html_add_account',
    propsRequest: {
      ...requestAddAccount.props,
      data: { ...requestAddAccount.props.data, keys: {} },
    } as PropsRequestAddAccount,
  },
  {
    headerKey: 'dialog_vote',
    propsRequest: requestVote.props,
  },
  {
    headerKey: 'dialog_title_decode',
    propsRequest: requestDecodeMemo.props,
  },
  {
    headerKey: 'dialog_title_encode',
    propsRequest: requestEncodeMemo.props,
  },
  {
    headerKey: 'dialog_title_custom',
    propsRequest: requestCustomJSON.props,
  },
  {
    headerKey: 'dialog_title_sign',
    propsRequest: {
      ...requestSignBuffer.props,
      data: { ...requestSignBuffer.props.data, title: undefined },
    } as PropsRequestSignBuffer,
  },
  {
    headerKey: 'dialog_title_vote_proposal',
    propsRequest: requestProposals.update.props,
  },
  {
    headerKey: 'dialog_title_transfer',
    propsRequest: requestTransfer.props,
  },
  {
    headerKey: 'dialog_title_add_auth',
    propsRequest: requestAddAccountAuthority.props,
  },
  {
    headerKey: 'dialog_title_remove_auth',
    propsRequest: requestRemoveAccountAuthority.props,
  },
  {
    headerKey: 'dialog_title_add_key_auth',
    propsRequest: requestAddKeyAuthority.props,
  },
  {
    headerKey: 'dialog_title_remove_key_auth',
    propsRequest: requestRemoveKeyAuthority.props,
  },
  {
    headerKey: 'dialog_title_delegation',
    propsRequest: requestDelegation.props,
  },
  {
    headerKey: 'dialog_title_powerup',
    propsRequest: requestPowerUp.props,
  },
  {
    headerKey: 'dialog_title_powerdown',
    propsRequest: requestPowerDown.props,
  },
  {
    headerKey: 'dialog_title_wit',
    propsRequest: requestWitnessVote.props,
  },
  {
    headerKey: 'dialog_title_proxy',
    propsRequest: requestProxy.props,
  },
  {
    headerKey: 'dialog_title_sign_tx',
    propsRequest: {
      ...requestSignTx.props,
      data: { ...requestSignTx.props.data, method: KeychainKeyTypes.active },
    } as PropsRequestsSignTx,
  },
  {
    headerKey: 'popup_html_proposal_funded_option_hbd', //TODO key not present on files: popup_html_proposal_funded_option_hbd
    propsRequest: requestConvert.props,
  },
  {
    headerKey: 'dialog_title_recurrent_transfer',
    propsRequest: requestRecurrentTransfer.props,
  },
  {
    headerKey: 'dialog_title_create_proposal',
    propsRequest: requestProposals.create.props,
  },
  {
    headerKey: 'dialog_title_remove_proposal',
    propsRequest: {
      ...requestProposals.remove.props,
      data: { ...requestProposals.remove.props.data, proposal_ids: [1] },
    } as PropsRequestRemoveProposal,
  },
  {
    headerKey: 'dialog_title_token',
    propsRequest: requestSendToken.props,
  },
  {
    headerKey: 'dialog_title_create_account',
    propsRequest: requestCreateClaimedAccount.props,
  },
  {
    headerKey: 'dialog_title_post',
    propsRequest: requestPost.props,
  },
  {
    headerKey: 'dialog_title_broadcast',
    propsRequest: requestBroadcast.props,
  },
  {
    default: true,
    headerKey: 'not_used',
    propsRequest: { data: {} },
  },
];

export default { requests };

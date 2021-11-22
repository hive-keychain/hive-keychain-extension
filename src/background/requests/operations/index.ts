import { getRequestHandler } from '@background/requests';
import { removeWindow } from '@background/requests/dialog-lifecycle';
import sendErrors from '@background/requests/errors';
import { addAccount } from '@background/requests/operations/ops/add-account';
import { KeychainRequest } from '@interfaces/keychain.interface';

export const performOperation = async (
  data: KeychainRequest,
  tab: number,
  no_confirm: boolean,
) => {
  let message = null;
  try {
    console.info('-- PERFORMING TRANSACTION --');
    console.info(data);
    //   if (data.rpc) await rpc.setOptions(data.rpc, true);
    switch (data.type) {
      //     case "custom":
      //       message = await broadcastCustomJson(data);
      //       break;
      //     case "vote":
      //       message = await broadcastVote(data);
      //       break;
      //     case "transfer":
      //       message = await broadcastTransfer(data);
      //       break;
      //     case "post":
      //       message = await broadcastPost(data);
      //       break;
      //     case "addAccountAuthority":
      //       message = await broadcastAddAccountAuthority(data);
      //       break;
      //     case "removeAccountAuthority":
      //       message = await broadcastRemoveAccountAuthority(data);
      //       break;
      //     case "addKeyAuthority":
      //       message = await broadcastAddKeyAuthority(data);
      //       break;
      //     case "removeKeyAuthority":
      //       message = await broadcastRemoveKeyAuthority(data);
      //       break;
      //     case "broadcast":
      //       message = await broadcastData(data);
      //       break;
      //     case "createClaimedAccount":
      //       message = await broadcastCreateClaimedAccount(data);
      //       break;
      //     case "signedCall":
      //       message = await broadcastSignedCall(data);
      //       break;
      //     case "delegation":
      //       message = await broadcastDelegation(data);
      //       break;
      //     case "witnessVote":
      //       message = await broadcastWitnessVote(data);
      //       break;
      //     case "proxy":
      //       message = await broadcastProxy(data);
      //       break;
      //     case "powerUp":
      //       message = await broadcastPowerUp(data);
      //       break;
      //     case "powerDown":
      //       message = await broadcastPowerDown(data);
      //       break;
      //     case "sendToken":
      //       message = await broadcastSendToken(data);
      //       break;
      //     case "createProposal":
      //       message = await broadcastCreateProposal(data);
      //       break;
      //     case "updateProposalVote":
      //       message = await broadcastUpdateProposalVote(data);
      //       break;
      //     case "removeProposal":
      //       message = await broadcastRemoveProposal(data);
      //       break;
      //     case "decode":
      //       message = await decodeMessage(data);
      //       break;
      //     case "encode":
      //       message = await encodeMessage(data);
      //       break;
      //     case "signBuffer":
      //       message = await signBuffer(data);
      //       break;
      //     case "signTx":
      //       message = await signTx(data);
      //       break;
      case 'addAccount':
        message = await addAccount(data);
        break;
      //     case "convert":
      //       message = await convert(data);
      //       break;
      //     case "recurrentTransfer":
      //       message = await recurrentTransfer(data);
      //       break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    console.log('error', e);
    sendErrors(
      tab,
      e + '',
      chrome.i18n.getMessage('unknown_error'),
      chrome.i18n.getMessage('unknown_error'),
      data,
    );
  } finally {
    if (no_confirm) {
      if (!!getRequestHandler().windowId) {
        removeWindow(getRequestHandler().windowId!);
      }
    } else chrome.runtime.sendMessage(message);
    getRequestHandler().reset();
    // TODO: rpc.rollback();
  }
};

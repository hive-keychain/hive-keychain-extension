import { RequestsHandler } from '@background/requests';
import sendErrors from '@background/requests/errors';
import { KeychainRequest } from '@interfaces/keychain.interface';
import Logger from 'src/utils/logger.utils';

export const performOperation = async (
  requestHandler: RequestsHandler,
  data: KeychainRequest,
  tab: number,
  domain: string,
  no_confirm: boolean,
) => {
  let message = null;
  try {
    Logger.info('-- PERFORMING TRANSACTION --');
    Logger.log(data);
    switch (
      data.type
      // case KeychainRequestTypes.addAccount:
      //   message = await addAccount(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.custom:
      //   message = await broadcastCustomJson(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.vote:
      //   message = await broadcastVote(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.transfer:
      //   message = await broadcastTransfer(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.post:
      //   message = await broadcastPost(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.addAccountAuthority:
      //   message = await broadcastAddAccountAuthority(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.removeAccountAuthority:
      //   message = await broadcastRemoveAccountAuthority(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.addKeyAuthority:
      //   message = await broadcastAddKeyAuthority(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.removeKeyAuthority:
      //   message = await broadcastRemoveKeyAuthority(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.broadcast:
      //   message = await broadcastOperations(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.createClaimedAccount:
      //   message = await broadcastCreateClaimedAccount(requestHandler, data);
      //   break;

      // case KeychainRequestTypes.delegation:
      //   message = await broadcastDelegation(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.witnessVote:
      //   message = await broadcastWitnessVote(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.proxy:
      //   message = await broadcastProxy(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.powerUp:
      //   message = await broadcastPowerUp(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.powerDown:
      //   message = await broadcastPowerDown(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.sendToken:
      //   message = await broadcastSendToken(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.createProposal:
      //   message = await broadcastCreateProposal(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.updateProposalVote:
      //   message = await broadcastUpdateProposalVote(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.removeProposal:
      //   message = await broadcastRemoveProposal(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.decode:
      //   message = await decodeMessage(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.encode:
      //   message = await encodeMessage(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.signBuffer:
      //   message = await signBuffer(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.signTx:
      //   message = await signTx(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.convert:
      //   message = await convert(requestHandler, data);
      //   break;
      // case KeychainRequestTypes.recurrentTransfer:
      //   message = await recurrentTransfer(requestHandler, data);
      //   break;
    ) {
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    Logger.error(e);
    sendErrors(
      requestHandler,
      tab,
      e + '',
      chrome.i18n.getMessage('unknown_error'),
      chrome.i18n.getMessage('unknown_error'),
      data,
    );
  } finally {
    // if (no_confirm) {
    //   addToWhitelist(data.username!, domain, data.type);
    //   if (!!requestHandler.data.windowId) {
    //     removeWindow(requestHandler.data.windowId!);
    //   }
    // } else chrome.runtime.sendMessage(message);
    // requestHandler.reset(false);
  }
};

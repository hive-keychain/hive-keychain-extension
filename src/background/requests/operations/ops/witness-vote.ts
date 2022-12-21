import { RequestsHandler } from '@background/requests';
import { createMessage } from '@background/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';
import { Witness } from '@interfaces/witness.interface';
import { KeychainError } from 'src/keychain-error';
import WitnessUtils from 'src/utils/witness.utils';

export const broadcastWitnessVote = async (
  requestHandler: RequestsHandler,
  data: RequestWitnessVote & RequestId,
) => {
  let result,
    err,
    err_message = null;

  try {
    let key = requestHandler.data.key;
    if (!key) {
      [key] = requestHandler.getUserKeyPair(
        data.username!,
        KeychainKeyTypesLC.active,
      ) as [string, string];
    }

    result = await WitnessUtils.updateWitnessVote(
      data.username!,
      { name: data.witness } as Witness,
      data.vote,
      key,
    );
  } catch (e: any) {
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      data.vote
        ? await chrome.i18n.getMessage('bgd_ops_witness_voted', [data.witness])
        : await chrome.i18n.getMessage('bgd_ops_witness_unvoted', [
            data.witness,
          ]),
      err_message,
    );
    return message;
  }
};

import { EvmRequest } from '@interfaces/evm-provider.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as ObjectHash from 'object-hash';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export interface SavedRequest {
  request: EvmRequest;
  timestamp: number;
  domain: string;
}

export interface LastHashes {
  [hash: string]: SavedRequest;
}

export const checkRequestHash = async (request: EvmRequest, domain: string) => {
  const requestWithoutRequestId = {
    method: request.method,
    params: request.params,
  };
  const hash = ObjectHash.MD5(requestWithoutRequestId);

  console.log({ request });
  const REQUEST_TO_CHECK = ['eth_sendTransaction'];

  if (!REQUEST_TO_CHECK.includes(request.method)) return;

  let lastHashes: LastHashes = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_HASH,
  );

  if (lastHashes) {
    if (!lastHashes[hash]) {
      lastHashes[hash] = {
        request,
        timestamp: Date.now(),
        domain,
      };
    } else {
      if (lastHashes[hash].domain === domain) return lastHashes[hash];
    }
  } else {
    lastHashes = {
      [hash]: {
        request: request,
        timestamp: Date.now(),
        domain,
      },
    };
  }
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_HASH,
    lastHashes,
  );
};

export const EvmWarningUtils = { checkRequestHash };

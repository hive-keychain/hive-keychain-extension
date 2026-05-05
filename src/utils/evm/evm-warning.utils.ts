import { EvmRequest } from '@interfaces/evm-provider.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import * as ObjectHash from 'object-hash';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const EXPIRATION_TIME_IN_MINUTES =
  Number(process.env.DUPLICATE_REQUEST_EXPIRATION_TIME_IN_MINUTES) || 60;

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

  const REQUEST_TO_CHECK = ['eth_sendTransaction'];

  if (!REQUEST_TO_CHECK.includes(request.method)) return;

  let lastHashes: LastHashes = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_HASH,
  );

  let foundHash;

  if (lastHashes) {
    if (!lastHashes[hash]) {
      lastHashes[hash] = {
        request,
        timestamp: Date.now(),
        domain,
      };
    } else {
      if (
        lastHashes[hash].domain === domain &&
        lastHashes[hash].timestamp >
          Date.now() - EXPIRATION_TIME_IN_MINUTES * 60 * 1000
      )
        foundHash = lastHashes[hash];
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

  // clear expired requests
  for (const key in lastHashes) {
    if (
      lastHashes[key].timestamp <
      Date.now() - EXPIRATION_TIME_IN_MINUTES * 60 * 1000
    ) {
      delete lastHashes[key];
    }
  }

  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_LAST_HASH,
    lastHashes,
  );

  return foundHash;
};

export const EvmWarningUtils = { checkRequestHash };

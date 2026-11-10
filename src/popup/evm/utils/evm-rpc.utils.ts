import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmRpcUrlUtils } from '@popup/evm/utils/evm-rpc-url.utils';
import {
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  createRpcFetchRequest,
  EtherJsonRpcProvider,
} from 'src/utils/evm/ether-json-rpc-provider';
import { ethers } from 'ethers';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const RPC_STATUS_CHECK_TIMEOUT_MS = 1000;

/** True when retrying the same JSON-RPC on another endpoint may help (transport / node issues). */
export const isEvmRpcInfrastructureFailure = (err: unknown): boolean => {
  if (err == null) {
    return false;
  }
  if (typeof err !== 'object') {
    return true;
  }
  const e = err as { code?: string; message?: string; shortMessage?: string };
  switch (e.code) {
    case 'NETWORK_ERROR':
    case 'SERVER_ERROR':
    case 'TIMEOUT':
    case 'UNKNOWN_ERROR':
      return true;
    default:
      break;
  }
  const text = [e.message, e.shortMessage]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!text) {
    return false;
  }
  return (
    text.includes('fetch') ||
    text.includes('failed to fetch') ||
    text.includes('network') ||
    text.includes('429') ||
    text.includes('too many requests') ||
    text.includes('rate limit') ||
    text.includes('ratelimit') ||
    text.includes('econnrefused') ||
    text.includes('etimedout') ||
    text.includes('socket') ||
    text.includes('timeout') ||
    text.includes('503') ||
    text.includes('502') ||
    text.includes('504')
  );
};

const call = async (method: string, params: any[], rpcUrl: string) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
  });

  return await new Promise((resolve, reject) => {
    try {
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res: any) => {
          return res.json();
        })
        .then((res: any) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

const getRpcUrlsForChain = (
  chain: EvmChain,
  allCustomRpcs: Record<string, MultichainRpc[]>,
): string[] => [
  ...chain.rpcs.map((rpc) => rpc.url),
  ...(allCustomRpcs[chain.chainId] ?? []).map(
    (rpc: MultichainRpc) => rpc.url,
  ),
];

const addCustomRpc = async (rpc: MultichainRpc, chain: EvmChain) => {
  EvmRpcUrlUtils.assertValidHttpOrHttpsRpcUrl(rpc.url);
  const allCustomRpcs =
    ((await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
    )) as Record<string, MultichainRpc[]>) ?? {};
  if (getRpcUrlsForChain(chain, allCustomRpcs).includes(rpc.url)) return;

  if (!allCustomRpcs[chain.chainId]) {
    allCustomRpcs[chain.chainId] = [];
  }
  allCustomRpcs[chain.chainId].push(rpc);
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
    allCustomRpcs,
  );
};

const addCustomRpcsFromList = async (rpcs: string[], chain: EvmChain) => {
  EvmRpcUrlUtils.assertValidHttpsRpcUrls(rpcs);
  const allCustomRpcs =
    ((await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
    )) as Record<string, MultichainRpc[]>) ?? {};
  if (!allCustomRpcs[chain.chainId]) {
    allCustomRpcs[chain.chainId] = [];
  }
  const rpcUrlsForChain = getRpcUrlsForChain(chain, allCustomRpcs);
  let hasNewRpc = false;
  for (const rpc of rpcs) {
    if (!rpcUrlsForChain.includes(rpc)) {
      allCustomRpcs[chain.chainId].push({
        url: rpc,
        isDefault: false,
      });
      rpcUrlsForChain.push(rpc);
      hasNewRpc = true;
    }
  }
  if (!hasNewRpc) return;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
    allCustomRpcs,
  );
};

const deleteCustomRpc = async (rpcToDelete: MultichainRpc, chain: EvmChain) => {
  const allCustomRpcs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
  );
  if (allCustomRpcs && allCustomRpcs[chain.chainId]) {
    allCustomRpcs[chain.chainId] = allCustomRpcs[chain.chainId].filter(
      (savedRpc: MultichainRpc) => savedRpc.url !== rpcToDelete.url,
    );
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
      allCustomRpcs,
    );
  }
};

const getActiveRpc = async (chain: EvmChain): Promise<MultichainRpc> => {
  const activeRpcs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACTIVE_RPCS,
  );
  if (activeRpcs && activeRpcs[chain.chainId]) {
    return activeRpcs[chain.chainId];
  } else {
    return chain.rpcs[0];
  }
};

const setActiveRpc = async (rpc: MultichainRpc, chain: EvmChain) => {
  EvmRpcUrlUtils.assertValidHttpOrHttpsRpcUrl(rpc.url);
  let activeRpcs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACTIVE_RPCS,
  );
  if (!activeRpcs) {
    activeRpcs = {};
  }
  activeRpcs[chain.chainId] = rpc;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_ACTIVE_RPCS,
    activeRpcs,
  );
  await EthersUtils.setProvider(chain, rpc.url);
};

const getRpcListForChain = async (
  chain: EvmChain,
  includeCustom: boolean = true,
): Promise<MultichainRpc[]> => {
  let rpcList = chain.rpcs;

  if (includeCustom) {
    const allCustomRpcs = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
    );
    if (allCustomRpcs && allCustomRpcs[chain.chainId]) {
      rpcList = [...rpcList, ...allCustomRpcs[chain.chainId]];
    }
  }

  return rpcList;
};

const getSwitchRpcAuto = async (chain: EvmChain): Promise<boolean> => {
  const switchRpcAuto = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SWITCH_RPC_AUTO,
  );
  if (!switchRpcAuto) return true;
  return switchRpcAuto[chain.chainId] !== undefined
    ? switchRpcAuto[chain.chainId]
    : true;
};

const saveSwitchRpcAuto = async (chain: EvmChain, switchRpcAuto: boolean) => {
  let switchRpcAutoList = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_SWITCH_RPC_AUTO,
  );
  if (!switchRpcAutoList) {
    switchRpcAutoList = {};
  }
  switchRpcAutoList[chain.chainId] = switchRpcAuto;
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_SWITCH_RPC_AUTO,
    switchRpcAutoList,
  );
};

const checkRpcStatus = async (uri: string): Promise<boolean> => {
  const rpcProvider = new EtherJsonRpcProvider(
    createRpcFetchRequest(uri),
    undefined,
    {},
  );
  try {
    const ok = await Promise.race([
      rpcProvider
        .send('eth_blockNumber', [])
        .then(() => true)
        .catch(() => {
          return false;
        }),
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          try {
            rpcProvider.destroy();
          } catch {
            // ignore
          }
          resolve(false);
        }, RPC_STATUS_CHECK_TIMEOUT_MS);
      }),
    ]);
    try {
      rpcProvider.destroy();
    } catch {
      // ignore
    }
    return ok;
  } catch {
    try {
      rpcProvider.destroy();
    } catch {
      // ignore
    }
    return false;
  }
};

const getRpcChainIdWithTimeout = async (
  provider: ethers.JsonRpcProvider,
): Promise<unknown> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      provider.send('eth_chainId', []),
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(
          () => resolve(null),
          RPC_STATUS_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const isValidRpcForChainId = async (
  rpcUrl: string,
  expectedChainId: string,
  allowHttp: boolean = false,
): Promise<boolean> => {
  const isValidUrl = allowHttp
    ? EvmRpcUrlUtils.isValidHttpOrHttpsRpcUrl(rpcUrl)
    : EvmRpcUrlUtils.isValidHttpsRpcUrl(rpcUrl);
  if (!isValidUrl) {
    return false;
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  try {
    const chainId = await getRpcChainIdWithTimeout(provider);
    return (
      typeof chainId === 'string' &&
      chainId.toLowerCase() === expectedChainId.toLowerCase()
    );
  } catch {
    return false;
  } finally {
    try {
      provider.destroy();
    } catch {
      // ignore
    }
  }
};

export const filterValidRpcsForChainId = async (
  rpcUrls: string[],
  expectedChainId: string,
): Promise<string[]> => {
  const uniqueRpcUrls = [...new Set(rpcUrls)];

  const checks = await Promise.all(
    uniqueRpcUrls.map(async (rpcUrl) => ({
      rpcUrl,
      isValid: await isValidRpcForChainId(rpcUrl, expectedChainId),
    })),
  );

  return checks
    .filter(({ isValid }) => isValid)
    .map(({ rpcUrl }) => rpcUrl);
};

// Returning null, it means that no rpc is working
const switchToWorkingRpc = async (chain: EvmChain) => {
  const allRpcs = await getRpcListForChain(chain);
  for (const rpc of allRpcs) {
    const rpcStatusOk = await checkRpcStatus(rpc.url);
    if (rpcStatusOk) {
      return rpc;
    }
  }
  return null;
};

// Returning false, it means that no rpc is working
const automaticallySwitchToWorkingRpc = async (chain: EvmChain) => {
  const allRpcs = await getRpcListForChain(chain);
  for (const rpc of allRpcs) {
    const rpcStatusOk = await checkRpcStatus(rpc.url);
    if (rpcStatusOk) {
      Logger.info('EVM RPC automatically switched to ' + rpc.url);
      await setActiveRpc(rpc, chain);
      return true;
    }
  }
  return false;
};

export const EvmRpcUtils = {
  call,
  getRpcListForChain,
  getActiveRpc,
  setActiveRpc,
  addCustomRpc,
  deleteCustomRpc,
  getSwitchRpcAuto,
  saveSwitchRpcAuto,
  checkRpcStatus,
  switchToWorkingRpc,
  automaticallySwitchToWorkingRpc,
  addCustomRpcsFromList,
  isEvmRpcInfrastructureFailure,
  isValidRpcForChainId,
  filterValidRpcsForChainId,
};

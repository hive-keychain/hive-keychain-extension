import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import {
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { EtherJsonRpcProvider } from 'src/utils/evm/ether-json-rpc-provider';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

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

const addCustomRpc = async (rpc: MultichainRpc, chain: EvmChain) => {
  let allCustomRpcs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
  );
  if (!allCustomRpcs) {
    allCustomRpcs = {};
  }
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
  let allCustomRpcs = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_CUSTOM_RPC_LIST,
  );
  if (!allCustomRpcs) {
    allCustomRpcs = {};
  }
  if (!allCustomRpcs[chain.chainId]) {
    allCustomRpcs[chain.chainId] = [];
  }
  for (const rpc of rpcs) {
    if (
      !allCustomRpcs[chain.chainId]
        .map((rpc: MultichainRpc) => rpc.url)
        .includes(rpc)
    ) {
      allCustomRpcs[chain.chainId].push({
        url: rpc,
        isDefault: false,
      });
    }
  }
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
  const rpcProvider = new EtherJsonRpcProvider(uri, undefined, {});
  try {
    const ok = await Promise.race([
      rpcProvider
        .send('eth_blockNumber', [])
        .then(() => true)
        .catch((err) => {
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
        }, 1000);
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
};

import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { evmRequestWithConfirmation } from '@background/evm/requests/logic/evmRequestWithConfirmation.logic';
import { evmRequestWithoutConfirmation } from '@background/evm/requests/logic/evmRequestWithoutConfirmation.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: EvmRequestHandler,
) => {
  const mk = await MkModule.getMk();
  Logger.info('Initializing EVM request logic');
  const accounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );

  console.log({ request, tab, domain, requestHandler });

  if (!accounts) {
    initializeWallet(requestHandler, tab!, request);
  } else if (!mk) {
    unlockWallet(
      requestHandler,
      tab!,
      request,
      domain,
      DialogCommand.UNLOCK_EVM,
    );
  } else if (Object.values(UnrestrictedMethodsEnum).includes(request.method)) {
    //TODO: implement features that do not need confirmation
    evmRequestWithoutConfirmation(requestHandler, tab!, request, domain);
  } else {
    const rebuiltAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    console.log('in init', { requestHandler });
    requestHandler.accounts = rebuiltAccounts.map(
      (account) => account.wallet.address,
    );
    console.log('evnRequestWithConfirmatio');
    evmRequestWithConfirmation(requestHandler, tab!, request, domain);
  }

  // Logic.requestWithConfirmation(
  //   requestHandler,
  //   tab!,
  //   req,
  //   domain,
  //   rpc,
  // );

  requestHandler.saveInLocalStorage();
};

export enum UnrestrictedMethodsEnum {
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_coinbase',
  'eth_decrypt',
  'eth_estimateGas',
  'eth_feeHistory',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getEncryptionPublicKey',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_getWork',
  'eth_hashrate',
  'eth_mining',
  'eth_newBlockFilter',
  'eth_newFilter',
  'eth_newPendingTransactionFilter',
  'eth_protocolVersion',
  'eth_requestAccounts',
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_submitHashrate',
  'eth_submitWork',
  'eth_subscribe',
  'eth_syncing',
  'eth_uninstallFilter',
  'eth_unsubscribe',
  'metamask_getProviderState',
  'metamask_logWeb3ShimUsage',
  'metamask_sendDomainMetadata',
  'metamask_watchAsset',
  'net_listening',
  'net_peerCount',
  'net_version',
  'personal_ecRecover',
  'personal_sign',
  'wallet_addEthereumChain',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'wallet_registerOnboarding',
  'wallet_switchEthereumChain',
  'wallet_watchAsset',
  'wallet_invokeKeyring',
  'web3_clientVersion',
  'web3_sha3',
}

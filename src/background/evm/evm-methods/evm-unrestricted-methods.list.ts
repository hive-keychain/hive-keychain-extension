export const EvmUnrestrictedMethods = [
  'eth_accounts',
  'eth_requestAccounts',
  'eth_blockNumber', // OK
  'eth_call', // TODO
  'eth_chainId', // OK
  'eth_coinbase', // TODO Check to confirm
  'eth_estimateGas', // TODO check params
  'eth_feeHistory', // TODO see where to get data
  'eth_gasPrice', // TODO see where to get data
  'eth_getBalance', // OK
  'eth_getBlockByHash', // OK
  'eth_getBlockByNumber', // OK
  'eth_getBlockTransactionCountByHash', // OK
  'eth_getBlockTransactionCountByNumber', // OK
  'eth_getCode', // TODO confirm
  'eth_getFilterChanges', // TODO later
  'eth_getFilterLogs', // TODO later
  'eth_getLogs', // TODO later
  'eth_getProof', // TODO later
  'eth_getStorageAt', // TODO later
  'eth_getTransactionByBlockHashAndIndex', // OK
  'eth_getTransactionByBlockNumberAndIndex', // OK
  'eth_getTransactionByHash', // OK
  'eth_getTransactionCount', // OK
  'eth_getTransactionReceipt', // OK
  'eth_getUncleByBlockHashAndIndex', // OK
  'eth_getUncleByBlockNumberAndIndex', // OK
  'eth_getUncleCountByBlockHash', // OK
  'eth_getUncleCountByBlockNumber', // OK
  'eth_getWork', // OK
  'eth_hashrate', // OK
  'eth_mining', // OK
  'eth_newBlockFilter', // OK
  'eth_newFilter', // OK
  'eth_newPendingTransactionFilter', // OK
  'eth_protocolVersion', // OK
  'eth_requestAccounts', // OK
  'eth_sendRawTransaction', // OK
  'eth_sendTransaction', // TODO doesn't seem to be unrestricted
  //   'eth_signTypedData',
  //   'eth_signTypedData_v1',
  //   'eth_signTypedData_v3',
  //   'eth_signTypedData_v4',
  'eth_submitHashrate', // TODO to test
  'eth_submitWork', // TODO to test
  'eth_subscribe', // TODO to test
  'eth_syncing', // TODO to test
  'eth_uninstallFilter', // OK
  'eth_unsubscribe', // TODO to test
  'metamask_getProviderState',
  'metamask_logWeb3ShimUsage',
  'metamask_sendDomainMetadata',
  'metamask_watchAsset',
  'net_listening',
  'net_peerCount',
  'net_version', // OK
  'personal_ecRecover', // OK
  'wallet_addEthereumChain',
  'wallet_getPermissions', // OK
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'wallet_registerOnboarding',
  'wallet_switchEthereumChain',
  'wallet_watchAsset',
  'wallet_invokeKeyring',
  'web3_clientVersion', // OK
  'web3_sha3', // TODO to test
];

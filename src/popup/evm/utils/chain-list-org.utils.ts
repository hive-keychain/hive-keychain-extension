import { BaseApi } from '@api/base';
import { ChainListOrgChain } from '@popup/evm/interfaces/chain-list-org.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import {
  BlockExplorerType,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';

const CHAINLIST_ORG_RPCS_JSON = 'https://chainlist.org/rpcs.json';

let chainList: ChainListOrgChain[];

const fetchChainListRpcs = async (): Promise<ChainListOrgChain[]> => {
  if (!chainList) {
    const data = await BaseApi.get(CHAINLIST_ORG_RPCS_JSON);
    if (!Array.isArray(data)) {
      throw new Error('ChainList.org: expected a JSON array from rpcs.json');
    }
    chainList = data;
  }
  return chainList as ChainListOrgChain[];
};

const findByChainId = async (
  chainId: number,
): Promise<ChainListOrgChain | undefined> => {
  await fetchChainListRpcs();
  return chainList.find((chain) => chain.chainId === chainId);
};

const getEvmChain = (
  chain: ChainListOrgChain,
  chainId: EvmChain['chainId'],
  chainOverrides: Partial<EvmChain> = {},
): EvmChain => ({
  name: chain.name,
  type: ChainType.EVM,
  mainToken: chain.nativeCurrency.symbol.toUpperCase(),
  defaultTransactionType: EvmTransactionType.EIP_1559,
  logo: chain.icon
    ? `https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg`
    : '',
  chainId,
  rpcs: chain.rpc
    .filter((rpc) => !rpc.url.startsWith('wss://'))
    .map((rpc, index) => ({
      url: rpc.url,
      isDefault: index === 0,
    })),
  blockExplorer: chain.explorers?.[0]?.url
    ? {
        url: chain.explorers[0].url,
        type: BlockExplorerType.BLOCKSCOUT,
      }
    : undefined,
  blockExplorerApi: { url: '', type: BlockExplorerType.BLOCKSCOUT },
  testnet: !!chain.isTestnet,
  isCustom: true,
  active: true,
  disableTokensAndHistoryAutoLoading: true,
  addTokensManually: true,
  manualDiscoverAvailable: false,
  ...chainOverrides,
});

export const ChainListOrgUtils = {
  CHAINLIST_ORG_RPCS_JSON,
  fetchChainListRpcs,
  findByChainId,
  getEvmChain,
};

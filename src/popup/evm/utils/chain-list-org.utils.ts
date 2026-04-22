import { BaseApi } from '@api/base';
import { ChainListOrgChain } from '@popup/evm/interfaces/chain-list-org.interface';

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

export const ChainListOrgUtils = {
  CHAINLIST_ORG_RPCS_JSON,
  fetchChainListRpcs,
  findByChainId,
};

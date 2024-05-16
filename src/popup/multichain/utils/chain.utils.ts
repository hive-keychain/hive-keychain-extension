import {
  BlockExporerType,
  Chain,
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { SVGIcons } from 'src/common-ui/icons.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getDefaultChains = (): Chain[] => {
  return [
    {
      name: 'HIVE',
      type: ChainType.HIVE,
      logo: SVGIcons.BLOCKCHAIN_HIVE,
      chainId:
        'beeab0de00000000000000000000000000000000000000000000000000000000',
      mainTokens: {
        hbd: 'HBD',
        hive: 'HIVE',
        hp: 'HP',
      },
    } as HiveChain,
    {
      name: 'Ethereum',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_ETHEREUM,
      chainId: '0x1',
      mainToken: 'ETH',
      blockExplorer: {
        type: BlockExporerType.ETHERSCAN,
        url: 'https://api.etherscan.io/api',
      },
      isEth: true,
    } as EvmChain,
    {
      name: 'Avalanche',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_AVALANCHE,
      chainId: '0xa86a',
      mainToken: 'AVAX',
      network: 'avaxcchain',
      blockExplorer: {
        type: BlockExporerType.ETHERSCAN,
        url: 'https://snowscan.xyz',
      },
    } as EvmChain,
    {
      name: 'BNB',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_BNB,
      chainId: '0x38',
      mainToken: 'BNB',
      network: 'bsc',
      blockExplorer: {
        type: BlockExporerType.ETHERSCAN,
        url: 'https://bscscan.com',
      },
    } as EvmChain,
    {
      name: 'Polygon',
      type: ChainType.EVM,
      logo: SVGIcons.BLOCKCHAIN_POLYGON,
      chainId: '0x89',
      mainToken: 'MATIC',
      network: 'polygon',
      blockExplorer: {
        type: BlockExporerType.ETHERSCAN,
        url: 'https://polygonscan.com',
      },
    } as EvmChain,
    {
      name: 'Sepolia-ETH',
      chainId: '11155111',
      type: ChainType.EVM,
      logo: 'https://moralis.io/wp-content/uploads/web3wiki/1147-sepolia/637aee14aa9d9f521437ec16_hYC2y965v3QD7fEoVvutzGbJzVGLSOk6RZPwEQWcA_E.jpeg',
      mainToken: 'SepoliaEth',
      network: 'sepolia',
      blockExplorer: {
        type: BlockExporerType.ETHERSCAN,
        url: 'https://api-sepolia.etherscan.io',
      },
      testnet: true,
      isEth: true,
    } as EvmChain,
  ];
};

const getSetupChains = async (): Promise<Chain[]> => {
  const chains: Chain[] = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );

  if (!chains.some((c: Chain) => c.type === ChainType.HIVE)) {
    chains.push(getDefaultChains().find((c) => c.name === 'HIVE')!);
  }
  if (!chains.some((c: Chain) => c.type === ChainType.EVM)) {
    chains.push(getDefaultChains().find((c) => c.name === 'Ethereum')!);
  }

  return chains;
};

const getNonSetupChains = async (): Promise<Chain[]> => {
  let [setupChains, allChains] = await Promise.all([
    LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.SETUP_CHAINS,
    ),
    getDefaultChains(),
  ]);

  if (!setupChains) setupChains = [];

  return allChains.filter(
    (chain: Chain) =>
      !(setupChains as Chain[]).map((c) => c.name).includes(chain.name),
  );
};

const addChainToSetupChains = async (chain: Chain) => {
  let chains = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  if (!chains) chains = [];
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    [...chains, chain],
  );
};
const removeChainFromSetupChains = async (chain: Chain) => {
  const chains = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
  );
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.SETUP_CHAINS,
    chains.filter((c: Chain) => c.name !== chain.name),
  );
};

export const ChainUtils = {
  getDefaultChains,
  getSetupChains,
  addChainToSetupChains,
  removeChainFromSetupChains,
  getNonSetupChains,
};

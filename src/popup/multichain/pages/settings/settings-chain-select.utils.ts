import { OptionItem } from '@common-ui/custom-select/custom-select.component';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

export type SettingsChainOptionValue =
  | { type: ChainType.HIVE }
  | { type: ChainType.EVM; chain: EvmChain };

export type SettingsChainOption = OptionItem & {
  value: SettingsChainOptionValue;
};

export const buildHiveSettingsOption = (): SettingsChainOption => ({
  label: 'Hive',
  value: { type: ChainType.HIVE as ChainType.HIVE },
  img: SVGIcons.BLOCKCHAIN_HIVE,
});

export const buildEvmSettingsOption = (chain: EvmChain): SettingsChainOption => ({
  label: chain.name,
  value: { type: ChainType.EVM as ChainType.EVM, chain },
  img: chain.logo,
  imgChip: chain.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
});

export const isEvmChain = (chain: Chain): chain is EvmChain =>
  chain.type === ChainType.EVM;

export const getSettingsChainOptions = async (
  hasHiveAccounts: boolean,
): Promise<SettingsChainOption[]> => {
  const options: SettingsChainOption[] = [];
  if (hasHiveAccounts) {
    options.push(buildHiveSettingsOption());
  }
  const setupChains = await ChainUtils.getSetupChains(true);
  options.push(...setupChains.filter(isEvmChain).map(buildEvmSettingsOption));
  return options;
};

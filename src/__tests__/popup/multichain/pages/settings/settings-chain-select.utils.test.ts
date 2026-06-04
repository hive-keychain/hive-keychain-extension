import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import {
  buildEvmSettingsOption,
  buildHiveSettingsOption,
  resolveDefaultChainTypeSettingsOption,
  resolveDefaultSettingsChainOption,
} from 'src/popup/multichain/pages/settings/settings-chain-select.utils';
import { SVGIcons } from 'src/common-ui/icons.enum';

const hiveChain = {
  type: ChainType.HIVE,
  chainId: 'hive',
  name: 'Hive',
} as Chain;

const ethereumChain = {
  type: ChainType.EVM,
  chainId: '0x1',
  name: 'Ethereum',
  logo: 'eth-logo',
} as EvmChain;

const polygonChain = {
  type: ChainType.EVM,
  chainId: '0x89',
  name: 'Polygon',
  logo: 'polygon-logo',
} as EvmChain;

describe('settings-chain-select.utils', () => {
  const hiveOption = buildHiveSettingsOption();
  const ethereumOption = buildEvmSettingsOption(ethereumChain);
  const polygonOption = buildEvmSettingsOption(polygonChain);
  const chainOptions = [hiveOption, ethereumOption, polygonOption];

  describe('resolveDefaultSettingsChainOption', () => {
    it('selects Hive when the active chain is Hive', () => {
      expect(
        resolveDefaultSettingsChainOption(chainOptions, hiveChain),
      ).toBe(hiveOption);
    });

    it('selects the matching EVM chain when the active chain is EVM', () => {
      expect(
        resolveDefaultSettingsChainOption(chainOptions, polygonChain),
      ).toBe(polygonOption);
    });

    it('falls back to the first EVM option when the active EVM chain is not listed', () => {
      const unknownEvmChain = {
        type: ChainType.EVM,
        chainId: '0x2105',
        name: 'Base',
      } as EvmChain;

      expect(
        resolveDefaultSettingsChainOption(chainOptions, unknownEvmChain),
      ).toBe(ethereumOption);
    });

    it('matches chain ids case-insensitively', () => {
      const upperCasePolygon = {
        ...polygonChain,
        chainId: '0X89',
      } as EvmChain;

      expect(
        resolveDefaultSettingsChainOption(chainOptions, upperCasePolygon),
      ).toBe(polygonOption);
    });

    it('returns undefined when no options are available', () => {
      expect(resolveDefaultSettingsChainOption([], hiveChain)).toBeUndefined();
    });
  });

  describe('resolveDefaultChainTypeSettingsOption', () => {
    const dappOptions = [
      { label: 'Hive', value: ChainType.HIVE as ChainType.HIVE, img: SVGIcons.BLOCKCHAIN_HIVE },
      { label: 'EVM', value: ChainType.EVM as ChainType.EVM, img: SVGIcons.BLOCKCHAIN_ETHEREUM },
    ];

    it('selects Hive when the active chain is Hive', () => {
      expect(
        resolveDefaultChainTypeSettingsOption(dappOptions, hiveChain),
      ).toBe(dappOptions[0]);
    });

    it('selects EVM when the active chain is EVM', () => {
      expect(
        resolveDefaultChainTypeSettingsOption(dappOptions, ethereumChain),
      ).toBe(dappOptions[1]);
    });
  });
});

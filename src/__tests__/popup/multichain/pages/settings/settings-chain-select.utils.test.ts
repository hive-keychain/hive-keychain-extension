import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import {
  buildEvmSettingsOption,
  buildHiveSettingsOption,
  findRequestedEvmChain,
  getRequestedSettingsChainId,
  resolveDefaultChainTypeSettingsOption,
  resolveDefaultSettingsChainOption,
  selectSettingsNetworkChain,
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

    it('selects the requested chain even when another chain is active', () => {
      expect(
        resolveDefaultSettingsChainOption(chainOptions, ethereumChain, '0x89'),
      ).toBe(polygonOption);
    });

    it('falls back to the active chain when the requested chain is not listed', () => {
      expect(
        resolveDefaultSettingsChainOption(
          chainOptions,
          ethereumChain,
          '0x2105',
        ),
      ).toBe(ethereumOption);
    });
  });

  describe('selectSettingsNetworkChain', () => {
    const bscChain = {
      type: ChainType.EVM,
      chainId: '0x38',
      name: 'Binance Smart Chain',
      logo: 'bsc-logo',
    } as EvmChain;

    it('reads a chain id from navigation params', () => {
      expect(getRequestedSettingsChainId({ chainId: ' 0x38 ' })).toBe('0x38');
      expect(getRequestedSettingsChainId(undefined)).toBeUndefined();
      expect(getRequestedSettingsChainId({ chainId: 56 })).toBeUndefined();
    });

    it('adds and selects a requested chain that is not already listed', () => {
      const selection = selectSettingsNetworkChain(
        chainOptions,
        ethereumChain,
        '0x38',
        bscChain,
      );

      expect(selection.options[0].label).toBe('Binance Smart Chain');
      expect(selection.selected?.label).toBe('Binance Smart Chain');
    });

    it('keeps the existing option when the requested chain is already listed', () => {
      const selection = selectSettingsNetworkChain(
        chainOptions,
        hiveChain,
        '0x89',
        polygonChain,
      );

      expect(selection.options).toBe(chainOptions);
      expect(selection.selected).toBe(polygonOption);
    });
  });

  describe('findRequestedEvmChain', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('finds a supported chain that is not in the setup list', async () => {
      jest.spyOn(ChainUtils, 'getDefaultChains').mockResolvedValue([
        hiveChain,
        polygonChain,
      ]);
      jest.spyOn(ChainUtils, 'getCustomChains').mockResolvedValue([]);

      await expect(findRequestedEvmChain('0X89')).resolves.toBe(polygonChain);
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

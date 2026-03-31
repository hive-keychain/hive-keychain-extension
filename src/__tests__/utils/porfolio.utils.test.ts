import type { ExtendedAccount } from '@hiveio/dhive';
import type { CurrencyPrices } from '@interfaces/bittrex.interface';
import type { Token, TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import CurrencyPricesUtils from '@popup/hive/utils/currency-prices.utils';
import { DynamicGlobalPropertiesUtils } from '@popup/hive/utils/dynamic-global-properties.utils';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { HiveInternalMarketUtils } from '@popup/hive/utils/hive-internal-market.utils';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import HiveUtils from '@popup/hive/utils/hive.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import Config from 'src/config';
import type { UserPortfolio } from 'src/portfolio/portfolio.interface';
import { AsyncUtils } from 'src/utils/async.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

jest.mock('@popup/hive/utils/tokens.utils', () => ({
  __esModule: true,
  default: {
    getHiveEngineTokenValue: jest.fn().mockReturnValue(42.5),
    getUserBalance: jest.fn().mockResolvedValue([]),
    getTokensMarket: jest.fn().mockResolvedValue([]),
    getAllTokens: jest.fn().mockResolvedValue([]),
  },
}));

describe('porfolio.utils', () => {
  describe('getOrderedTokenFullList', () => {
    it('orders symbols by maximum usd value across accounts (descending)', () => {
      const portfolio: UserPortfolio[] = [
        {
          account: 'a',
          balances: [
            { symbol: 'AAA', balance: 0, usdValue: 5 },
            { symbol: 'BBB', balance: 0, usdValue: 100 },
          ],
          totalHive: 0,
          totalUSD: 0,
        },
        {
          account: 'b',
          balances: [
            { symbol: 'AAA', balance: 0, usdValue: 50 },
            { symbol: 'BBB', balance: 0, usdValue: 1 },
          ],
          totalHive: 0,
          totalUSD: 0,
        },
      ];

      expect(
        PortfolioUtils.getOrderedTokenFullList(['AAA', 'BBB'], portfolio),
      ).toEqual(['BBB', 'AAA']);
    });

    it('treats missing token balances as 0 for ordering', () => {
      const portfolio: UserPortfolio[] = [
        {
          account: 'only',
          balances: [{ symbol: 'X', balance: 0, usdValue: 3 }],
          totalHive: 0,
          totalUSD: 0,
        },
      ];

      expect(PortfolioUtils.getOrderedTokenFullList(['X', 'Y'], portfolio)).toEqual(
        ['X', 'Y'],
      );
    });
  });

  describe('getTotals', () => {
    it('sums balances and usd values per column symbol', () => {
      const data: UserPortfolio[] = [
        {
          account: 'u1',
          balances: [
            { symbol: 'HIVE', balance: 2, usdValue: 4 },
            { symbol: 'HBD', balance: 1, usdValue: 1 },
          ],
          totalHive: 0,
          totalUSD: 0,
        },
        {
          account: 'u2',
          balances: [{ symbol: 'HIVE', balance: 3, usdValue: 6 }],
          totalHive: 0,
          totalUSD: 0,
        },
      ];

      expect(PortfolioUtils.getTotals(['HIVE', 'HBD'], data)).toEqual([
        { symbol: 'HIVE', balance: 5, usdValue: 10 },
        { symbol: 'HBD', balance: 1, usdValue: 1 },
      ]);
    });
  });

  describe('generateUserLayerTwoPortolio', () => {
    it('skips hidden symbols and aggregates balances using TokensUtils value', () => {
      const tokensBalance: TokenBalance[] = [
        {
          _id: 1,
          account: 'alice',
          symbol: 'KEEP',
          balance: '10',
          delegationsIn: '0',
          delegationsOut: '2',
          stake: '3',
          pendingUndelegations: '0',
          pendingUnstake: '0',
        },
        {
          _id: 2,
          account: 'alice',
          symbol: 'HIDDEN',
          balance: '99',
          delegationsIn: '0',
          delegationsOut: '0',
          stake: '0',
          pendingUndelegations: '0',
          pendingUnstake: '0',
        },
      ];

      const prices = {
        hive: { usd: 0.5 },
        hive_dollar: { usd: 1 },
      } as unknown as CurrencyPrices;

      const result = PortfolioUtils.generateUserLayerTwoPortolio(
        { username: 'alice', tokensBalance },
        prices,
        [] as TokenMarket[],
        [] as Token[],
        ['HIDDEN'],
      );

      expect(result).toEqual([
        { symbol: 'KEEP', balance: 15, usdValue: 42.5 },
      ]);
    });
  });

  describe('loadAndSetRPCsAndApis', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('configures Hive and Hive-Engine APIs from stored CURRENT_RPC when present', async () => {
      const rpc = { uri: 'https://saved.rpc', testnet: false };
      jest
        .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
        .mockResolvedValue(rpc);
      const setRpc = jest.spyOn(HiveTxUtils, 'setRpc').mockResolvedValue(undefined);
      const setActiveApi = jest
        .spyOn(HiveEngineConfigUtils, 'setActiveApi')
        .mockImplementation();
      const setHistory = jest
        .spyOn(HiveEngineConfigUtils, 'setActiveAccountHistoryApi')
        .mockImplementation();

      await PortfolioUtils.loadAndSetRPCsAndApis();

      expect(setRpc).toHaveBeenCalledWith(rpc);
      expect(setActiveApi).toHaveBeenCalledWith(Config.hiveEngine.rpc);
      expect(setHistory).toHaveBeenCalledWith(Config.hiveEngine.accountHistoryApi);
    });

    it('falls back to Config.rpc.DEFAULT when no RPC is stored', async () => {
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue(undefined);
      const setRpc = jest.spyOn(HiveTxUtils, 'setRpc').mockResolvedValue(undefined);
      jest.spyOn(HiveEngineConfigUtils, 'setActiveApi').mockImplementation();
      jest.spyOn(HiveEngineConfigUtils, 'setActiveAccountHistoryApi').mockImplementation();

      await PortfolioUtils.loadAndSetRPCsAndApis();

      expect(setRpc).toHaveBeenCalledWith(Config.rpc.DEFAULT);
    });
  });

  describe('getPortfolio', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('builds layer-one balances and totals for extended accounts', async () => {
      jest.spyOn(PortfolioUtils, 'loadAndSetRPCsAndApis').mockResolvedValue(undefined);
      jest
        .spyOn(DynamicGlobalPropertiesUtils, 'getDynamicGlobalProperties')
        .mockResolvedValue({
          total_vesting_fund_hive: '1000000',
          total_vesting_shares: '1000000000000',
        } as any);
      jest.spyOn(HiveUtils, 'getCurrentMedianHistoryPrice').mockResolvedValue({} as any);
      jest.spyOn(HiveUtils, 'getRewardFund').mockResolvedValue({} as any);
      jest.spyOn(CurrencyPricesUtils, 'getPrices').mockResolvedValue({
        hive: { usd: 2 },
        hive_dollar: { usd: 1 },
      } as CurrencyPrices);
      (TokensUtils.getUserBalance as jest.Mock).mockResolvedValue([]);
      (TokensUtils.getTokensMarket as jest.Mock).mockResolvedValue([]);
      (TokensUtils.getAllTokens as jest.Mock).mockResolvedValue([]);
      jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockImplementation(
        async (key) => {
          if (key === LocalStorageKeyEnum.HIDDEN_TOKENS) return [];
          return undefined;
        },
      );
      jest
        .spyOn(HiveInternalMarketUtils, 'getHiveInternalMarketOrders')
        .mockResolvedValue({ hive: 1, hbd: 0.5 });
      jest.spyOn(FormatUtils, 'toHP').mockReturnValue(3);
      jest.spyOn(AsyncUtils, 'sleep').mockResolvedValue(undefined);

      const extended: ExtendedAccount = {
        name: 'alice',
        balance: '10.000 HIVE',
        savings_balance: '1.000 HIVE',
        hbd_balance: '2.000 HBD',
        savings_hbd_balance: '0.500 HBD',
        vesting_shares: '1000000.000000 VESTS',
      } as ExtendedAccount;

      const [portfolio, orderedTokenList] = await PortfolioUtils.getPortfolio([
        extended,
      ]);

      expect(orderedTokenList.slice(0, 3)).toEqual(['HIVE', 'HBD', 'HP']);
      expect(portfolio).toHaveLength(1);
      expect(portfolio[0].account).toBe('alice');
      const symbols = portfolio[0].balances.map((b) => b.symbol);
      expect(symbols).toContain('HIVE');
      expect(symbols).toContain('HBD');
      expect(symbols).toContain('HP');
      expect(portfolio[0].totalUSD).toBeGreaterThan(0);
      expect(portfolio[0].totalHive).toBeGreaterThan(0);
    });
  });
});

import { EvmLightNodeApi } from '@api/evm-light-node';
import React, { useEffect, useState } from 'react';
import { BaseApi } from 'src/api/base';
import { KeychainApi } from 'src/api/keychain';
import { WalletTokenPriceChart } from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.component';
import {
  TokenPriceHistory,
  WalletTokenPriceChartUtils,
} from 'src/common-ui/wallet-token-price-chart/wallet-token-price-chart.utils';
import Logger from 'src/utils/logger.utils';

type PortfolioTokenPriceChartProps = {
  symbol: string;
  chainId?: string | null;
  contractAddress?: string | null;
  isHive?: boolean;
  hiveUsd?: number;
};

const emptyPriceHistory = (): TokenPriceHistory => ({
  categories: [],
  seriesByCategory: {},
});

export const PortfolioTokenPriceChart = ({
  symbol,
  chainId,
  contractAddress,
  isHive = false,
  hiveUsd,
}: PortfolioTokenPriceChartProps) => {
  const [priceHistory, setPriceHistory] = useState<TokenPriceHistory | null>(
    null,
  );
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPriceHistory(null);
    setPriceHistoryLoading(true);

    const loadPriceHistory = async () => {
      try {
        if (isHive) {
          const hivePriceHistoryPath =
            WalletTokenPriceChartUtils.buildHivePriceHistoryPath(symbol);
          if (hivePriceHistoryPath) {
            const payload = await KeychainApi.get(hivePriceHistoryPath);
            if (!cancelled) {
              setPriceHistory(
                WalletTokenPriceChartUtils.parsePriceHistoryPayload(payload),
              );
            }
            return;
          }

          const [ohlcvPayload, hivePayload] = await Promise.all([
            BaseApi.get(
              WalletTokenPriceChartUtils.buildHiveEngineOhlcvUrl(symbol),
            ),
            KeychainApi.get('hive/v2/price/hive/history').catch(
              () => undefined,
            ),
          ]);
          const hiveHistory =
            WalletTokenPriceChartUtils.parsePriceHistoryPayload(hivePayload);
          if (!cancelled) {
            setPriceHistory(
              WalletTokenPriceChartUtils.buildHiveEnginePriceHistory(
                Array.isArray(ohlcvPayload) ? ohlcvPayload : [],
                {
                  '24h': hiveHistory.seriesByCategory['24h'] ?? [],
                  '7d': hiveHistory.seriesByCategory['7d'] ?? [],
                },
                hiveUsd,
              ),
            );
          }
          return;
        }

        const historyPath = chainId
          ? WalletTokenPriceChartUtils.buildEvmPriceHistoryPath(
              chainId,
              contractAddress ?? undefined,
            )
          : undefined;
        if (!historyPath) {
          if (!cancelled) {
            setPriceHistory(emptyPriceHistory());
          }
          return;
        }

        const payload = await EvmLightNodeApi.get(historyPath);
        if (!cancelled) {
          setPriceHistory(
            WalletTokenPriceChartUtils.parsePriceHistoryPayload(payload),
          );
        }
      } catch (error) {
        Logger.warn(
          `Token price history unavailable (${symbol}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        if (!cancelled) {
          setPriceHistory(emptyPriceHistory());
        }
      } finally {
        if (!cancelled) {
          setPriceHistoryLoading(false);
        }
      }
    };

    void loadPriceHistory();
    return () => {
      cancelled = true;
    };
  }, [chainId, contractAddress, hiveUsd, isHive, symbol]);

  return (
    <WalletTokenPriceChart
      symbol={symbol}
      priceHistory={priceHistory}
      priceHistoryLoading={priceHistoryLoading}
    />
  );
};

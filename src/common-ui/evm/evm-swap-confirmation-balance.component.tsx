import { BalanceChangeCard } from '@dialog/components/balance-change-card/balance-change-card.component';
import { BalanceChangeCardUtils } from '@dialog/components/balance-change-card/balance-change-card.utils';
import type { BalanceInfo } from '@dialog/components/balance-change-card/balance-change-card.interface';
import {
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmSwapConfirmationBalanceUtils } from '@popup/evm/utils/evm-swap-confirmation-balance.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';

type EvmSwapConfirmationBalanceProps = {
  walletAddress: string;
  chain: EvmChain;
  fromTokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20;
  swapAmount: number;
  swapGasFee?: GasFeeEstimationBase;
  approveGasFee?: GasFeeEstimationBase;
  prefetchedMainTokenInfo?: EvmSmartContractInfoNative;
  onInsufficientBalanceChange?: (hasInsufficientBalance: boolean) => void;
};

export const EvmSwapConfirmationBalance = ({
  walletAddress,
  chain,
  fromTokenInfo,
  swapAmount,
  swapGasFee,
  approveGasFee,
  prefetchedMainTokenInfo,
  onInsufficientBalanceChange,
}: EvmSwapConfirmationBalanceProps) => {
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>();

  useEffect(() => {
    let cancelled = false;

    const loadBalanceInfo = async () => {
      const nextBalanceInfo =
        await EvmSwapConfirmationBalanceUtils.getEvmSwapConfirmationBalanceInfo(
          {
            walletAddress,
            chain,
            fromTokenInfo,
            swapAmount,
            swapGasFee,
            approveGasFee,
            prefetchedMainTokenInfo,
          },
        );

      if (!cancelled) {
        setBalanceInfo(nextBalanceInfo);
      }
    };

    void loadBalanceInfo();

    return () => {
      cancelled = true;
    };
  }, [
    approveGasFee,
    chain,
    fromTokenInfo,
    prefetchedMainTokenInfo,
    swapAmount,
    swapGasFee,
    walletAddress,
  ]);

  useEffect(() => {
    onInsufficientBalanceChange?.(
      BalanceChangeCardUtils.hasInsufficientBalance(balanceInfo),
    );
  }, [balanceInfo, onInsufficientBalanceChange]);

  if (!balanceInfo) {
    return null;
  }

  return <BalanceChangeCard balanceInfo={balanceInfo} />;
};

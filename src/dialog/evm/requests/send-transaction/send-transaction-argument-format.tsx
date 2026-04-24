import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionVerificationInformation } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTokenLogo } from '@popup/evm/pages/home/evm-token-logo/evm-token-logo.component';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmInputDisplayType } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import Decimal from 'decimal.js';
import React from 'react';
import type { SendTransactionHookApi } from 'src/dialog/evm/requests/send-transaction/send-transaction.types';
import FormatUtils from 'src/utils/format.utils';

export function erc20LikeDecimals(usedToken: EvmSmartContractInfo): number {
  return usedToken.type === EVMSmartContractType.ERC20
    ? (usedToken as EvmSmartContractInfoErc20).decimals
    : 18;
}

/** Fallback path: values from `parseData` / heuristic parsing. */
export async function formatFallbackParsedInputValue(
  input: { type: string; value: unknown },
  chainTmp: EvmChain,
  usedToken: EvmSmartContractInfo,
  transactionInfo: EvmTransactionVerificationInformation,
  accounts: EvmAccount[],
  transactionHook: SendTransactionHookApi,
): Promise<unknown> {
  const inputDisplayType = input.type as EvmInputDisplayType;

  switch (inputDisplayType) {
    case EvmInputDisplayType.ADDRESS:
    case EvmInputDisplayType.WALLET_ADDRESS:
    case EvmInputDisplayType.CONTRACT_ADDRESS: {
      const isWalletAddress = await EvmWalletUtils.isWalletAddress(
        input.value as string,
        chainTmp as EvmChain,
      );
      if (isWalletAddress) {
        const inputDisplay = await transactionHook.getWalletAddressInput(
          input.value as string,
          chainTmp.chainId,
          transactionInfo,
          accounts,
        );
        return inputDisplay.value;
      }
      const tokenInfo = await EvmTokensUtils.getTokenInfo(
        chainTmp.chainId,
        input.value as string,
      );
      return tokenInfo && tokenInfo.symbol.length > 0 ? (
        <div className="value-content">
          {usedToken && <EvmTokenLogo tokenInfo={tokenInfo} />}
          <div>{tokenInfo.symbol}</div>
        </div>
      ) : (
        (
          await transactionHook.getWalletAddressInput(
            input.value as string,
            chainTmp.chainId,
            transactionInfo,
            accounts,
          )
        ).value
      );
    }
    case EvmInputDisplayType.BALANCE: {
      const decimals = erc20LikeDecimals(usedToken);
      return `${FormatUtils.withCommas(
        new Decimal(input.value!.toString())
          .div(new Decimal(10).pow(decimals ?? 18))
          .toNumber(),
        decimals ?? 18,
        true,
      )} ${usedToken?.symbol}`;
    }
    case EvmInputDisplayType.UINT256:
    case EvmInputDisplayType.NUMBER:
      return FormatUtils.withCommas(input.value as string | number);
    case EvmInputDisplayType.STRING:
    case EvmInputDisplayType.BYTES:
      return String(input.value);
    default:
      return 'default value';
  }
}

/** Decoded calldata path: one contract argument. */
export async function formatDecodedArgumentDisplayValue(
  inputDisplayType: EvmInputDisplayType,
  argumentValue: unknown,
  usedToken: EvmSmartContractInfo,
  chainTmp: EvmChain,
  transactionInfo: EvmTransactionVerificationInformation,
  accounts: EvmAccount[],
  transactionHook: SendTransactionHookApi,
): Promise<unknown> {
  switch (inputDisplayType) {
    case EvmInputDisplayType.WALLET_ADDRESS: {
      const inputDisplay = await transactionHook.getWalletAddressInput(
        argumentValue as string,
        chainTmp.chainId,
        transactionInfo,
        accounts,
      );
      return inputDisplay.value;
    }
    case EvmInputDisplayType.CONTRACT_ADDRESS:
      return EvmFormatUtils.formatAddress(argumentValue as string);
    case EvmInputDisplayType.BALANCE: {
      const decimals = erc20LikeDecimals(usedToken);
      return `${FormatUtils.withCommas(
        new Decimal(argumentValue!.toString())
          .div(new Decimal(10).pow(decimals ?? 18))
          .toNumber(),
        decimals ?? 18,
        true,
      )}  ${usedToken?.symbol}`;
    }
    case EvmInputDisplayType.NUMBER:
      return FormatUtils.withCommas(argumentValue as string | number);
    case EvmInputDisplayType.STRING:
      return String(argumentValue);
    default:
      return String(argumentValue);
  }
}

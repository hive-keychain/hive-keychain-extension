import type { Operation } from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import { EvmActiveAccount } from '@popup/evm/interfaces/active-account.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import {
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import {
  ConfirmationPageEvmFields,
  ConfirmationPageFields,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import {
  PortfolioEvmTransaction,
  PortfolioHiveTransaction,
  PortfolioQuote,
} from 'src/portfolio/portfolio-api.interface';

export type PortfolioEvmInAppConfirmationContext = {
  kind: 'evm';
  executionId: string;
  quote: PortfolioQuote;
  message: string;
  transaction: PortfolioEvmTransaction;
  account: EvmAccount;
  chain: EvmChain;
  activeAccountOverride: EvmActiveAccount;
  transactionData: ProviderTransactionData;
  fields: ConfirmationPageEvmFields[];
  swapAmount: number;
  fromTokenInfo: EvmSmartContractInfoNative | EvmSmartContractInfoErc20;
  approveTransactionData?: ProviderTransactionData;
  approveFields?: ConfirmationPageEvmFields[];
  onConfirm: (
    gasFee?: GasFeeEstimationBase,
    approveGasFee?: GasFeeEstimationBase,
  ) => Promise<void>;
};

export type PortfolioHiveInAppConfirmationContext = {
  kind: 'hive';
  executionId: string;
  quote: PortfolioQuote;
  message: string;
  transaction: PortfolioHiveTransaction;
  account: LocalAccount;
  activeAccount: ActiveAccount;
  fields: ConfirmationPageFields[];
  onConfirm: (options?: TransactionOptions) => Promise<void>;
};

export type PortfolioInAppConfirmationContext =
  | PortfolioEvmInAppConfirmationContext
  | PortfolioHiveInAppConfirmationContext;

export const getPortfolioHiveOperations = (
  transaction: PortfolioHiveTransaction,
): Operation[] => transaction.operations as Operation[];

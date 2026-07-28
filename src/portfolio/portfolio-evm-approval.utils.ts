import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import {
  ConfirmationPageFields,
  ConfirmationPageFieldType,
} from 'src/common-ui/confirmation-page/confirmation-page.interface';
import {
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
  PortfolioQuote,
} from 'src/portfolio/portfolio-api.interface';
import { PortfolioFlowUtils } from 'src/portfolio/portfolio-flow.utils';

export type PortfolioRequiredApproval = {
  spender: string;
  amount: string;
  tokenAddress: string;
};

const encodeApproveData = (spender: string, amount: string): string => {
  const contractInterface = new ethers.Interface(Erc20Abi);
  return contractInterface.encodeFunctionData('approve', [
    spender,
    BigInt(amount),
  ]);
};

/**
 * Returns the ERC-20 approval the user must grant before the in-app swap can
 * pull the source token, or `null` when none is needed. Mirrors the LI.FI swap
 * flow: the quote advertises the spender/amount, but we still read the live
 * on-chain allowance so an already-approved token skips the extra transaction.
 */
const getRequiredApproval = async (
  chain: EvmChain,
  ownerAddress: string,
  quote: PortfolioQuote,
): Promise<PortfolioRequiredApproval | null> => {
  const approval = quote.approval;
  const tokenAddress = quote.fromAsset?.address;
  if (!approval?.spender || !approval.amount || !tokenAddress) {
    return null;
  }

  const requiredAmount = BigInt(approval.amount);
  if (requiredAmount <= BigInt(0)) {
    return null;
  }

  const allowance = await EvmTokensUtils.getAllowance(
    chain,
    ownerAddress,
    tokenAddress,
    approval.spender,
  );
  if (BigInt(allowance) >= requiredAmount) {
    return null;
  }

  return {
    spender: approval.spender,
    amount: approval.amount,
    tokenAddress,
  };
};

const buildApproveTransactionData = (
  chain: EvmChain,
  fromAddress: string,
  approval: PortfolioRequiredApproval,
): ProviderTransactionData => ({
  chain,
  from: fromAddress,
  to: approval.tokenAddress,
  data: encodeApproveData(approval.spender, approval.amount),
  value: '0x0',
  type: chain.defaultTransactionType ?? EvmTransactionType.EIP_1559,
});

const buildApproveConfirmationFields = (
  approval: PortfolioRequiredApproval,
  fromAsset: PortfolioCanonicalAsset | null | undefined,
  chains: EvmChain[] = [],
  portfolioChains: PortfolioChainDisplayRecord = {},
): ConfirmationPageFields[] => {
  const decimals = fromAsset?.decimals ?? 18;
  const formattedAmount = ethers.formatUnits(approval.amount, decimals);
  const symbol = fromAsset?.symbol?.trim();
  const tokenNetwork = fromAsset
    ? PortfolioFlowUtils.resolveCanonicalAssetNetworkLabel(
        fromAsset,
        chains,
        portfolioChains,
      )
    : undefined;
  const tokenNetworkLogoUrl = fromAsset
    ? PortfolioFlowUtils.resolveCanonicalAssetNetworkLogoUrl(
        fromAsset,
        chains,
        portfolioChains,
      ) ?? undefined
    : undefined;

  return [
    {
      label: 'portfolio_confirmation_approval_amount',
      value: formattedAmount,
      tag: ConfirmationPageFieldType.AMOUNT,
      tokenSymbol: symbol || undefined,
      tokenLogoUrl: fromAsset?.logoUrl ?? undefined,
      tokenNetwork: tokenNetwork || undefined,
      tokenNetworkLogoUrl,
    },
    {
      label: 'portfolio_confirmation_approval_spender',
      value: EvmFormatUtils.formatAddress(approval.spender),
    },
  ];
};

export const PortfolioEvmApprovalUtils = {
  buildApproveConfirmationFields,
  buildApproveTransactionData,
  encodeApproveData,
  getRequiredApproval,
};

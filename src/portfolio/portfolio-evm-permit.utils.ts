import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import {
  PortfolioQuote,
  PortfolioQuotePermit,
} from 'src/portfolio/portfolio-api.interface';

export type PortfolioRequiredPermit = PortfolioQuotePermit;

/**
 * `Permit2.allowance` and `Permit2.approve`. Classic Uniswap swaps pull ERC-20s
 * with `permit2.transferFrom` after this allowance is live.
 */
const Permit2Abi = [
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
      { internalType: 'uint48', name: 'nonce', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const permit2Interface = new ethers.Interface(Permit2Abi);

const encodePermitApproveData = (permit: PortfolioRequiredPermit): string =>
  permit2Interface.encodeFunctionData('approve', [
    permit.token,
    permit.spender,
    BigInt(permit.amount),
    BigInt(permit.expiration),
  ]);

const readPermit2Allowance = async (
  chain: EvmChain,
  permit: PortfolioQuotePermit,
  ownerAddress: string,
): Promise<{ amount: bigint; expiration: bigint }> => {
  const provider = await EthersUtils.getProvider(chain);
  const contract = new ethers.Contract(permit.to, Permit2Abi, provider);
  const allowance = await contract.allowance(
    ownerAddress,
    permit.token,
    permit.spender,
  );

  return {
    amount: BigInt(allowance.amount),
    expiration: BigInt(allowance.expiration),
  };
};

/**
 * Returns the Permit2 allowance the user must grant before the in-app swap can
 * pull the source token, or `null` when none is needed. Mirrors the ERC-20
 * approval flow: the quote advertises the allowance, and a live Permit2
 * allowance that still covers the amount is skipped.
 */
const getRequiredPermit = async (
  chain: EvmChain,
  ownerAddress: string,
  quote: PortfolioQuote,
): Promise<PortfolioRequiredPermit | null> => {
  const permit = quote.permit;
  if (
    !permit?.to ||
    !permit.token ||
    !permit.spender ||
    !permit.amount ||
    !permit.expiration
  ) {
    return null;
  }

  const requiredAmount = BigInt(permit.amount);
  const expiration = BigInt(permit.expiration);
  if (requiredAmount <= BigInt(0) || expiration <= BigInt(0)) {
    return null;
  }

  const allowance = await readPermit2Allowance(chain, permit, ownerAddress);
  const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
  if (
    allowance.amount >= requiredAmount &&
    allowance.expiration >= nowSeconds
  ) {
    return null;
  }

  return {
    to: permit.to,
    token: permit.token,
    spender: permit.spender,
    amount: permit.amount,
    expiration: permit.expiration,
  };
};

const buildPermitTransactionData = (
  chain: EvmChain,
  fromAddress: string,
  permit: PortfolioRequiredPermit,
): ProviderTransactionData => ({
  chain,
  from: fromAddress,
  to: permit.to,
  data: encodePermitApproveData(permit),
  value: '0x0',
  type: chain.defaultTransactionType ?? EvmTransactionType.EIP_1559,
});

export const PortfolioEvmPermitUtils = {
  buildPermitTransactionData,
  encodePermitApproveData,
  getRequiredPermit,
};

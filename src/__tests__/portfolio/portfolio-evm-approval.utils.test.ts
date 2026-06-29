import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { Erc20Abi } from '@popup/evm/reference-data/abi.data';
import { ConfirmationPageFieldType } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioEvmApprovalUtils } from 'src/portfolio/portfolio-evm-approval.utils';

jest.mock('@popup/evm/utils/evm-tokens.utils', () => ({
  EvmTokensUtils: {
    getAllowance: jest.fn(),
  },
}));

const getAllowanceMock = EvmTokensUtils.getAllowance as jest.Mock;

const SPENDER = '0x1111111254eeb25477b68fb85ed929f73a960582';
const TOKEN = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const OWNER = '0xabcabcabcabcabcabcabcabcabcabcabcabcabca';

const chain = {
  chainId: '0x1',
  defaultTransactionType: EvmTransactionType.EIP_1559,
} as unknown as EvmChain;

const buildQuote = (
  approval: PortfolioQuote['approval'],
  address: string | null = TOKEN,
): PortfolioQuote =>
  ({
    quoteId: 'lifi:1',
    provider: 'lifi',
    approval,
    fromAsset: {
      assetId: 'evm:token:ethereum:usdc',
      ecosystem: 'evm',
      symbol: 'USDC',
      name: 'USD Coin',
      chainId: 'ethereum',
      address,
      decimals: 6,
      isNative: false,
      familyId: 'usdc',
      logoUrl: null,
    },
  } as unknown as PortfolioQuote);

describe('PortfolioEvmApprovalUtils', () => {
  beforeEach(() => {
    getAllowanceMock.mockReset();
  });

  describe('getRequiredApproval', () => {
    it('returns null when the quote has no approval', async () => {
      const result = await PortfolioEvmApprovalUtils.getRequiredApproval(
        chain,
        OWNER,
        buildQuote(null),
      );
      expect(result).toBeNull();
      expect(getAllowanceMock).not.toHaveBeenCalled();
    });

    it('returns null when the source asset has no token address', async () => {
      const result = await PortfolioEvmApprovalUtils.getRequiredApproval(
        chain,
        OWNER,
        buildQuote({ spender: SPENDER, amount: '1000000' }, null),
      );
      expect(result).toBeNull();
      expect(getAllowanceMock).not.toHaveBeenCalled();
    });

    it('returns null when the on-chain allowance already covers the amount', async () => {
      getAllowanceMock.mockResolvedValue(BigInt('1000000'));
      const result = await PortfolioEvmApprovalUtils.getRequiredApproval(
        chain,
        OWNER,
        buildQuote({ spender: SPENDER, amount: '1000000' }),
      );
      expect(result).toBeNull();
    });

    it('returns the required approval when the allowance is insufficient', async () => {
      getAllowanceMock.mockResolvedValue(BigInt('500000'));
      const result = await PortfolioEvmApprovalUtils.getRequiredApproval(
        chain,
        OWNER,
        buildQuote({ spender: SPENDER, amount: '1000000' }),
      );
      expect(result).toEqual({
        spender: SPENDER,
        amount: '1000000',
        tokenAddress: TOKEN,
      });
      expect(getAllowanceMock).toHaveBeenCalledWith(
        chain,
        OWNER,
        TOKEN,
        SPENDER,
      );
    });
  });

  describe('encodeApproveData', () => {
    it('encodes an ERC-20 approve call for the spender and exact amount', () => {
      const data = PortfolioEvmApprovalUtils.encodeApproveData(
        SPENDER,
        '1000000',
      );
      const decoded = new ethers.Interface(Erc20Abi).decodeFunctionData(
        'approve',
        data,
      );
      expect(decoded[0].toLowerCase()).toBe(SPENDER);
      expect(decoded[1]).toBe(BigInt('1000000'));
    });
  });

  describe('buildApproveTransactionData', () => {
    it('builds an approve transaction targeting the token contract', () => {
      const data = PortfolioEvmApprovalUtils.buildApproveTransactionData(
        chain,
        OWNER,
        { spender: SPENDER, amount: '1000000', tokenAddress: TOKEN },
      );
      expect(data.to).toBe(TOKEN);
      expect(data.from).toBe(OWNER);
      expect(data.value).toBe('0x0');
      expect(data.type).toBe(EvmTransactionType.EIP_1559);
      expect(data.chain).toBe(chain);
      expect(data.data.startsWith('0x')).toBe(true);
    });
  });

  describe('buildApproveConfirmationFields', () => {
    it('formats the approval amount with the source asset decimals and shows the spender', () => {
      const fields = PortfolioEvmApprovalUtils.buildApproveConfirmationFields(
        { spender: SPENDER, amount: '1000000', tokenAddress: TOKEN },
        buildQuote({ spender: SPENDER, amount: '1000000' }).fromAsset,
      );
      expect(fields[0]).toEqual(
        expect.objectContaining({
          label: 'portfolio_confirmation_approval_amount',
          value: '1.0',
          tag: ConfirmationPageFieldType.AMOUNT,
          tokenSymbol: 'USDC',
        }),
      );
      expect(fields[1].label).toBe('portfolio_confirmation_approval_spender');
    });
  });
});

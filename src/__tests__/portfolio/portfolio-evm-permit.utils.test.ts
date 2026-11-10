import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import { PortfolioQuote } from 'src/portfolio/portfolio-api.interface';
import { PortfolioEvmPermitUtils } from 'src/portfolio/portfolio-evm-permit.utils';

jest.mock('@popup/evm/utils/ethers.utils', () => ({
  EthersUtils: {
    getProvider: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      Contract: jest.fn(),
    },
  };
});

const allowanceMock = jest.fn();
const getProviderMock = EthersUtils.getProvider as jest.Mock;
const contractMock = ethers.Contract as unknown as jest.Mock;

const PERMIT2 = '0x000000000022d473030f116ddee9f6b43ac78ba3';
const SPENDER = '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad';
const TOKEN = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const OWNER = '0xabcabcabcabcabcabcabcabcabcabcabcabcabca';
const NOW_MS = 1_700_000_000_000;
const NOW_SECONDS = BigInt(NOW_MS / 1000);

const chain = {
  chainId: '0x1',
  defaultTransactionType: EvmTransactionType.EIP_1559,
} as unknown as EvmChain;

const permit = {
  to: PERMIT2,
  token: TOKEN,
  spender: SPENDER,
  amount: '1000000',
  expiration: '1700003600',
};

const buildQuote = (
  quotePermit: PortfolioQuote['permit'],
): PortfolioQuote =>
  ({
    quoteId: 'uniswap:1',
    provider: 'uniswap',
    permit: quotePermit,
  } as unknown as PortfolioQuote);

describe('PortfolioEvmPermitUtils', () => {
  beforeEach(() => {
    allowanceMock.mockReset();
    getProviderMock.mockClear();
    contractMock.mockReset();
    contractMock.mockImplementation(() => ({ allowance: allowanceMock }));
    jest.spyOn(Date, 'now').mockReturnValue(NOW_MS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getRequiredPermit', () => {
    it('returns null when the quote has no permit', async () => {
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote(null),
      );
      expect(result).toBeNull();
      expect(getProviderMock).not.toHaveBeenCalled();
    });

    it('returns null when the permit amount is not positive', async () => {
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote({ ...permit, amount: '0' }),
      );
      expect(result).toBeNull();
      expect(getProviderMock).not.toHaveBeenCalled();
    });

    it('returns null when the permit is incomplete', async () => {
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote({ ...permit, spender: '' }),
      );
      expect(result).toBeNull();
      expect(getProviderMock).not.toHaveBeenCalled();
    });

    it('returns null when the live Permit2 allowance still covers the amount', async () => {
      allowanceMock.mockResolvedValue({
        amount: BigInt('1000000'),
        expiration: NOW_SECONDS,
      });
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote(permit),
      );
      expect(result).toBeNull();
      expect(contractMock).toHaveBeenCalledWith(PERMIT2, expect.anything(), {});
      expect(allowanceMock).toHaveBeenCalledWith(OWNER, TOKEN, SPENDER);
    });

    it('returns the permit when the live allowance amount is too small', async () => {
      allowanceMock.mockResolvedValue({
        amount: BigInt('1'),
        expiration: NOW_SECONDS + BigInt(3600),
      });
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote(permit),
      );
      expect(result).toEqual(permit);
    });

    it('returns the permit when the live allowance is expired', async () => {
      allowanceMock.mockResolvedValue({
        amount: BigInt('1000000'),
        expiration: NOW_SECONDS - BigInt(1),
      });
      const result = await PortfolioEvmPermitUtils.getRequiredPermit(
        chain,
        OWNER,
        buildQuote(permit),
      );
      expect(result).toEqual(permit);
    });
  });

  describe('encodePermitApproveData', () => {
    it('encodes Permit2 approve with the token, spender, amount, and expiration', () => {
      const data = PortfolioEvmPermitUtils.encodePermitApproveData(permit);
      const decoded = new ethers.Interface([
        'function approve(address token, address spender, uint160 amount, uint48 expiration)',
      ]).decodeFunctionData('approve', data);
      expect(decoded[0].toLowerCase()).toBe(TOKEN);
      expect(decoded[1].toLowerCase()).toBe(SPENDER);
      expect(decoded[2]).toBe(BigInt('1000000'));
      expect(decoded[3]).toBe(BigInt('1700003600'));
    });
  });

  describe('buildPermitTransactionData', () => {
    it('builds an approve transaction targeting the Permit2 contract', () => {
      const data = PortfolioEvmPermitUtils.buildPermitTransactionData(
        chain,
        OWNER,
        permit,
      );
      expect(data.to).toBe(PERMIT2);
      expect(data.from).toBe(OWNER);
      expect(data.value).toBe('0x0');
      expect(data.type).toBe(EvmTransactionType.EIP_1559);
      expect(data.chain).toBe(chain);
      expect(data.data.startsWith('0x')).toBe(true);
    });
  });
});

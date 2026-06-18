import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import {
  PortfolioApiError,
  PortfolioApiUtils,
} from 'src/portfolio/portfolio-api.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

jest.mock('src/utils/localStorage.utils', () => ({
  __esModule: true,
  default: {
    getValueFromLocalStorage: jest.fn(),
    saveValueInLocalStorage: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('PortfolioApiUtils', () => {
  const getValueMock =
    LocalStorageUtils.getValueFromLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.getValueFromLocalStorage
    >;
  const saveValueMock =
    LocalStorageUtils.saveValueInLocalStorage as jest.MockedFunction<
      typeof LocalStorageUtils.saveValueInLocalStorage
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORTFOLIO_API_URL = 'https://portfolio.example';
  });

  it('reuses an existing installation token', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));

    await expect(PortfolioApiUtils.getClientToken()).resolves.toBe(
      'x'.repeat(64),
    );
    expect(saveValueMock).not.toHaveBeenCalled();
  });

  it('creates and persists an installation token when missing', async () => {
    getValueMock.mockResolvedValue(undefined);
    jest
      .spyOn(crypto, 'getRandomValues')
      .mockImplementation((array: Uint8Array) => {
        array.fill(1);
        return array;
      });

    const token = await PortfolioApiUtils.getClientToken();

    expect(token).toBe('01'.repeat(32));
    expect(saveValueMock).toHaveBeenCalledWith(
      LocalStorageKeyEnum.PORTFOLIO_CLIENT_TOKEN,
      token,
    );
  });

  it('sends the installation token on private history requests', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: [] }),
    });

    await PortfolioApiUtils.listHistory();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get('X-Keychain-Portfolio-Client-Token')).toBe(
      'x'.repeat(64),
    );
  });

  it('throws structured portfolio api errors from quote requests', async () => {
    getValueMock.mockResolvedValue('x'.repeat(64));
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        code: 'SWAP_AMOUNT_OUT_OF_RANGE',
        message: 'No quote available for the requested amount.',
        requestId: '0db08dd7-368d-4eee-b34d-68385aa899d9',
        details: {
          requestedAmount: '1000',
          mergedRange: {
            min: '2200',
            max: '110000',
          },
        },
      }),
    });

    await expect(
      PortfolioApiUtils.getQuotes({
        mode: 'swap',
        fromAmount: '1000',
      }),
    ).rejects.toMatchObject({
      code: 'SWAP_AMOUNT_OUT_OF_RANGE',
      message: 'No quote available for the requested amount.',
      details: {
        mergedRange: {
          min: '2200',
          max: '110000',
        },
      },
    });
  });

  it('maps swap amount out of range errors to amount field messages', () => {
    const error = new PortfolioApiError({
      code: 'SWAP_AMOUNT_OUT_OF_RANGE',
      message: 'No quote available for the requested amount.',
      details: {
        mergedRange: {
          min: '2200',
          max: '110000',
        },
      },
    });

    expect(PortfolioApiUtils.resolvePortfolioAmountQuoteError(error)).toEqual({
      key: 'portfolio_swap_amount_out_of_range',
      params: ['2200', '110000'],
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new PortfolioApiError({
          code: 'SWAP_AMOUNT_OUT_OF_RANGE',
          message: 'No quote available for the requested amount.',
        }),
      ),
    ).toEqual({
      key: 'portfolio_swap_amount_out_of_range_generic',
    });
    expect(
      PortfolioApiUtils.resolvePortfolioAmountQuoteError(
        new Error('portfolio_load_error'),
      ),
    ).toBeNull();
  });
});

import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { PortfolioApiUtils } from 'src/portfolio/portfolio-api.utils';
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
});

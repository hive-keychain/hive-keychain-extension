import { ExportTransactionUtils } from 'src/popup/hive/utils/export-transactions.utils';

jest.mock('hive-keychain-commons', () => {
  const actual = jest.requireActual('hive-keychain-commons');
  return {
    ...actual,
    ExportTransactionsUtils: {
      fetchTransactions: jest.fn(),
      generateCSV: jest.fn(() => 'a,b\n1,2\n'),
    },
  };
});

const { ExportTransactionsUtils } = jest.requireMock('hive-keychain-commons');

describe('ExportTransactionUtils', () => {
  const createObjectURL = jest.fn(() => 'blob:mock');
  const revokeObjectURL = jest.fn();
  let clickMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    clickMock = jest.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = {
        tagName: tag.toUpperCase(),
        href: '',
        download: '',
        click: clickMock,
      } as unknown as HTMLAnchorElement;
      return el;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('downloads CSV when fetch succeeds', async () => {
    (ExportTransactionsUtils.fetchTransactions as jest.Mock).mockResolvedValue([
      { op: 'transfer' },
    ]);

    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    await ExportTransactionUtils.downloadTransactions('alice', start, end);

    expect(ExportTransactionsUtils.fetchTransactions).toHaveBeenCalledWith(
      'alice',
      start,
      end,
      undefined,
    );
    expect(ExportTransactionsUtils.generateCSV).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  it('uses placeholder start label when startDate is omitted', async () => {
    (ExportTransactionsUtils.fetchTransactions as jest.Mock).mockResolvedValue([]);

    await ExportTransactionUtils.downloadTransactions('bob');

    const anchor = (document.createElement as jest.Mock).mock.results[0].value;
    expect(anchor.download).toMatch(/^bob-transactions-start-/);
  });

  it('throws KeychainError when fetch returns no operations', async () => {
    (ExportTransactionsUtils.fetchTransactions as jest.Mock).mockResolvedValue(null);

    await expect(
      ExportTransactionUtils.downloadTransactions('ghost'),
    ).rejects.toMatchObject({
      message: 'export_transactions_fetching_error',
      name: 'KeychainError',
    });
  });
});

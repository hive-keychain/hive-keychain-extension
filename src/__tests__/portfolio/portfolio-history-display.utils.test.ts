import { SVGIcons } from 'src/common-ui/icons.enum';
import { PortfolioCanonicalAsset } from 'src/portfolio/portfolio-api.interface';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';

const createAsset = (
  overrides: Partial<PortfolioCanonicalAsset> = {},
): PortfolioCanonicalAsset => ({
  assetId: 'evm:token:ethereum:0xabc',
  ecosystem: 'evm',
  symbol: 'USDC',
  name: 'USD Coin',
  chainId: 'ethereum',
  address: '0xabc',
  decimals: 6,
  isNative: false,
  familyId: 'usdc',
  logoUrl: null,
  priceUsd: 0,
  rankScore: 0,
  ...overrides,
});

describe('PortfolioHistoryDisplayUtils', () => {
  describe('getPortfolioHistoryStatusKind', () => {
    it('maps completed-like statuses to completed regardless of casing', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('COMPLETED'),
      ).toBe('completed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind(' finished '),
      ).toBe('completed');
    });

    it('maps failure-like statuses to failed', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('refunded'),
      ).toBe('failed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('Expired'),
      ).toBe('failed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('unknown'),
      ).toBe('failed');
    });

    it('falls back to pending for unknown statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind('awaiting_deposit'),
      ).toBe('pending');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind(''),
      ).toBe('pending');
    });

    it('maps verification_required to its own status kind', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind(
          'verification_required',
        ),
      ).toBe('verification_required');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind({
          status: 'awaiting_compliance_action',
          displayStatus: 'verification_required',
        }),
      ).toBe('verification_required');
    });

    it('prefers displayStatus when a history item is provided', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusKind({
          status: 'awaiting_user_action',
          displayStatus: 'expired',
        }),
      ).toBe('failed');
    });
  });

  describe('getPortfolioHistoryStatusIcon', () => {
    it('returns the matching swap status icon per kind', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('completed'),
      ).toBe(SVGIcons.SWAPS_STATUS_FINISHED);
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('failed'),
      ).toBe(SVGIcons.SWAPS_STATUS_CANCELED);
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon('pending'),
      ).toBe(SVGIcons.SWAPS_STATUS_PROCESSING);
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusIcon(
          'verification_required',
        ),
      ).toBe(SVGIcons.SWAPS_STATUS_WARNING);
    });
  });

  describe('getPortfolioHistoryStatusMessageKey', () => {
    it('returns the matching translation key per kind', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('done'),
      ).toBe('portfolio_history_status_completed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('error'),
      ).toBe('portfolio_history_status_failed');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey('created'),
      ).toBe('portfolio_history_status_pending');
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryStatusMessageKey(
          'verification_required',
        ),
      ).toBe('portfolio_history_status_verification_required');
    });
  });

  describe('resolvePortfolioHistoryFailureCodeMessageKey', () => {
    it('maps known failure codes to translation keys', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryFailureCodeMessageKey(
          'refunded',
        ),
      ).toBe('portfolio_history_failure_refunded');
    });

    it('returns null when failure code is absent', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryFailureCodeMessageKey(
          null,
        ),
      ).toBeNull();
    });
  });

  describe('resolvePortfolioHistoryFailureActionMessageKey', () => {
    it('maps known failure actions to translation keys', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryFailureActionMessageKey(
          'wait_for_refund',
        ),
      ).toBe('portfolio_history_failure_action_wait_for_refund');
    });

    it('returns null when failure action is absent', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryFailureActionMessageKey(
          null,
        ),
      ).toBeNull();
    });
  });

  describe('resolvePortfolioHistorySupportActionUrl', () => {
    it('returns supportUrl for contact_support failures', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: 'contact_support',
          supportUrl: 'https://stealthex.io/contacts/',
        }),
      ).toBe('https://stealthex.io/contacts/');
    });

    it('trims whitespace from supportUrl', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: 'contact_support',
          supportUrl: '  https://stealthex.io/contacts/  ',
        }),
      ).toBe('https://stealthex.io/contacts/');
    });

    it('returns null when supportUrl is missing for contact_support', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: 'contact_support',
          supportUrl: null,
        }),
      ).toBeNull();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: 'contact_support',
          supportUrl: '   ',
        }),
      ).toBeNull();
    });

    it('does not link supportUrl for other failure actions', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: 'wait_for_refund',
          supportUrl: 'https://discord.gg/lifi',
        }),
      ).toBeNull();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistorySupportActionUrl({
          failureAction: null,
          supportUrl: 'https://stealthex.io/contacts/',
        }),
      ).toBeNull();
    });
  });

  describe('resolvePortfolioHistoryStatusLabelKey', () => {
    it('prefers failure code labels for failed statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey({
          status: 'failed',
          failureCode: 'refunded',
        }),
      ).toBe('portfolio_history_failure_refunded');
    });

    it('uses displayStatus when resolving failure code labels', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey({
          status: 'awaiting_user_action',
          displayStatus: 'failed',
          failureCode: 'refunded',
        }),
      ).toBe('portfolio_history_failure_refunded');
    });

    it('falls back to generic status labels when no failure code is set', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey({
          status: 'failed',
          failureCode: null,
        }),
      ).toBe('portfolio_history_status_failed');
    });

    it('ignores failure codes for non-failed statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey({
          status: 'submitted',
          failureCode: 'refunded',
        }),
      ).toBe('portfolio_history_status_pending');
    });

    it('uses failure code labels for verification_required statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLabelKey({
          status: 'awaiting_compliance_action',
          displayStatus: 'verification_required',
          failureCode: 'aml_review',
        }),
      ).toBe('portfolio_history_failure_aml_review');
    });
  });

  describe('isPortfolioHistoryVerificationRequired', () => {
    it('returns true when displayStatus is verification_required', () => {
      expect(
        PortfolioHistoryDisplayUtils.isPortfolioHistoryVerificationRequired({
          status: 'awaiting_compliance_action',
          displayStatus: 'verification_required',
        }),
      ).toBe(true);
    });

    it('returns false for other statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.isPortfolioHistoryVerificationRequired(
          'pending',
        ),
      ).toBe(false);
    });
  });

  describe('buildPortfolioHistorySupportMailtoUrl', () => {
    const context = {
      item: {
        id: 'exec-compliance',
        status: 'awaiting_compliance_action',
        displayStatus: 'verification_required',
        mode: 'swap',
        provider: 'changelly',
        providerName: 'Changelly',
        providerReferenceId: '4f2u8h9j6qdnys',
        fromAssetId: 'evm:native:ethereum',
        toAssetId: 'evm:token:ethereum:0xabc',
        fromAmount: '2.15',
        toAmount: '6764.9',
        receivedAmount: null,
        fromAddress: '0xabc123',
        toAddress: '0xabc123',
        redirectUrl: null,
        transaction: null,
        fiatCurrency: null,
        paymentMethod: null,
        submittedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T12:00:00.000Z',
        executionType: 'redirect',
        txHash: null,
        providerLogoUrl: null,
        providerStatus: 'hold',
        lastProviderStatusRefreshAt: null,
        failureCode: 'aml_review',
        failureAction: 'contact_support',
        providerStatusDetail: null,
        providerStatusUrl: null,
        supportUrl: 'mailto:security@changelly.com',
      },
      fromSymbol: 'ETH',
      toSymbol: 'USDC',
    } as const;

    it('adds subject and body with swap details to mailto links', () => {
      const url = PortfolioHistoryDisplayUtils.buildPortfolioHistorySupportMailtoUrl(
        'mailto:security@changelly.com',
        context,
      );

      expect(url.startsWith('mailto:security@changelly.com?')).toBe(true);
      expect(url).not.toContain('+');

      const params = new URLSearchParams(url.split('?')[1] ?? '');
      expect(params.get('subject')).toBe(
        'Compliance review - Exchange 4f2u8h9j6qdnys',
      );
      expect(params.get('body')).toContain(
        'My swap appears to be stuck due to KYC/compliance verification. Could you please advise on the next steps?',
      );
      expect(params.get('body')).toContain('Exchange ID: 4f2u8h9j6qdnys');
      expect(params.get('body')).toContain('From amount: 2.15 ETH');
      expect(params.get('body')).toContain('To amount: 6764.9 USDC');
      expect(params.get('body')).toContain('From address: 0xabc123');
      expect(params.get('body')).toContain('To address: 0xabc123');
      expect(params.get('body')).not.toContain('Provider:');
      expect(params.get('body')).not.toContain('Status:');
      expect(params.get('body')).not.toContain('Submitted:');
    });

    it('returns non-mailto URLs unchanged', () => {
      expect(
        PortfolioHistoryDisplayUtils.buildPortfolioHistorySupportMailtoUrl(
          'https://stealthex.io/contacts/',
          context,
        ),
      ).toBe('https://stealthex.io/contacts/');
    });
  });

  describe('openPortfolioHistorySupportUrl', () => {
    beforeEach(() => {
      global.window.open = jest.fn();
      (global.chrome as any) = {
        tabs: {
          create: jest.fn(),
        },
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('opens mailto links with window.open', () => {
      PortfolioHistoryDisplayUtils.openPortfolioHistorySupportUrl(
        'mailto:security@changelly.com',
      );

      expect(window.open).toHaveBeenCalledWith('mailto:security@changelly.com');
      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });

    it('enriches mailto links when history context is provided', () => {
      PortfolioHistoryDisplayUtils.openPortfolioHistorySupportUrl(
        'mailto:security@changelly.com',
        {
          item: {
            id: 'exec-compliance',
            status: 'awaiting_compliance_action',
            displayStatus: 'verification_required',
            mode: 'swap',
            provider: 'changelly',
            providerName: 'Changelly',
            providerReferenceId: 'swap-123',
            fromAssetId: null,
            toAssetId: null,
            fromAmount: '1',
            toAmount: '2',
            receivedAmount: null,
            fromAddress: '0xabc',
            toAddress: null,
            redirectUrl: null,
            transaction: null,
            fiatCurrency: null,
            paymentMethod: null,
            submittedAt: '2026-01-01T00:00:00.000Z',
            updatedAt: null,
            executionType: null,
            txHash: null,
            providerLogoUrl: null,
            providerStatus: null,
            lastProviderStatusRefreshAt: null,
            failureCode: 'aml_review',
            failureAction: 'contact_support',
            providerStatusDetail: null,
            providerStatusUrl: null,
            supportUrl: 'mailto:security@changelly.com',
          },
          fromSymbol: 'ETH',
          toSymbol: 'USDC',
        },
      );

      const openedUrl = (window.open as jest.Mock).mock.calls[0]?.[0] as string;
      expect(openedUrl.startsWith('mailto:security@changelly.com?')).toBe(true);
      const params = new URLSearchParams(openedUrl.split('?')[1] ?? '');
      expect(params.get('body')).toContain('Exchange ID: swap-123');
      expect(params.get('body')).toContain('From amount: 1 ETH');
    });

    it('opens web support links in a new tab', () => {
      PortfolioHistoryDisplayUtils.openPortfolioHistorySupportUrl(
        'https://stealthex.io/contacts/',
      );

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://stealthex.io/contacts/',
      });
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('isCreatedOrExpiredHistoryStatus', () => {
    it('flags created and expired statuses regardless of casing', () => {
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('created'),
      ).toBe(true);
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus(' EXPIRED '),
      ).toBe(true);
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus({
          status: 'awaiting_user_action',
          displayStatus: 'created',
        }),
      ).toBe(true);
    });

    it('does not flag other statuses', () => {
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('completed'),
      ).toBe(false);
      expect(
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus('pending'),
      ).toBe(false);
    });
  });

  describe('formatPortfolioHistoryAmount', () => {
    it('formats numeric amounts with commas and trims trailing zeros', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount('1234.5000'),
      ).toBe('1,234.5');
    });

    it('returns an empty string for missing amounts', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount(null),
      ).toBe('');
    });

    it('returns the original value when it is not numeric', () => {
      expect(
        PortfolioHistoryDisplayUtils.formatPortfolioHistoryAmount('n/a'),
      ).toBe('n/a');
    });
  });

  describe('resolvePortfolioHistoryDisplayToAmount', () => {
    it('prefers receivedAmount when present', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryDisplayToAmount({
          toAmount: '0.99',
          receivedAmount: '0.985',
        }),
      ).toBe('0.985');
    });

    it('falls back to toAmount when receivedAmount is missing', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryDisplayToAmount({
          toAmount: '0.99',
          receivedAmount: null,
        }),
      ).toBe('0.99');
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryDisplayToAmount({
          toAmount: '0.99',
          receivedAmount: '   ',
        }),
      ).toBe('0.99');
    });
  });

  describe('resolvePortfolioAssetById', () => {
    it('finds the matching asset by assetId', () => {
      const asset = createAsset();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
          asset.assetId,
          [asset],
        ),
      ).toBe(asset);
    });

    it('matches EVM asset ids regardless of contract-address casing', () => {
      const asset = createAsset({
        assetId:
          'evm:token:ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
          'evm:token:ethereum:0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
          [asset],
        ),
      ).toBe(asset);
    });

    it('builds a Hive core asset when the API catalog has no match', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
          'hive-hive',
          [],
        ),
      ).toEqual(
        expect.objectContaining({
          ecosystem: 'hive',
          symbol: 'HIVE',
          chainId: 'hive',
        }),
      );
    });

    it('builds a Hive Engine asset with its local token logo', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
          'hive_engine:DEC',
          [],
          { DEC: 'https://example.com/dec.png' },
        ),
      ).toEqual(
        expect.objectContaining({
          ecosystem: 'hive_engine',
          symbol: 'DEC',
          chainId: 'hive_engine',
          logoUrl: 'https://example.com/dec.png',
        }),
      );
    });

    it('returns undefined for a null id or missing asset', () => {
      const asset = createAsset();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(null, [asset]),
      ).toBeUndefined();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioAssetById('unknown', [asset]),
      ).toBeUndefined();
    });
  });

  describe('getPortfolioHistoryAssetSymbol', () => {
    it('prefers the resolved asset symbol', () => {
      const asset = createAsset({ symbol: 'WETH' });
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
          asset.assetId,
          asset,
        ),
      ).toBe('WETH');
    });

    it('derives an uppercase symbol from non-address asset id tails', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol('hive:hive'),
      ).toBe('HIVE');
    });

    it('shortens contract addresses when no symbol is available', () => {
      const result = PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
        'evm:token:ethereum:0x1234567890abcdef1234567890abcdef12345678',
      );
      expect(result).toContain('...');
    });

    it('returns an empty string for a null id', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(null),
      ).toBe('');
    });

    it('uses fiatCurrency when the fiat leg has no asset id', () => {
      expect(
        PortfolioHistoryDisplayUtils.getPortfolioHistoryAssetSymbol(
          null,
          undefined,
          'usd',
        ),
      ).toBe('USD');
    });
  });

  describe('resolvePortfolioHistoryStatusLink', () => {
    const ethereumChain = {
      name: 'Ethereum',
      type: 'EVM' as const,
      logo: 'https://example.com/eth.svg',
      chainId: '0x1',
      mainToken: 'ETH',
      defaultTransactionType: '0x2' as const,
      blockExplorer: { url: 'https://etherscan.io/' },
      testnet: false,
      isEth: true,
      rpcs: [{ url: 'https://rpc.example.com', isDefault: true }],
    };
    const polygonChain = {
      ...ethereumChain,
      name: 'Polygon',
      chainId: '0x89',
      blockExplorer: { url: 'https://polygonscan.com' },
      isEth: false,
    };
    const evmTxHash =
      '0x5862726dbc6643c6a34b3496bb15e91f11771f6756ccf83826304846bbc93c0e';
    const hiveTxHash = 'a1f3e5c7b9d0a2c4e6f8b1d3c5a7e9f0b2d4c6e8';

    it('prefers the provider status URL when present', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: 'https://scan.li.fi/tx/0xabc',
            txHash: evmTxHash,
          },
          createAsset(),
          undefined,
          [ethereumChain as any],
        ),
      ).toEqual({
        url: 'https://scan.li.fi/tx/0xabc',
        kind: 'provider',
      });
    });

    it('falls back to the from-asset chain block explorer', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: evmTxHash,
          },
          createAsset({ chainId: 'ethereum' }),
          createAsset({
            assetId: 'evm:native:polygon',
            chainId: 'polygon',
            symbol: 'MATIC',
          }),
          [ethereumChain as any, polygonChain as any],
        ),
      ).toEqual({
        url: `https://etherscan.io/tx/${evmTxHash}`,
        kind: 'explorer',
      });
    });

    it('falls back to the to-asset chain when the from asset has no explorer', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: evmTxHash,
          },
          createAsset({ chainId: 'unknown-chain' }),
          createAsset({
            assetId: 'evm:native:polygon',
            chainId: 'polygon',
            symbol: 'MATIC',
          }),
          [polygonChain as any],
        ),
      ).toEqual({
        url: `https://polygonscan.com/tx/${evmTxHash}`,
        kind: 'explorer',
      });
    });

    it('builds a Hive explorer URL for Hive transaction ids', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: hiveTxHash,
          },
          createAsset({
            assetId: 'hive:hive',
            ecosystem: 'hive',
            chainId: null,
            symbol: 'HIVE',
          }),
          undefined,
          [],
        ),
      ).toEqual({
        url: `https://hivehub.dev/tx/${hiveTxHash}`,
        kind: 'explorer',
      });
    });

    it('builds a Hive Engine explorer URL for Hive Engine assets', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: hiveTxHash,
          },
          createAsset({
            assetId: 'hive_engine:SWAP.HIVE',
            ecosystem: 'hive_engine',
            chainId: null,
            symbol: 'SWAP.HIVE',
          }),
          undefined,
          [],
        ),
      ).toEqual({
        url: `https://he.dtools.dev/tx/${hiveTxHash}`,
        kind: 'explorer',
      });
    });

    it('returns null when neither provider URL nor resolvable explorer exists', () => {
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: evmTxHash,
          },
          createAsset({ chainId: 'unknown-chain' }),
          undefined,
          [ethereumChain as any],
        ),
      ).toBeNull();
      expect(
        PortfolioHistoryDisplayUtils.resolvePortfolioHistoryStatusLink(
          {
            providerStatusUrl: null,
            txHash: null,
          },
          createAsset(),
          undefined,
          [ethereumChain as any],
        ),
      ).toBeNull();
    });
  });
});

import { ConfirmationPageEvmFields } from '@common-ui/confirmation-page/confirmation-page.interface';
import {
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { TransactionOptions } from '@interfaces/keys.interface';
import {
  EvmActiveAccount,
  NativeAndErc20Token,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfoErc20,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountTokensLoadUtils } from '@popup/evm/utils/evm-account-tokens-load.utils';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { evmChainIdToDecimalPathSegment } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
  resetLoading,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import AccountSelectorOrderUtils, {
  AccountSelectorListItem,
} from '@popup/multichain/utils/account-selector-order.utils';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FieldError } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import {
  isPortfolioEvmTransaction,
  isPortfolioHiveTransaction,
  PortfolioCanonicalAsset,
  PortfolioChainDisplayRecord,
  PortfolioEvmTransaction,
  PortfolioExecution,
  PortfolioFeatureFlags,
  PortfolioFiatRampOptions,
  PortfolioHistoryItem,
  PortfolioHiveTransaction,
  PortfolioMode,
  PortfolioQuote,
  PortfolioQuoteResponse,
} from 'src/portfolio/portfolio-api.interface';
import {
  DEFAULT_PORTFOLIO_FEATURE_FLAGS,
  PortfolioApiUtils,
  PortfolioLocalizedMessage,
  PortfolioSwapQuoteFetchResult,
} from 'src/portfolio/portfolio-api.utils';
import { PortfolioEvmApprovalUtils } from 'src/portfolio/portfolio-evm-approval.utils';
import { PortfolioFiatLocaleUtils } from 'src/portfolio/portfolio-fiat-locale.utils';
import {
  PORTFOLIO_RECIPIENT_OTHER_VALUE,
  PortfolioFlowRow,
  PortfolioFlowUtils,
  PortfolioSwapLastUsedAssets,
} from 'src/portfolio/portfolio-flow.utils';
import {
  getPortfolioHiveOperations,
  PortfolioInAppConfirmationContext,
} from 'src/portfolio/portfolio-in-app-confirmation.interface';
import { PortfolioSwapCatalogCacheUtils } from 'src/portfolio/portfolio-swap-catalog-cache.utils';
import { PortfolioHiveEngineBalanceBreakdown } from 'src/portfolio/portfolio.interface';
import { PortfolioAccountAvatar } from 'src/portfolio/ui/portfolio-account-avatar.component';
import { PortfolioBalancesSection } from 'src/portfolio/ui/portfolio-balances-section.component';
import { PortfolioConfirmationStepComponent } from 'src/portfolio/ui/portfolio-confirmation-step.component';
import { PortfolioHistoryCard } from 'src/portfolio/ui/portfolio-history-card.component';
import { PortfolioHistoryDisplayUtils } from 'src/portfolio/ui/portfolio-history-display.utils';
import { PortfolioLogoImage } from 'src/portfolio/ui/portfolio-logo-image.component';
import { PortfolioToAssetFilter } from 'src/portfolio/ui/portfolio-to-asset-filter.component';
import { PortfolioOverlayListSelect } from 'src/portfolio/ui/portfolio-overlay-list-select.component';
import { PortfolioQuoteCard } from 'src/portfolio/ui/portfolio-quote-card.component';
import { PortfolioQuoteDisplayUtils } from 'src/portfolio/ui/portfolio-quote-display.utils';
import {
  canonicalAssetToTokenIdentityProps,
  portfolioRowToTokenIdentityProps,
  PortfolioTokenIdentity,
} from 'src/portfolio/ui/portfolio-token-identity.component';
import Logger from 'src/utils/logger.utils';
import { PortfolioUtils } from 'src/utils/porfolio.utils';

import { ethers } from 'ethers';
import ImageUtils from 'hive-keychain-commons/lib/utils/images.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

type PortfolioSection = 'portfolio' | PortfolioMode | 'history';
const PORTFOLIO_SECTION_HASHES: PortfolioSection[] = [
  'portfolio',
  'buy',
  'sell',
  'swap',
  'history',
];

const getPortfolioSectionFromHash = (hash: string): PortfolioSection => {
  const hashSection = hash.startsWith('#') ? hash.slice(1) : hash;
  return (
    PORTFOLIO_SECTION_HASHES.find((section) => section === hashSection) ??
    'portfolio'
  );
};

const replacePortfolioSectionHash = (section: PortfolioSection): void => {
  const hash = `#${section}`;
  if (window.location.hash === hash) {
    return;
  }

  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}${hash}`,
  );
};

type AccountOption =
  | {
      key: string;
      type: ChainType.HIVE;
      label: string;
      value: string;
      account: LocalAccount;
    }
  | {
      key: string;
      type: ChainType.EVM;
      label: string;
      value: string;
      accountName: string;
      account: EvmAccount;
    };
type PortfolioRow = {
  key: string;
  symbol: string;
  network: string;
  balance: string;
  usdValue: number | null;
  priceUsd: number | null;
  decimals?: number;
  logoUrl?: string | null;
  networkLogoUrl?: string | null;
  hiveAccountName?: string;
  chainId?: string | null;
  isTestnet?: boolean;
  breakdown?: PortfolioHiveEngineBalanceBreakdown;
};

type PortfolioNavSection = Exclude<PortfolioSection, 'bridge'>;

const sectionIcons: Record<PortfolioNavSection, SVGIcons> = {
  portfolio: SVGIcons.PORTOLIO,
  buy: SVGIcons.PORTFOLIO_BUY,
  sell: SVGIcons.PORTFOLIO_SELL,
  swap: SVGIcons.PORTFOLIO_SWAP,
  history: SVGIcons.PORTFOLIO_HISTORY,
};

const resolvePortfolioSignableTransaction = (
  quote: PortfolioQuote,
  execution: PortfolioExecution,
) => execution.transaction ?? quote.transaction;

const TO_ASSET_UNFILTERED_MAX = 50;
const TO_ASSET_FILTERED_MAX = 200;

const PORTFOLIO_SWAP_QUOTE_REFRESH_INTERVAL_MS = 30_000;
const PORTFOLIO_SWAP_QUOTE_REFRESH_INTERVAL_SECONDS = 30;
const PORTFOLIO_SWAP_QUOTE_DEBOUNCE_MS = 600;
const PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_MS = 15_000;
const PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_SECONDS = 15;

const mergePortfolioChainRecords = (
  current: PortfolioChainDisplayRecord,
  incoming: PortfolioChainDisplayRecord,
): PortfolioChainDisplayRecord => ({
  ...current,
  ...incoming,
});

const getAllNetworksOption = (): OptionItem => ({
  label: I18nUtils.getMessage('portfolio_all_networks'),
  value: '',
  key: 'all-networks',
});

const getOptionalPaymentMethodOption = (): OptionItem => ({
  label: I18nUtils.getMessage('portfolio_payment_method_none'),
  value: '',
  key: 'payment-method-none',
});

const isFiatRampSection = (
  section: PortfolioSection,
): section is 'buy' | 'sell' => section === 'buy' || section === 'sell';

const isQuoteAutoFetchSection = (
  section: PortfolioSection,
): section is 'buy' | 'sell' | 'swap' =>
  section === 'buy' || section === 'sell' || section === 'swap';

const resolveDefaultPortfolioAccountKey = (
  accountOptions: AccountOption[],
  activeAccountType: ChainType,
  activeEvmAccountAddress: string | undefined,
  activeHiveAccountName: string | undefined,
): string => {
  if (activeAccountType === ChainType.EVM) {
    const normalizedEvmAddress = activeEvmAccountAddress?.toLowerCase();
    if (normalizedEvmAddress) {
      const activeEvmKey = `evm:${normalizedEvmAddress}`;
      if (accountOptions.some((account) => account.key === activeEvmKey)) {
        return activeEvmKey;
      }
    }

    const firstEvmAccount = accountOptions.find(
      (account) => account.type === ChainType.EVM,
    );
    if (firstEvmAccount) {
      return firstEvmAccount.key;
    }
  }

  if (activeHiveAccountName) {
    const activeHiveKey = `hive:${activeHiveAccountName}`;
    if (accountOptions.some((account) => account.key === activeHiveKey)) {
      return activeHiveKey;
    }
  }

  const firstMatchingTypeAccount = accountOptions.find(
    (account) => account.type === activeAccountType,
  );
  if (firstMatchingTypeAccount) {
    return firstMatchingTypeAccount.key;
  }

  return accountOptions[0]?.key ?? '';
};

const buildEvmPortfolioChainByIdMap = (
  chains: EvmChain[],
): Map<string, EvmChain> => {
  const chainById = new Map<string, EvmChain>();

  for (const chain of chains) {
    chainById.set(chain.chainId.toLowerCase(), chain);
    chainById.set(evmChainIdToDecimalPathSegment(chain.chainId), chain);
  }

  return chainById;
};

const getEvmPortfolioChainKeys = (chain: EvmChain): Set<string> =>
  new Set([
    chain.chainId.toLowerCase(),
    evmChainIdToDecimalPathSegment(chain.chainId),
  ]);

const resolveEvmPortfolioChain = (
  chainById: Map<string, EvmChain>,
  chainId: string | undefined,
  fallbackChain?: EvmChain,
): EvmChain | null => {
  if (fallbackChain) {
    return fallbackChain;
  }

  if (!chainId) {
    return null;
  }

  const normalizedChainId = chainId.toLowerCase();
  return (
    chainById.get(normalizedChainId) ??
    chainById.get(evmChainIdToDecimalPathSegment(chainId)) ??
    null
  );
};

const getEvmTokenUsdValue = (token: NativeAndErc20Token): number | null => {
  const priceUsd = token.tokenInfo.priceUsd;
  if (
    priceUsd === null ||
    priceUsd === undefined ||
    !Number.isFinite(priceUsd) ||
    priceUsd === 0
  ) {
    return null;
  }

  const decimals =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? Number((token.tokenInfo as EvmSmartContractInfoErc20).decimals)
      : 18;
  const balance = Number(ethers.formatUnits(token.balance, decimals));

  return Number.isFinite(balance) ? priceUsd * balance : null;
};

const mapEvmTokenToPortfolioRow = (
  token: NativeAndErc20Token,
  chainById: Map<string, EvmChain>,
  chain?: EvmChain,
): PortfolioRow => {
  const resolvedChain = resolveEvmPortfolioChain(
    chainById,
    token.tokenInfo.chainId,
    chain,
  );
  const priceUsd =
    token.tokenInfo.priceUsd !== null &&
    token.tokenInfo.priceUsd !== undefined &&
    Number.isFinite(token.tokenInfo.priceUsd)
      ? token.tokenInfo.priceUsd
      : null;
  const contractAddress =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? (token.tokenInfo as EvmSmartContractInfoErc20).contractAddress
      : 'native';
  const rowChainId = resolvedChain?.chainId ?? token.tokenInfo.chainId ?? '';
  const decimals =
    token.tokenInfo.type === EVMSmartContractType.ERC20
      ? Number((token.tokenInfo as EvmSmartContractInfoErc20).decimals)
      : 18;

  return {
    key: `${rowChainId}:${token.tokenInfo.symbol}:${contractAddress}`,
    symbol: token.tokenInfo.symbol,
    network: resolvedChain?.name ?? '',
    balance: token.formattedBalance,
    usdValue: getEvmTokenUsdValue(token),
    priceUsd,
    decimals,
    logoUrl: token.tokenInfo.logo ?? null,
    networkLogoUrl: resolvedChain?.logo ?? null,
    chainId: rowChainId || null,
    isTestnet: resolvedChain?.testnet ?? false,
  };
};

const mergeEvmPortfolioRowsForChain = (
  currentRows: PortfolioRow[],
  chain: EvmChain,
  tokens: NativeAndErc20Token[],
  chainById: Map<string, EvmChain>,
): PortfolioRow[] => {
  const chainKeys = getEvmPortfolioChainKeys(chain);
  const nextRows = tokens.map((token) =>
    mapEvmTokenToPortfolioRow(token, chainById, chain),
  );

  return [
    ...currentRows.filter((row) => {
      const rowChainId = row.key.split(':')[0]?.toLowerCase() ?? '';
      return !chainKeys.has(rowChainId);
    }),
    ...nextRows,
  ];
};

const parsePortfolioAmountValue = (value: string): number =>
  Number(value.replace(/,/g, ''));

const isPositivePortfolioAmount = (value: string): boolean => {
  const amount = parsePortfolioAmountValue(value);
  return Number.isFinite(amount) && amount > 0;
};

const getStatusMessageKey = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message.startsWith('portfolio_')
    ? error.message
    : fallback;

const hasRequiredQuoteAssets = (options: {
  mode: PortfolioMode;
  fromAssetId?: string;
  toAssetId?: string;
}): boolean => {
  const hasFromAssetId = Boolean(options.fromAssetId);
  const hasToAssetId = Boolean(options.toAssetId);

  switch (options.mode) {
    case 'buy':
      return hasToAssetId;
    case 'sell':
      return hasFromAssetId;
    case 'swap':
      return hasFromAssetId && hasToAssetId;
    default:
      return false;
  }
};

const getVisiblePortfolioEvmAccounts = (accounts: EvmAccount[]) =>
  accounts.filter((account) => !account.hide);

const mapAccountSelectorListItemToPortfolioAccountOption = (
  item: AccountSelectorListItem,
): AccountOption => {
  if (item.type === ChainType.HIVE) {
    return {
      key: `hive:${item.account.name}`,
      type: ChainType.HIVE,
      label: `@${item.account.name}`,
      value: item.account.name,
      account: item.account,
    };
  }

  const accountName = EvmAccountUtils.getAccountName(item.account);

  return {
    key: `evm:${item.account.wallet.address.toLowerCase()}`,
    type: ChainType.EVM,
    label: accountName,
    value: item.account.wallet.address,
    accountName,
    account: item.account,
  };
};

const buildPortfolioAccountOptionsFromListItems = (
  listItems: AccountSelectorListItem[],
): AccountOption[] => {
  const seenEvmAddresses = new Set<string>();
  const options: AccountOption[] = [];

  for (const item of listItems) {
    if (item.type === ChainType.HIVE) {
      options.push(mapAccountSelectorListItemToPortfolioAccountOption(item));
      continue;
    }

    const address = item.account.wallet.address.toLowerCase();
    if (seenEvmAddresses.has(address)) {
      continue;
    }
    seenEvmAddresses.add(address);
    options.push(mapAccountSelectorListItemToPortfolioAccountOption(item));
  }

  return options;
};

const buildDefaultPortfolioAccountOptions = (
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
): AccountOption[] => {
  const visibleEvmAccounts = getVisiblePortfolioEvmAccounts(evmAccounts);
  const displayOrder = AccountSelectorOrderUtils.buildDefaultDisplayOrder(
    hiveAccounts,
    visibleEvmAccounts,
  );

  return buildPortfolioAccountOptionsFromListItems(
    AccountSelectorOrderUtils.buildOrderedListItems(
      hiveAccounts,
      visibleEvmAccounts,
      displayOrder,
    ),
  );
};

export const Portfolio = ({
  hiveAccounts,
  evmAccounts,
  activeHiveAccountName,
  activeEvmAccountAddress,
  activeAccountType,
  mk,
  setErrorMessage,
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  resetLoading,
}: PropsFromRedux) => {
  const [section, setSection] = useState<PortfolioSection>(() =>
    getPortfolioSectionFromHash(window.location.hash),
  );
  const [featureFlags, setFeatureFlags] = useState<PortfolioFeatureFlags>(
    DEFAULT_PORTFOLIO_FEATURE_FLAGS,
  );
  const sections = useMemo(
    () => PortfolioApiUtils.resolveVisiblePortfolioSections(featureFlags),
    [featureFlags],
  );
  const [selectedAccountKey, setSelectedAccountKey] = useState('');
  const [hasResolvedInitialAccountSelection, setHasResolvedInitialAccountSelection] =
    useState(false);
  const selectedAccountKeyRef = useRef(selectedAccountKey);
  const [expandedPortfolioRowKeys, setExpandedPortfolioRowKeys] = useState<
    string[]
  >([]);
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [assets, setAssets] = useState<PortfolioCanonicalAsset[]>([]);
  const [portfolioChains, setPortfolioChains] =
    useState<PortfolioChainDisplayRecord>({});
  const [history, setHistory] = useState<PortfolioHistoryItem[]>([]);
  const [hiveEngineTokenLogoUrls, setHiveEngineTokenLogoUrls] = useState<
    Record<string, string>
  >({});
  const [fromAssetId, setFromAssetId] = useState('');
  const [toAssetId, setToAssetId] = useState('');
  const [lastUsedSwapAssets, setLastUsedSwapAssets] =
    useState<PortfolioSwapLastUsedAssets | null>(null);
  const [hasLoadedLastUsedSwapAssets, setHasLoadedLastUsedSwapAssets] =
    useState(false);
  const [amount, setAmount] = useState('');
  const [fiatCurrency, setFiatCurrency] = useState(
    PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode(),
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [geoCountryCode, setGeoCountryCode] = useState<string | undefined>();
  const [preferredFiatCurrency, setPreferredFiatCurrency] = useState(
    PortfolioFiatLocaleUtils.getPreferredFiatCurrencyCode(),
  );
  const hasUserSelectedFiatRef = useRef(false);
  const [quoteResponse, setQuoteResponse] = useState<PortfolioQuoteResponse>();
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusMessageParams, setStatusMessageParams] = useState<string[]>();
  const [amountQuoteError, setAmountQuoteError] =
    useState<PortfolioLocalizedMessage | null>(null);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showCreatedExpiredHistory, setShowCreatedExpiredHistory] =
    useState(false);
  const [isFlowLoading, setIsFlowLoading] = useState(false);
  const [isSwapQuoteRequestPending, setIsSwapQuoteRequestPending] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteRefreshCountdown, setQuoteRefreshCountdown] = useState<
    number | null
  >(null);
  const [historyRefreshCountdown, setHistoryRefreshCountdown] = useState<
    number | null
  >(null);
  const [tokenFilter, setTokenFilter] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [toAssetFilter, setToAssetFilter] = useState('');
  const [toAssetChainFilter, setToAssetChainFilter] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientSelectValue, setRecipientSelectValue] = useState('');
  const [recipientFieldError, setRecipientFieldError] = useState<
    FieldError | undefined
  >();
  const [isQuotesPanelExpanded, setIsQuotesPanelExpanded] = useState(false);
  const isQuotesPanelExpandedRef = useRef(isQuotesPanelExpanded);
  const [setupEvmChains, setSetupEvmChains] = useState<EvmChain[]>([]);
  const [defaultEvmChains, setDefaultEvmChains] = useState<EvmChain[]>([]);
  const [fiatRampOptions, setFiatRampOptions] =
    useState<PortfolioFiatRampOptions | null>(null);
  const [isFiatRampOptionsLoading, setIsFiatRampOptionsLoading] =
    useState(false);
  const [rampAvailableAssets, setRampAvailableAssets] = useState<
    PortfolioCanonicalAsset[]
  >([]);
  const [isRampAvailableAssetsLoading, setIsRampAvailableAssetsLoading] =
    useState(false);
  const [swapAvailableAssets, setSwapAvailableAssets] = useState<
    PortfolioCanonicalAsset[]
  >([]);
  const [isSwapAvailableAssetsLoading, setIsSwapAvailableAssetsLoading] =
    useState(false);
  const [hasLoadedSwapAvailableAssets, setHasLoadedSwapAvailableAssets] =
    useState(false);
  const [pendingInAppConfirmation, setPendingInAppConfirmation] =
    useState<PortfolioInAppConfirmationContext | null>(null);
  const hasUserSelectedAccountRef = useRef(false);
  const initialActiveAccountTypeRef = useRef(activeAccountType);
  const initialActiveEvmAccountAddressRef = useRef(activeEvmAccountAddress);
  const initialActiveHiveAccountNameRef = useRef(activeHiveAccountName);
  const sectionRef = useRef(section);
  const loadedPortfolioAccountKeyRef = useRef('');
  const hasLoadedAssetsRef = useRef(false);
  const isAssetsLoadInFlightRef = useRef(false);
  const hasLoadedHistoryRef = useRef(false);
  const isHistoryLoadInFlightRef = useRef(false);
  const swapAvailableAssetsLoadedRef = useRef(false);
  const isSwapAvailableAssetsLoadInFlightRef = useRef(false);
  const setupEvmChainsPromiseRef = useRef<Promise<EvmChain[]> | null>(null);
  const hiveTokensPromiseRef = useRef<
    ReturnType<typeof TokensUtils.getAllTokens> | null
  >(null);

  const getHiveTokens = useCallback(() => {
    if (hiveTokensPromiseRef.current) {
      return hiveTokensPromiseRef.current;
    }

    const request = TokensUtils.getAllTokens().catch((error) => {
      hiveTokensPromiseRef.current = null;
      throw error;
    });
    hiveTokensPromiseRef.current = request;
    return request;
  }, []);

  const getSetupEvmChains = useCallback(() => {
    if (!setupEvmChainsPromiseRef.current) {
      setupEvmChainsPromiseRef.current =
        ChainUtils.getAllSetupChainsForType<EvmChain>(ChainType.EVM).catch(
          (error) => {
            setupEvmChainsPromiseRef.current = null;
            throw error;
          },
        );
    }

    return setupEvmChainsPromiseRef.current;
  }, []);

  const [accountOptions, setAccountOptions] = useState<AccountOption[]>(() =>
    buildDefaultPortfolioAccountOptions(hiveAccounts, evmAccounts),
  );

  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  useEffect(() => {
    selectedAccountKeyRef.current = selectedAccountKey;
  }, [selectedAccountKey]);

  useEffect(() => {
    replacePortfolioSectionHash(section);
  }, [section]);

  useEffect(() => {
    const handleHashChange = () => {
      setSection(getPortfolioSectionFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void PortfolioApiUtils.getFeatures()
      .then((features) => {
        if (!cancelled) {
          setFeatureFlags(features);
        }
      })
      .catch((error) => {
        Logger.error('Unable to load portfolio feature flags', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sections.some((visibleSection) => visibleSection === section)) {
      setSection('portfolio');
    }
  }, [section, sections]);

  useEffect(() => {
    let cancelled = false;
    const visibleEvmAccounts = getVisiblePortfolioEvmAccounts(evmAccounts);
    const fallbackOptions = buildDefaultPortfolioAccountOptions(
      hiveAccounts,
      evmAccounts,
    );

    const loadInitialAccountOptions = async () => {
      const orderedOptionsPromise = mk
        ? AccountSelectorOrderUtils.loadOrderedListItems(
            mk,
            hiveAccounts,
            visibleEvmAccounts,
          ).then(({ listItems }) =>
            buildPortfolioAccountOptionsFromListItems(listItems),
          )
        : Promise.resolve(fallbackOptions);
      const savedHiveAccountNamePromise = initialActiveHiveAccountNameRef.current
        ? Promise.resolve(initialActiveHiveAccountNameRef.current)
        : ActiveAccountUtils.getActiveAccountNameFromLocalStorage();
      const savedEvmAccountAddressPromise =
        initialActiveEvmAccountAddressRef.current
        ? Promise.resolve(initialActiveEvmAccountAddressRef.current)
        : visibleEvmAccounts.length > 0
          ? EvmActiveAccountUtils.getSavedActiveAccountWallet(
              visibleEvmAccounts,
            ).then((wallet) => wallet.address)
          : Promise.resolve(undefined);

      const [nextAccountOptions, savedHiveAccountName, savedEvmAccountAddress] =
        await Promise.all([
          orderedOptionsPromise,
          savedHiveAccountNamePromise,
          savedEvmAccountAddressPromise,
        ]);
      if (cancelled) {
        return;
      }

      const nextAccountKey = resolveDefaultPortfolioAccountKey(
        nextAccountOptions,
        initialActiveAccountTypeRef.current,
        savedEvmAccountAddress,
        savedHiveAccountName,
      );
      setAccountOptions(nextAccountOptions);
      setSelectedAccountKey((currentAccountKey) => {
        const selectedKey =
          hasUserSelectedAccountRef.current &&
          nextAccountOptions.some(
            (account) => account.key === currentAccountKey,
          )
            ? currentAccountKey
            : nextAccountKey;
        selectedAccountKeyRef.current = selectedKey;
        return selectedKey;
      });
      setHasResolvedInitialAccountSelection(true);
    };

    void loadInitialAccountOptions()
      .catch((error) => {
        Logger.error('Unable to load portfolio account order', error);
        if (!cancelled) {
          const fallbackAccountKey = resolveDefaultPortfolioAccountKey(
            fallbackOptions,
            initialActiveAccountTypeRef.current,
            initialActiveEvmAccountAddressRef.current,
            initialActiveHiveAccountNameRef.current,
          );
          setAccountOptions(fallbackOptions);
          selectedAccountKeyRef.current = fallbackAccountKey;
          setSelectedAccountKey(fallbackAccountKey);
          setHasResolvedInitialAccountSelection(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [evmAccounts, hiveAccounts, mk]);

  const selectedAccount =
    accountOptions.find((account) => account.key === selectedAccountKey) ??
    accountOptions[0];

  const overlayAccountOptions = useMemo(
    () =>
      accountOptions.map((account) => ({
        value: account.key,
        label: account.label,
      })),
    [accountOptions],
  );

  const historyAddressFilters = useMemo(() => {
    const addressSet = new Set<string>();

    for (const account of hiveAccounts) {
      const name = account.name?.trim();
      if (name) {
        addressSet.add(name);
      }
    }

    for (const account of evmAccounts) {
      const address = account.wallet?.address?.trim();
      if (address) {
        addressSet.add(address);
      }
    }

    return { addresses: [...addressSet] };
  }, [evmAccounts, hiveAccounts]);

  const toAssetEvmChains = useMemo(() => {
    const chainById = buildEvmPortfolioChainByIdMap(setupEvmChains);
    for (const chain of defaultEvmChains) {
      for (const key of getEvmPortfolioChainKeys(chain)) {
        if (!chainById.has(key)) {
          chainById.set(key, chain);
        }
      }
    }

    return [...new Set(chainById.values())];
  }, [defaultEvmChains, setupEvmChains]);

  const hasCreatedExpiredHistory = useMemo(
    () =>
      history.some((item) =>
        PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus(item),
      ),
    [history],
  );

  const visibleHistory = useMemo(
    () =>
      showCreatedExpiredHistory
        ? history
        : history.filter(
            (item) =>
              !PortfolioHistoryDisplayUtils.isCreatedOrExpiredHistoryStatus(
                item,
              ),
          ),
    [history, showCreatedExpiredHistory],
  );

  const hiveEngineHistorySymbols = useMemo(() => {
    const symbols = new Set<string>();
    for (const item of history) {
      for (const assetId of [item.fromAssetId, item.toAssetId]) {
        const symbol =
          PortfolioHistoryDisplayUtils.getPortfolioHistoryHiveEngineAssetSymbol(
            assetId,
          );
        if (symbol) {
          symbols.add(symbol);
        }
      }
    }
    return [...symbols].sort();
  }, [history]);
  const hiveEngineHistorySymbolsKey = hiveEngineHistorySymbols.join('|');

  useEffect(() => {
    if (!hiveEngineHistorySymbolsKey) {
      setHiveEngineTokenLogoUrls({});
      return;
    }

    let cancelled = false;
    const historySymbols = new Set(hiveEngineHistorySymbols);
    void getHiveTokens()
      .then((tokens) => {
        if (cancelled) {
          return;
        }

        const logoUrls: Record<string, string> = {};
        for (const token of tokens) {
          const symbol = token.symbol.toUpperCase();
          const icon = token.metadata.icon?.trim();
          if (historySymbols.has(symbol) && icon) {
            logoUrls[symbol] = ImageUtils.getImmutableImage(icon);
          }
        }
        setHiveEngineTokenLogoUrls(logoUrls);
      })
      .catch((error) => {
        Logger.error('Unable to load Hive Engine history token logos', error);
      });

    return () => {
      cancelled = true;
    };
  }, [getHiveTokens, hiveEngineHistorySymbolsKey]);

  const canonicalAssetsForRowResolution = useMemo(() => {
    const assetById = new Map<string, PortfolioCanonicalAsset>();
    const registerAssets = (assetList: PortfolioCanonicalAsset[]) => {
      for (const asset of assetList) {
        assetById.set(asset.assetId, asset);
      }
    };

    registerAssets(assets);
    registerAssets(swapAvailableAssets);
    registerAssets(rampAvailableAssets);

    return [...assetById.values()];
  }, [assets, rampAvailableAssets, swapAvailableAssets]);

  const swapSourceAssets = useMemo(
    () =>
      PortfolioFlowUtils.filterActionableSwapSourceAssets(swapAvailableAssets),
    [swapAvailableAssets],
  );

  const fromAssetOptions = useMemo(() => {
    const resolveRowCanonicalAssetId = (row: PortfolioFlowRow) =>
      PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
        row,
        canonicalAssetsForRowResolution,
        toAssetEvmChains,
        portfolioChains,
      );

    const resolveRowSwapFromAssetId = (row: PortfolioFlowRow) =>
      PortfolioFlowUtils.resolvePortfolioRowToSwapFromAssetId(
        row,
        swapSourceAssets,
        toAssetEvmChains,
        portfolioChains,
      );

    const rowHasResolvableAsset = (row: PortfolioFlowRow) => {
      if (section === 'swap' && swapSourceAssets.length > 0) {
        return Boolean(
          resolveRowSwapFromAssetId(row) || resolveRowCanonicalAssetId(row),
        );
      }

      return Boolean(resolveRowCanonicalAssetId(row));
    };

    const rowsWithCanonicalAsset = rows.filter((row) =>
      rowHasResolvableAsset(row),
    );
    const rowsWithPositiveBalance = rowsWithCanonicalAsset.filter(
      (row) =>
        PortfolioFlowUtils.hasPositivePortfolioBalance(row.balance) &&
        !row.isTestnet,
    );

    const rampAvailableAssetIds = new Set(
      rampAvailableAssets.map((asset) => asset.assetId),
    );
    const swapAvailableFromAssetIds = new Set(
      swapSourceAssets.map((asset) => asset.assetId),
    );
    const eligibleFromRows =
      section === 'sell' && rampAvailableAssetIds.size > 0
        ? rowsWithPositiveBalance.filter((row) => {
            const canonicalAssetId = resolveRowCanonicalAssetId(row);
            return (
              canonicalAssetId && rampAvailableAssetIds.has(canonicalAssetId)
            );
          })
        : section === 'swap' && swapAvailableFromAssetIds.size > 0
          ? rowsWithPositiveBalance.filter((row) => {
              const swapFromAssetId = resolveRowSwapFromAssetId(row);
              if (swapFromAssetId) {
                return true;
              }

              const canonicalAssetId = resolveRowCanonicalAssetId(row);
              return (
                canonicalAssetId !== undefined &&
                swapAvailableFromAssetIds.has(canonicalAssetId)
              );
            })
          : rowsWithPositiveBalance;

    const sortedEligibleFromRows = PortfolioUtils.sortPortfolioDisplayItems(
      eligibleFromRows,
      selectedAccount?.type === ChainType.HIVE,
    );

    return PortfolioFlowUtils.buildPortfolioFromSelectOptions(
      sortedEligibleFromRows,
    );
  }, [
    canonicalAssetsForRowResolution,
    portfolioChains,
    rampAvailableAssets,
    rows,
    section,
    selectedAccount?.type,
    swapSourceAssets,
    toAssetEvmChains,
  ]);

  const canonicalAssetById = useMemo(() => {
    const map = new Map<string, PortfolioCanonicalAsset>();
    const registerAssets = (assetList: PortfolioCanonicalAsset[]) => {
      for (const asset of assetList) {
        map.set(asset.assetId, asset);
      }
    };

    registerAssets(assets);
    registerAssets(swapAvailableAssets);
    registerAssets(rampAvailableAssets);

    return map;
  }, [assets, rampAvailableAssets, swapAvailableAssets]);

  const fromCanonicalAsset = useMemo(() => {
    if (!fromAssetId) {
      return undefined;
    }

    const selectedRow = rows.find((row) => row.key === fromAssetId);
    if (selectedRow && section === 'swap' && swapSourceAssets.length > 0) {
      const swapFromAssetId =
        PortfolioFlowUtils.resolvePortfolioRowToSwapFromAssetId(
          selectedRow,
          swapSourceAssets,
          toAssetEvmChains,
          portfolioChains,
        );
      if (swapFromAssetId) {
        return canonicalAssetById.get(swapFromAssetId);
      }
    }

    const canonicalAssetId =
      PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
        fromAssetId,
        rows,
        canonicalAssetsForRowResolution,
        toAssetEvmChains,
        portfolioChains,
      );
    if (!canonicalAssetId) {
      return undefined;
    }

    return canonicalAssetById.get(canonicalAssetId);
  }, [
    canonicalAssetById,
    canonicalAssetsForRowResolution,
    fromAssetId,
    portfolioChains,
    rows,
    section,
    swapSourceAssets,
    toAssetEvmChains,
  ]);

  const toCanonicalAsset = useMemo(() => {
    if (!toAssetId) {
      return undefined;
    }

    return canonicalAssetById.get(toAssetId);
  }, [canonicalAssetById, toAssetId]);

  // Buy filters destination accounts by to-asset type. Sell is wallet-first,
  // so it uses the full account list and derives assets from that wallet.
  const flowAccountKind =
    section === 'buy'
      ? PortfolioFlowUtils.resolvePortfolioFlowAccountKindForAsset(
          toCanonicalAsset,
        )
      : undefined;

  const flowAccountOptions = useMemo(() => {
    if (section !== 'buy' || !flowAccountKind) {
      return accountOptions;
    }

    const requiredType =
      flowAccountKind === 'hive' ? ChainType.HIVE : ChainType.EVM;

    return accountOptions.filter((account) => account.type === requiredType);
  }, [accountOptions, flowAccountKind, section]);

  const flowOverlayAccountOptions = useMemo(
    () =>
      flowAccountOptions.map((account) => ({
        value: account.key,
        label: account.label,
      })),
    [flowAccountOptions],
  );

  const flowSelectedAccount = useMemo(() => {
    if (section === 'buy' && flowAccountKind) {
      return (
        flowAccountOptions.find(
          (account) => account.key === selectedAccountKey,
        ) ?? flowAccountOptions[0]
      );
    }

    return selectedAccount;
  }, [
    flowAccountKind,
    flowAccountOptions,
    section,
    selectedAccount,
    selectedAccountKey,
  ]);

  const requiresRecipientInput = useMemo(
    () =>
      section !== 'sell' &&
      PortfolioFlowUtils.requiresPortfolioRecipientAddress(
        fromCanonicalAsset,
        toCanonicalAsset,
      ),
    [fromCanonicalAsset, section, toCanonicalAsset],
  );

  const recipientAddressLabelKey = useMemo(
    () =>
      PortfolioFlowUtils.resolvePortfolioRecipientAddressLabelKey(
        toCanonicalAsset,
      ),
    [toCanonicalAsset],
  );

  const recipientAccountKind = useMemo(
    () =>
      PortfolioFlowUtils.resolvePortfolioRecipientAccountKind(toCanonicalAsset),
    [toCanonicalAsset],
  );

  const recipientAccountOptions = useMemo(() => {
    if (!recipientAccountKind) {
      return [];
    }

    const requiredType =
      recipientAccountKind === 'hive' ? ChainType.HIVE : ChainType.EVM;

    return accountOptions.filter((account) => account.type === requiredType);
  }, [accountOptions, recipientAccountKind]);

  const shouldShowRecipientAccountSelect =
    requiresRecipientInput && recipientAccountOptions.length > 0;

  const recipientOverlayAccountOptions = useMemo(
    () => [
      ...recipientAccountOptions.map((account) => ({
        value: account.key,
        label: account.label,
      })),
      {
        value: PORTFOLIO_RECIPIENT_OTHER_VALUE,
        label: I18nUtils.getMessage('global_other'),
      },
    ],
    [recipientAccountOptions],
  );

  const flowMode = section as PortfolioMode;

  const selectedAccountFromAddress = useMemo(() => {
    if (!flowSelectedAccount) {
      return undefined;
    }

    return flowSelectedAccount.type === ChainType.EVM
      ? flowSelectedAccount.account.wallet.address
      : flowSelectedAccount.account.name;
  }, [flowSelectedAccount]);

  const resolvedToAddress = useMemo(() => {
    if (!selectedAccountFromAddress) {
      return undefined;
    }

    if (flowMode === 'sell') {
      return selectedAccountFromAddress;
    }

    return PortfolioFlowUtils.resolvePortfolioToAddress({
      fromAddress: selectedAccountFromAddress,
      recipientAddress,
      fromAsset: fromCanonicalAsset,
      toAsset: toCanonicalAsset,
    });
  }, [
    flowMode,
    fromCanonicalAsset,
    recipientAddress,
    selectedAccountFromAddress,
    toCanonicalAsset,
  ]);

  const quoteToAddress = useMemo(() => {
    if (!selectedAccountFromAddress) {
      return undefined;
    }

    if (flowMode === 'sell') {
      return selectedAccountFromAddress;
    }

    return PortfolioFlowUtils.resolvePortfolioQuoteToAddress({
      fromAddress: selectedAccountFromAddress,
      recipientAddress,
      fromAsset: fromCanonicalAsset,
      toAsset: toCanonicalAsset,
    });
  }, [
    flowMode,
    fromCanonicalAsset,
    recipientAddress,
    selectedAccountFromAddress,
    toCanonicalAsset,
  ]);

  const resolvedFromAssetId = useMemo(
    () =>
      flowMode === 'buy'
        ? undefined
        : PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
            fromAssetId,
            rows,
            canonicalAssetsForRowResolution,
            toAssetEvmChains,
            portfolioChains,
          ),
    [
      canonicalAssetsForRowResolution,
      flowMode,
      fromAssetId,
      portfolioChains,
      rows,
      toAssetEvmChains,
    ],
  );

  const resolvedToAssetId =
    flowMode === 'sell' ? undefined : toAssetId || undefined;

  const selectedFromRow = useMemo(
    () => rows.find((row) => row.key === fromAssetId),
    [rows, fromAssetId],
  );

  const canSetAmountToMax =
    (flowMode === 'swap' || flowMode === 'sell') && Boolean(selectedFromRow);

  const handleSetAmountToMax = () => {
    if (!canSetAmountToMax || !selectedFromRow) {
      return;
    }

    setAmount(selectedFromRow.balance.replace(/,/g, '').trim());
  };

  const hasInsufficientFromBalance = useMemo(() => {
    if (process.env.PORTFOLIO_SKIP_BALANCE_CHECK === 'true') {
      return false;
    }

    if (
      (flowMode !== 'swap' && flowMode !== 'sell') ||
      !amount ||
      !selectedFromRow
    ) {
      return false;
    }

    const requestedAmount = Number(amount.replace(/,/g, ''));
    const availableBalance = Number(selectedFromRow.balance.replace(/,/g, ''));
    return (
      Number.isFinite(requestedAmount) &&
      Number.isFinite(availableBalance) &&
      requestedAmount > availableBalance
    );
  }, [amount, flowMode, selectedFromRow]);

  const canFillMinimumAmount = useMemo(
    () =>
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: amountQuoteError?.fillAmount,
        availableBalance:
          flowMode === 'swap' || flowMode === 'sell'
            ? selectedFromRow?.balance
            : undefined,
        // Buy/sell fiat mins have no crypto balance to gate against.
        skipBalanceCheck:
          process.env.PORTFOLIO_SKIP_BALANCE_CHECK === 'true' ||
          flowMode === 'buy',
      }),
    [amountQuoteError?.fillAmount, flowMode, selectedFromRow?.balance],
  );

  const quoteAmountHint = useMemo(
    () =>
      PortfolioApiUtils.resolvePortfolioQuoteAmountHint(
        quoteResponse?.amountHints,
      ),
    [quoteResponse?.amountHints],
  );

  const canFillAmountHint = useMemo(
    () =>
      PortfolioApiUtils.canFillPortfolioMinimumAmount({
        fillAmount: quoteAmountHint?.fillAmount,
        availableBalance:
          flowMode === 'swap' || flowMode === 'sell'
            ? selectedFromRow?.balance
            : undefined,
        skipBalanceCheck:
          process.env.PORTFOLIO_SKIP_BALANCE_CHECK === 'true' ||
          flowMode === 'buy',
      }),
    [flowMode, quoteAmountHint?.fillAmount, selectedFromRow?.balance],
  );

  const handleFillMinimumAmount = () => {
    if (!canFillMinimumAmount || !amountQuoteError?.fillAmount) {
      return;
    }

    setAmount(amountQuoteError.fillAmount);
  };

  const handleFillAmountHint = () => {
    if (!canFillAmountHint || !quoteAmountHint?.fillAmount) {
      return;
    }

    setAmount(quoteAmountHint.fillAmount);
  };

  const canRequestQuotes =
    isPositivePortfolioAmount(amount) &&
    Boolean(quoteToAddress) &&
    !hasInsufficientFromBalance &&
    hasRequiredQuoteAssets({
      mode: flowMode,
      fromAssetId: resolvedFromAssetId,
      toAssetId: resolvedToAssetId,
    }) &&
    (!isFiatRampSection(section) || Boolean(fiatCurrency.trim()));

  useEffect(() => {
    setRecipientAddress('');
    setRecipientSelectValue('');
    setRecipientFieldError(undefined);
  }, [fromAssetId, toAssetId]);

  useEffect(() => {
    setRecipientFieldError(undefined);
  }, [recipientAddress]);

  useEffect(() => {
    if (!shouldShowRecipientAccountSelect) {
      return;
    }

    if (recipientSelectValue === PORTFOLIO_RECIPIENT_OTHER_VALUE) {
      return;
    }

    if (
      recipientSelectValue &&
      recipientAccountOptions.some(
        (account) => account.key === recipientSelectValue,
      )
    ) {
      return;
    }

    const defaultAccountKey = resolveDefaultPortfolioAccountKey(
      recipientAccountOptions,
      recipientAccountKind === 'hive' ? ChainType.HIVE : ChainType.EVM,
      activeEvmAccountAddress,
      activeHiveAccountName,
    );
    const defaultAccount = recipientAccountOptions.find(
      (account) => account.key === defaultAccountKey,
    );
    if (!defaultAccount) {
      return;
    }

    setRecipientSelectValue(defaultAccount.key);
    setRecipientAddress(defaultAccount.value);
  }, [
    activeEvmAccountAddress,
    activeHiveAccountName,
    recipientAccountKind,
    recipientAccountOptions,
    recipientSelectValue,
    shouldShowRecipientAccountSelect,
  ]);

  useEffect(() => {
    isQuotesPanelExpandedRef.current = isQuotesPanelExpanded;
  }, [isQuotesPanelExpanded]);

  useEffect(() => {
    setIsQuotesPanelExpanded(false);
  }, [amount, fromAssetId, toAssetId, selectedAccountKey]);

  useEffect(() => {
    setAmountQuoteError(null);
  }, [amount]);

  const eligibleToAssets = useMemo(() => {
    const toAssets = (() => {
      if (section === 'buy') {
        const buyAssets =
          rampAvailableAssets.length > 0 ? rampAvailableAssets : assets;
        return PortfolioFlowUtils.filterToAssetsByFromAsset(
          buyAssets,
          undefined,
        );
      }

      if (section === 'swap') {
        return PortfolioFlowUtils.filterToAssetsByFromAsset(
          swapAvailableAssets,
          fromCanonicalAsset,
        );
      }

      if (section === 'sell') {
        return [];
      }

      if (!fromCanonicalAsset) {
        return PortfolioFlowUtils.filterToAssetsByFromAsset(assets, undefined);
      }

      return PortfolioFlowUtils.filterToAssetsByFromAsset(
        assets,
        fromCanonicalAsset,
      );
    })();

    return PortfolioFlowUtils.sortCanonicalAssetsByRank(
      toAssets,
      portfolioChains,
    );
  }, [
    assets,
    fromCanonicalAsset,
    portfolioChains,
    rampAvailableAssets,
    section,
    swapAvailableAssets,
  ]);

  const toAssetOptions = useMemo(
    () =>
      PortfolioFlowUtils.buildCanonicalAssetSelectOptions(
        eligibleToAssets,
        toAssetEvmChains,
        portfolioChains,
      ),
    [eligibleToAssets, portfolioChains, toAssetEvmChains],
  );

  const toAssetChainFilterOptions = useMemo(
    () =>
      PortfolioFlowUtils.buildCanonicalAssetChainFilterOptions(
        eligibleToAssets,
        toAssetEvmChains,
        portfolioChains,
      ),
    [eligibleToAssets, portfolioChains, toAssetEvmChains],
  );

  const hasToAssetFilters = Boolean(toAssetFilter.trim() || toAssetChainFilter);

  const filteredToAssetResult = useMemo(
    () =>
      PortfolioFlowUtils.filterCanonicalAssets(eligibleToAssets, {
        textFilter: toAssetFilter,
        chainFilter: toAssetChainFilter,
        chains: toAssetEvmChains,
        portfolioChains,
        maxResults: hasToAssetFilters
          ? TO_ASSET_FILTERED_MAX
          : TO_ASSET_UNFILTERED_MAX,
      }),
    [eligibleToAssets, hasToAssetFilters, portfolioChains, toAssetChainFilter, toAssetFilter, toAssetEvmChains],
  );

  const filteredToAssetOptions = useMemo(
    () =>
      PortfolioFlowUtils.buildCanonicalAssetSelectOptions(
        filteredToAssetResult.assets,
        toAssetEvmChains,
        portfolioChains,
      ),
    [filteredToAssetResult.assets, portfolioChains, toAssetEvmChains],
  );

  const toAssetChainSelectOptions = useMemo<OptionItem[]>(
    () =>
      toAssetChainFilterOptions.map((option) => ({
        key: option.key,
        label: option.label,
        value: option.value,
        img: option.img,
        imgChip: option.imgChip,
      })),
    [toAssetChainFilterOptions],
  );

  const toAssetTruncatedCount =
    filteredToAssetResult.totalMatches - filteredToAssetResult.assets.length;

  const selectedToAssetChainOption =
    toAssetChainSelectOptions.find(
      (option) => option.value === toAssetChainFilter,
    ) ?? getAllNetworksOption();

  const portfolioRowByKey = useMemo(
    () => new Map(rows.map((row) => [row.key, row])),
    [rows],
  );

  const networkSelectOptions = useMemo<OptionItem[]>(
    () => [
      getAllNetworksOption(),
      ...setupEvmChains.map((chain) => ({
        key: chain.chainId,
        label: chain.name,
        value: chain.name,
        img: chain.logo,
        imgChip: chain.testnet ? SVGIcons.EVM_CHAIN_TESTNET : undefined,
      })),
    ],
    [setupEvmChains],
  );

  const overlayNetworkOptions = useMemo(
    () =>
      networkSelectOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [networkSelectOptions],
  );

  const fiatCurrencySelectOptions = useMemo<OptionItem[]>(() => {
    const toFiatCurrencyOption = (currency: string): OptionItem => {
      const { label, subLabel } =
        PortfolioFiatLocaleUtils.getFiatCurrencySelectOptionFields(currency);
      return {
        key: currency,
        label,
        subLabel,
        value: currency,
      };
    };

    if (fiatRampOptions?.fiatCurrencies.length) {
      return fiatRampOptions.fiatCurrencies.map(toFiatCurrencyOption);
    }

    return fiatCurrency ? [toFiatCurrencyOption(fiatCurrency)] : [];
  }, [fiatCurrency, fiatRampOptions]);

  const overlayFiatCurrencyOptions = useMemo(
    () =>
      fiatCurrencySelectOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [fiatCurrencySelectOptions],
  );

  const fallbackFiatCurrencyOption: OptionItem = {
    key: fiatCurrency,
    ...PortfolioFiatLocaleUtils.getFiatCurrencySelectOptionFields(fiatCurrency),
    value: fiatCurrency,
  };

  const selectedFiatCurrencyOption =
    fiatCurrencySelectOptions.find((option) => option.value === fiatCurrency) ??
    fiatCurrencySelectOptions[0] ??
    fallbackFiatCurrencyOption;

  const paymentMethodSelectOptions = useMemo<OptionItem[]>(() => {
    const methods = PortfolioFiatLocaleUtils.toPaymentMethodPickerItems(
      fiatRampOptions?.paymentMethods ?? [],
    ).map((method) => {
      const logo = PortfolioFiatLocaleUtils.getPaymentMethodLogo(method.id);
      return {
        key: method.id,
        label: PortfolioFiatLocaleUtils.getPaymentMethodLabel(method),
        value: method.id,
        ...(logo ? { img: logo } : {}),
      };
    });

    return [getOptionalPaymentMethodOption(), ...methods];
  }, [fiatRampOptions]);

  const overlayPaymentMethodOptions = useMemo(
    () =>
      paymentMethodSelectOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [paymentMethodSelectOptions],
  );

  const selectedPaymentMethodOption =
    paymentMethodSelectOptions.find(
      (option) => option.value === paymentMethod,
    ) ?? getOptionalPaymentMethodOption();

  const renderFromAssetIdentity = (rowKey: string) => {
    const row = portfolioRowByKey.get(rowKey);
    if (!row) {
      return rowKey;
    }

    return (
      <PortfolioTokenIdentity
        {...portfolioRowToTokenIdentityProps(row)}
        balance={PortfolioFlowUtils.formatPortfolioTokenBalance(row.balance)}
      />
    );
  };

  const renderToAssetIdentity = (assetId: string) => {
    const asset = canonicalAssetById.get(assetId);
    if (!asset) {
      return assetId;
    }

    return (
      <PortfolioTokenIdentity
        {...canonicalAssetToTokenIdentityProps(
          asset,
          toAssetEvmChains,
          portfolioChains,
        )}
      />
    );
  };

  useEffect(() => {
    setTitleContainerProperties({
      title: '',
      isCloseButtonDisabled: true,
    });
  }, []);

  useEffect(() => {
    if (!hasResolvedInitialAccountSelection || !selectedAccountKey) return;

    const shouldLoadBalances =
      section === 'portfolio' || section === 'sell' || section === 'swap';
    if (!shouldLoadBalances) return;

    const account = accountOptions.find(
      (item) => item.key === selectedAccountKey,
    );
    if (!account) return;

    if (loadedPortfolioAccountKeyRef.current === selectedAccountKey) return;
    loadedPortfolioAccountKeyRef.current = selectedAccountKey;
    void loadPortfolio({ clearRows: true });
  }, [
    accountOptions,
    hasResolvedInitialAccountSelection,
    section,
    selectedAccountKey,
  ]);

  useEffect(() => {
    if (section !== 'buy' || !flowAccountKind || !flowAccountOptions.length) {
      return;
    }

    const requiredType =
      flowAccountKind === 'hive' ? ChainType.HIVE : ChainType.EVM;
    const nextAccountKey = resolveDefaultPortfolioAccountKey(
      flowAccountOptions,
      requiredType,
      activeEvmAccountAddress,
      activeHiveAccountName,
    );
    if (!nextAccountKey) {
      return;
    }

    setSelectedAccountKey((currentAccountKey) =>
      flowAccountOptions.some((account) => account.key === currentAccountKey)
        ? currentAccountKey
        : nextAccountKey,
    );
  }, [
    activeEvmAccountAddress,
    activeHiveAccountName,
    flowAccountKind,
    flowAccountOptions,
    section,
  ]);

  const handleSelectedAccountChange = useCallback((accountKey: string) => {
    hasUserSelectedAccountRef.current = true;
    selectedAccountKeyRef.current = accountKey;
    setExpandedPortfolioRowKeys([]);
    setSelectedAccountKey(accountKey);
  }, []);

  const handleRecipientSelectChange = useCallback(
    (value: string) => {
      setRecipientSelectValue(value);
      if (value === PORTFOLIO_RECIPIENT_OTHER_VALUE) {
        setRecipientAddress('');
        return;
      }

      const selectedRecipientAccount = recipientAccountOptions.find(
        (account) => account.key === value,
      );
      setRecipientAddress(selectedRecipientAccount?.value ?? '');
    },
    [recipientAccountOptions],
  );

  const togglePortfolioRowExpanded = useCallback((rowKey: string) => {
    setExpandedPortfolioRowKeys((currentKeys) =>
      currentKeys.includes(rowKey)
        ? currentKeys.filter((key) => key !== rowKey)
        : [...currentKeys, rowKey],
    );
  }, []);

  const handleTokenFilterChange = useCallback((value: string) => {
    setTokenFilter(value);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSetupEvmChains = async () => {
      try {
        const chains = await getSetupEvmChains();
        if (!cancelled) {
          setSetupEvmChains(chains);
        }
      } catch (error) {
        Logger.error('Unable to load portfolio setup chains', error);
        if (!cancelled) {
          setSetupEvmChains([]);
        }
      }
    };

    void loadSetupEvmChains();

    return () => {
      cancelled = true;
    };
  }, [getSetupEvmChains]);

  useEffect(() => {
    let cancelled = false;

    const loadDefaultEvmChains = async () => {
      try {
        const chains = await ChainUtils.getDefaultChains();
        if (!cancelled) {
          setDefaultEvmChains(
            chains.filter(
              (chain): chain is EvmChain => chain.type === ChainType.EVM,
            ),
          );
        }
      } catch (error) {
        Logger.error('Unable to load portfolio default chains', error);
        if (!cancelled) {
          setDefaultEvmChains([]);
        }
      }
    };

    void loadDefaultEvmChains();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetFlowFormFields = () => {
    setAmount('');
    setPaymentMethod('');
    setRecipientAddress('');
    setRecipientSelectValue('');
    setRecipientFieldError(undefined);
    setAmountQuoteError(null);
    setPendingInAppConfirmation(null);
    setIsQuotesPanelExpanded(false);
  };

  useEffect(() => {
    // Buy destination account is independent of asset/amount selections.
    if (sectionRef.current === 'buy') {
      setRecipientAddress('');
      setRecipientSelectValue('');
      setRecipientFieldError(undefined);
      setAmountQuoteError(null);
      setPendingInAppConfirmation(null);
      setIsQuotesPanelExpanded(false);
      return;
    }

    setFromAssetId('');
    setToAssetId('');
    setToAssetFilter('');
    setToAssetChainFilter('');
    resetFlowFormFields();
  }, [selectedAccountKey]);

  useEffect(() => {
    let cancelled = false;
    void PortfolioFlowUtils.getLastUsedSwapAssets()
      .then((lastUsed) => {
        if (!cancelled) {
          setLastUsedSwapAssets(lastUsed);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHasLoadedLastUsedSwapAssets(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistLastUsedSwapAssets = useCallback(
    (fromCanonicalAssetId?: string, toCanonicalAssetId?: string) => {
      if (!fromCanonicalAssetId || !toCanonicalAssetId) {
        return;
      }

      void PortfolioFlowUtils.saveLastUsedSwapAssets(
        fromCanonicalAssetId,
        toCanonicalAssetId,
      ).then(() => {
        setLastUsedSwapAssets({
          fromAssetId: fromCanonicalAssetId,
          toAssetId: toCanonicalAssetId,
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!fromAssetOptions.length) {
      if (fromAssetId) {
        setFromAssetId('');
      }
      return;
    }

    if (fromAssetOptions.some((option) => option.value === fromAssetId)) {
      return;
    }

    if (section === 'swap' && !hasLoadedLastUsedSwapAssets) {
      return;
    }

    const preferredFromOptionValue =
      section === 'swap'
        ? PortfolioFlowUtils.resolveFromSelectOptionValueForAssetId(
            lastUsedSwapAssets?.fromAssetId,
            fromAssetOptions,
            rows,
            canonicalAssetsForRowResolution,
            toAssetEvmChains,
            portfolioChains,
            swapSourceAssets,
          )
        : undefined;

    setFromAssetId(
      PortfolioFlowUtils.getDefaultSelectOptionValue(
        fromAssetOptions,
        preferredFromOptionValue,
      ),
    );
  }, [
    canonicalAssetsForRowResolution,
    fromAssetId,
    fromAssetOptions,
    hasLoadedLastUsedSwapAssets,
    lastUsedSwapAssets?.fromAssetId,
    portfolioChains,
    rows,
    section,
    swapSourceAssets,
    toAssetEvmChains,
  ]);

  useEffect(() => {
    if (!toAssetOptions.length) {
      if (toAssetId) {
        setToAssetId('');
      }
      return;
    }

    if (toAssetOptions.some((option) => option.value === toAssetId)) {
      return;
    }

    if (section === 'swap' && !hasLoadedLastUsedSwapAssets) {
      return;
    }

    const preferredToAssetId =
      section === 'swap' ? lastUsedSwapAssets?.toAssetId : undefined;

    setToAssetId(
      PortfolioFlowUtils.getDefaultSelectOptionValue(
        toAssetOptions,
        preferredToAssetId,
      ),
    );
  }, [
    hasLoadedLastUsedSwapAssets,
    lastUsedSwapAssets?.toAssetId,
    section,
    toAssetId,
    toAssetOptions,
  ]);

  useEffect(() => {
    setQuoteResponse(undefined);
    setSelectedQuoteId('');
    resetFlowFormFields();
    if (section === 'portfolio') {
      setSelectedNetwork('');
    }
    if (section !== 'buy' && section !== 'swap') {
      setToAssetFilter('');
      setToAssetChainFilter('');
    }
  }, [section]);

  const historyRefreshDeadlineRef = useRef(0);

  const refreshHistorySilently = useCallback(() => {
    historyRefreshDeadlineRef.current = 0;
    setHistoryRefreshCountdown(null);
    void PortfolioApiUtils.listHistory(1, historyAddressFilters)
      .then(setHistory)
      .catch((error) => {
        Logger.error('Unable to auto-refresh portfolio history', error);
      })
      .finally(() => {
        historyRefreshDeadlineRef.current =
          Date.now() + PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_MS;
        setHistoryRefreshCountdown(
          PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_SECONDS,
        );
      });
  }, [historyAddressFilters]);

  useEffect(() => {
    if (section !== 'history' || !selectedAccountKey) {
      historyRefreshDeadlineRef.current = 0;
      setHistoryRefreshCountdown(null);
      return;
    }

    historyRefreshDeadlineRef.current =
      Date.now() + PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_MS;
    setHistoryRefreshCountdown(PORTFOLIO_HISTORY_AUTO_REFRESH_INTERVAL_SECONDS);

    const countdownIntervalId = setInterval(() => {
      if (!historyRefreshDeadlineRef.current) return;

      const remainingMs = historyRefreshDeadlineRef.current - Date.now();
      if (remainingMs <= 0) {
        refreshHistorySilently();
        return;
      }

      setHistoryRefreshCountdown(Math.ceil(remainingMs / 1000));
    }, 1000);

    return () => clearInterval(countdownIntervalId);
  }, [section, selectedAccountKey, refreshHistorySilently]);

  const loadFiatRampOptions = async (mode: 'buy' | 'sell') => {
    setIsFiatRampOptionsLoading(true);
    try {
      const options = await PortfolioApiUtils.getFiatRampOptions({
        mode,
      });
      setFiatRampOptions(options);
    } catch (error) {
      Logger.error('Unable to load fiat ramp options', error);
      setFiatRampOptions(null);
    } finally {
      setIsFiatRampOptionsLoading(false);
    }
  };

  const loadRampAvailableAssets = async (mode: 'buy' | 'sell') => {
    setIsRampAvailableAssetsLoading(true);
    try {
      const response = await PortfolioApiUtils.listAvailableAssets({
        mode,
        direction: mode === 'buy' ? 'to' : 'from',
      });
      setRampAvailableAssets(response.assets);
      setPortfolioChains((current) =>
        mergePortfolioChainRecords(current, response.chains),
      );
    } catch (error) {
      Logger.error('Unable to load ramp available assets', error);
      setRampAvailableAssets([]);
    } finally {
      setIsRampAvailableAssetsLoading(false);
    }
  };

  const loadSwapAvailableAssets = async () => {
    if (swapAvailableAssetsLoadedRef.current) {
      setHasLoadedSwapAvailableAssets(true);
      return;
    }

    if (isSwapAvailableAssetsLoadInFlightRef.current) {
      return;
    }

    isSwapAvailableAssetsLoadInFlightRef.current = true;
    setIsSwapAvailableAssetsLoading(true);
    let hasCachedCatalog = false;
    try {
      const cached =
        await PortfolioSwapCatalogCacheUtils.getCachedSwapCatalog();
      if (cached) {
        hasCachedCatalog = true;
        setSwapAvailableAssets(cached.response.assets);
        setPortfolioChains((current) =>
          mergePortfolioChainRecords(current, cached.response.chains),
        );
        setHasLoadedSwapAvailableAssets(true);
        setIsSwapAvailableAssetsLoading(false);
        swapAvailableAssetsLoadedRef.current = true;
      }

      const response =
        await PortfolioSwapCatalogCacheUtils.ensureSwapCatalogCached();
      setSwapAvailableAssets(response.assets);
      setPortfolioChains((current) =>
        mergePortfolioChainRecords(current, response.chains),
      );
      swapAvailableAssetsLoadedRef.current = response.assets.length > 0;
    } catch (error) {
      Logger.error('Unable to load swap available assets', error);
      if (!hasCachedCatalog) {
        setSwapAvailableAssets([]);
      }
    } finally {
      isSwapAvailableAssetsLoadInFlightRef.current = false;
      setIsSwapAvailableAssetsLoading(false);
      setHasLoadedSwapAvailableAssets(true);
    }
  };

  const preloadSwapAvailableAssets = (): Promise<void> => {
    return loadSwapAvailableAssets();
  };

  useEffect(() => {
    void preloadSwapAvailableAssets();
  }, []);

  useEffect(() => {
    if (!isFiatRampSection(section)) {
      setFiatRampOptions(null);
      setRampAvailableAssets([]);
      return;
    }

    void loadFiatRampOptions(section);
    void loadRampAvailableAssets(section);

    let cancelled = false;
    void (async () => {
      let backendCountryCode: string | null = null;
      try {
        const locale = await PortfolioApiUtils.getFiatRampLocale();
        backendCountryCode = locale.countryCode;
      } catch (error) {
        Logger.error('Unable to load fiat ramp locale from API', error);
      }

      const resolved =
        await PortfolioFiatLocaleUtils.resolvePreferredFiatLocale({
          backendCountryCode,
        });
      if (cancelled) {
        return;
      }

      setGeoCountryCode(resolved.countryCode);
      setPreferredFiatCurrency(resolved.fiatCurrency);
      if (!hasUserSelectedFiatRef.current) {
        setFiatCurrency(resolved.fiatCurrency);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [section]);

  useEffect(() => {
    if (section !== 'swap') {
      return;
    }

    void loadSwapAvailableAssets();
  }, [section]);

  useEffect(() => {
    if (!fiatRampOptions?.fiatCurrencies.length) {
      return;
    }

    if (hasUserSelectedFiatRef.current) {
      setFiatCurrency((current) =>
        fiatRampOptions.fiatCurrencies.includes(current)
          ? current
          : PortfolioFiatLocaleUtils.pickPreferredFiatCurrency(
              fiatRampOptions.fiatCurrencies,
              preferredFiatCurrency,
            ),
      );
      return;
    }

    setFiatCurrency(
      PortfolioFiatLocaleUtils.pickPreferredFiatCurrency(
        fiatRampOptions.fiatCurrencies,
        preferredFiatCurrency,
      ),
    );
  }, [fiatRampOptions, preferredFiatCurrency]);

  useEffect(() => {
    if (!fiatRampOptions?.paymentMethods.length) {
      return;
    }

    const validPaymentMethodIds = new Set(
      paymentMethodSelectOptions
        .map((option) => option.value)
        .filter((value) => value.length > 0),
    );
    setPaymentMethod((current) =>
      current && !validPaymentMethodIds.has(current) ? '' : current,
    );
  }, [fiatRampOptions, paymentMethodSelectOptions]);

  const loadAssets = async (force = false) => {
    if (
      (!force && hasLoadedAssetsRef.current) ||
      isAssetsLoadInFlightRef.current
    ) {
      return;
    }

    isAssetsLoadInFlightRef.current = true;
    try {
      const response = await PortfolioApiUtils.listAssets();
      setAssets(response.assets);
      setPortfolioChains((current) =>
        mergePortfolioChainRecords(current, response.chains),
      );
      hasLoadedAssetsRef.current = true;
    } catch (error) {
      Logger.error('Unable to load portfolio assets', error);
    } finally {
      isAssetsLoadInFlightRef.current = false;
    }
  };

  const loadPortfolio = async (options?: { clearRows?: boolean }) => {
    const clearRows = options?.clearRows ?? false;
    const accountKey = selectedAccountKey;
    if (!accountKey) return;

    const account = accountOptions.find((item) => item.key === accountKey);
    if (!account) return;

    setIsPortfolioLoading(true);
    if (clearRows) {
      setStatusMessage('');
      setStatusMessageParams(undefined);
      setRows([]);
    }

    if (account.type === ChainType.HIVE) {
      try {
        const extendedAccounts = await AccountUtils.getExtendedAccounts([
          account.account.name,
        ]);
        const { portfolio, tokens: hiveTokens } =
          await PortfolioUtils.getPortfolio(extendedAccounts, {
            loadTokens: getHiveTokens,
          });
        if (selectedAccountKeyRef.current !== accountKey) return;
        const sortedBalances =
          PortfolioUtils.sortHivePortfolioBalancesByDisplayOrder(
            portfolio[0]?.balances ?? [],
          );
        const nextRows = sortedBalances.map((balance) => {
          const tokenIcon = hiveTokens
            .find((token) => token.symbol === balance.symbol)
            ?.metadata.icon?.trim();

          return {
            key: `hive:${balance.symbol}`,
            symbol: balance.symbol,
            network: 'Hive',
            balance: balance.balance.toString(),
            usdValue: balance.usdValue,
            priceUsd:
              balance.priceUsd ??
              (balance.balance > 0
                ? balance.usdValue / balance.balance
                : null),
            decimals: PortfolioFlowUtils.resolveHiveTokenDecimals(
              balance.symbol,
              hiveTokens,
            ),
            logoUrl: tokenIcon
              ? ImageUtils.getImmutableImage(tokenIcon)
              : null,
            hiveAccountName: account.account.name,
            chainId: null,
            isTestnet: false,
            isHive: true,
            breakdown: balance.breakdown,
          };
        });
        setRows(nextRows);
      } catch (error) {
        if (selectedAccountKeyRef.current !== accountKey) return;
        Logger.error('Unable to load portfolio balances', error);
        setStatusMessage('portfolio_load_error');
        setStatusMessageParams(undefined);
        setRows([]);
      } finally {
        if (selectedAccountKeyRef.current === accountKey) {
          setIsPortfolioLoading(false);
        }
      }
      return;
    }

    void loadEvmPortfolioRows(accountKey, account);
  };

  const loadEvmPortfolioRows = async (
    accountKey: string,
    account: Extract<AccountOption, { type: ChainType.EVM }>,
  ) => {
    const failedChainNames: string[] = [];

    try {
      const chains = await getSetupEvmChains();
      if (selectedAccountKeyRef.current !== accountKey) return;

      const chainById = buildEvmPortfolioChainByIdMap(chains);
      const walletAddress = account.account.wallet.address;
      const totalChains = chains.length;

      if (totalChains === 0) {
        setRows([]);
        setIsPortfolioLoading(false);
        return;
      }

      let finishedChains = 0;
      const updatedChainIds = new Set<string>();

      const updatePortfolioChainRows = (
        chain: EvmChain,
        tokens: NativeAndErc20Token[],
      ) => {
        if (selectedAccountKeyRef.current !== accountKey) return;
        updatedChainIds.add(chain.chainId.toLowerCase());
        setRows((previousRows) =>
          mergeEvmPortfolioRowsForChain(
            previousRows,
            chain,
            tokens,
            chainById,
          ),
        );
      };

      const markPortfolioChainLoadFinished = () => {
        finishedChains++;
        if (selectedAccountKeyRef.current !== accountKey) return;
        if (finishedChains !== totalChains) return;

        setIsPortfolioLoading(false);
        if (failedChainNames.length === 0) {
          return;
        }

        if (failedChainNames.length === totalChains) {
          setStatusMessage('portfolio_load_error');
          setStatusMessageParams(undefined);
          return;
        }

        setStatusMessage('portfolio_partial_load_error');
        setStatusMessageParams([failedChainNames.join(', ')]);
      };

      void EvmAccountTokensLoadUtils.loadVisibleNativeAndErc20TokensForSetupChains(
        chains,
        walletAddress,
        {
          maxRetries: EvmAccountTokensLoadUtils.DEFAULT_MAX_LOAD_MORE_RETRIES,
          onChainUpdate: updatePortfolioChainRows,
          onChainReady: (chain, tokens) => {
            if (!updatedChainIds.has(chain.chainId.toLowerCase())) {
              updatePortfolioChainRows(chain, tokens);
            }
          },
          shouldContinue: () =>
            selectedAccountKeyRef.current === accountKey,
          onChainError: (chain, error) => {
            if (selectedAccountKeyRef.current !== accountKey) return;
            Logger.error(
              `Unable to load portfolio balances for ${chain.name}`,
              error,
            );
            if (!failedChainNames.includes(chain.name)) {
              failedChainNames.push(chain.name);
            }
          },
          onChainFinished: () => {
            markPortfolioChainLoadFinished();
          },
        },
      );
    } catch (error) {
      if (selectedAccountKeyRef.current !== accountKey) return;
      Logger.error('Unable to load portfolio balances', error);
      setStatusMessage('portfolio_load_error');
      setStatusMessageParams(undefined);
      setRows([]);
      setIsPortfolioLoading(false);
    }
  };

  const loadHistory = async () => {
    if (hasLoadedHistoryRef.current || isHistoryLoadInFlightRef.current) {
      return;
    }

    isHistoryLoadInFlightRef.current = true;
    setIsHistoryLoading(true);
    setStatusMessage('');
    try {
      setHistory(await PortfolioApiUtils.listHistory(1, historyAddressFilters));
      hasLoadedHistoryRef.current = true;
    } catch (error) {
      Logger.error('Unable to load portfolio history', error);
      setStatusMessage('portfolio_load_error');
      setHistory([]);
    } finally {
      isHistoryLoadInFlightRef.current = false;
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (section === 'swap') {
      return;
    }

    void loadAssets();
  }, [section]);

  useEffect(() => {
    if (
      section !== 'history' ||
      !hasResolvedInitialAccountSelection ||
      !selectedAccountKey
    ) {
      return;
    }

    void loadHistory();
  }, [hasResolvedInitialAccountSelection, section, selectedAccountKey]);

  const handleRefreshPortfolioData = async () => {
    if (!selectedAccountKey || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await Promise.all([
        loadPortfolio({ clearRows: true }),
        loadAssets(true),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const swapQuoteAbortControllerRef = useRef<AbortController | null>(null);

  const getQuotes = async (options?: {
    preserveExpandedQuotesPanel?: boolean;
  }): Promise<PortfolioSwapQuoteFetchResult> => {
    if (!selectedAccount || !isPositivePortfolioAmount(amount)) {
      return { status: 'skipped' };
    }
    const mode = section as PortfolioMode;
    const resolvedFromAssetId =
      mode === 'buy'
        ? undefined
        : PortfolioFlowUtils.resolveFromRowKeyToCanonicalAssetId(
            fromAssetId,
            rows,
            canonicalAssetsForRowResolution,
            toAssetEvmChains,
            portfolioChains,
          );
    const resolvedToAssetId =
      mode === 'sell' ? undefined : toAssetId || undefined;
    if (
      !hasRequiredQuoteAssets({
        mode,
        fromAssetId: resolvedFromAssetId,
        toAssetId: resolvedToAssetId,
      })
    ) {
      return { status: 'skipped' };
    }

    swapQuoteAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    swapQuoteAbortControllerRef.current = abortController;

    setIsFlowLoading(true);
    setStatusMessage('');
    setAmountQuoteError(null);
    try {
      const address = selectedAccountFromAddress;
      if (!address) {
        return { status: 'skipped' };
      }
      const toAddress = quoteToAddress;
      if (!toAddress) {
        setStatusMessage('portfolio_recipient_address_invalid');
        return { status: 'invalid_recipient' };
      }
      const formattedFromAmount =
        PortfolioFlowUtils.formatPortfolioQuoteFromAmount(
          amount,
          PortfolioFlowUtils.resolvePortfolioQuoteFromAmountDecimals({
            mode,
            fromAssetId,
            rows,
            assets,
            chains: toAssetEvmChains,
          }),
        );

      const response = await PortfolioApiUtils.getQuotes(
        {
          mode,
          fromAssetId: resolvedFromAssetId,
          toAssetId: resolvedToAssetId,
          fromAmount: formattedFromAmount,
          fromAddress: address,
          toAddress,
          countryCode:
            mode === 'buy' || mode === 'sell'
              ? (geoCountryCode ??
                PortfolioFiatLocaleUtils.getPreferredRegionCode())
              : undefined,
          fiatCurrency:
            mode === 'buy' || mode === 'sell' ? fiatCurrency : undefined,
          paymentMethod:
            mode === 'buy' || mode === 'sell'
              ? paymentMethod || undefined
              : undefined,
        },
        abortController.signal,
      );
      if (abortController.signal.aborted) {
        return { status: 'aborted' };
      }
      const quoteId = PortfolioApiUtils.resolveExecutablePortfolioQuoteId(
        response.quotes,
      );
      setQuoteResponse(response);
      setSelectedQuoteId(quoteId);
      if (!options?.preserveExpandedQuotesPanel) {
        setIsQuotesPanelExpanded(false);
      }
      return quoteId ? { status: 'quoted' } : { status: 'no_quote' };
    } catch (error) {
      if (
        PortfolioApiUtils.isPortfolioQuoteRequestAborted(error) ||
        abortController.signal.aborted
      ) {
        return { status: 'aborted' };
      }
      Logger.error('Unable to load portfolio quotes', error);
      setQuoteResponse(undefined);
      setSelectedQuoteId('');
      const amountError =
        PortfolioApiUtils.resolvePortfolioAmountQuoteError(error);
      if (amountError) {
        setAmountQuoteError(amountError);
        setStatusMessage('');
        setStatusMessageParams(undefined);
      } else {
        setAmountQuoteError(null);
        setStatusMessage(
          PortfolioApiUtils.resolvePortfolioQuoteStatusMessage(
            error,
            'portfolio_load_error',
          ),
        );
        setStatusMessageParams(undefined);
      }
      return PortfolioApiUtils.resolvePortfolioSwapQuoteFetchErrorResult(error);
    } finally {
      if (swapQuoteAbortControllerRef.current === abortController) {
        swapQuoteAbortControllerRef.current = null;
        setIsFlowLoading(false);
      }
    }
  };

  const getSwapQuotesRef = useRef(getQuotes);
  getSwapQuotesRef.current = getQuotes;
  const swapQuoteRefreshDeadlineRef = useRef(0);

  useEffect(() => {
    swapQuoteAbortControllerRef.current?.abort();
    swapQuoteAbortControllerRef.current = null;
    setIsFlowLoading(false);

    if (!isQuoteAutoFetchSection(section)) {
      return;
    }

    swapQuoteRefreshDeadlineRef.current = 0;
    setQuoteRefreshCountdown(null);
    setQuoteResponse(undefined);
    setSelectedQuoteId('');
    setIsQuotesPanelExpanded(false);
    setAmountQuoteError(null);
    setIsSwapQuoteRequestPending(false);
  }, [
    section,
    amount,
    fromAssetId,
    toAssetId,
    selectedAccountKey,
    fiatCurrency,
    paymentMethod,
  ]);

  const scheduleSwapQuoteAutoRefresh = useCallback(() => {
    swapQuoteRefreshDeadlineRef.current =
      Date.now() + PORTFOLIO_SWAP_QUOTE_REFRESH_INTERVAL_MS;
    setQuoteRefreshCountdown(PORTFOLIO_SWAP_QUOTE_REFRESH_INTERVAL_SECONDS);
  }, []);

  const triggerFlowQuoteRefresh = useCallback(() => {
    const preserveExpandedQuotesPanel = isQuotesPanelExpandedRef.current;
    swapQuoteRefreshDeadlineRef.current = 0;
    setQuoteRefreshCountdown(null);
    void getSwapQuotesRef
      .current({ preserveExpandedQuotesPanel })
      .then((result) => {
        if (result.status === 'aborted') {
          return;
        }
        setIsSwapQuoteRequestPending(false);
        if (
          isQuoteAutoFetchSection(section) &&
          PortfolioApiUtils.shouldSchedulePortfolioSwapQuoteAutoRefresh(result)
        ) {
          scheduleSwapQuoteAutoRefresh();
        }
      });
  }, [scheduleSwapQuoteAutoRefresh, section]);

  useEffect(() => {
    if (
      !isQuoteAutoFetchSection(section) ||
      !canRequestQuotes ||
      pendingInAppConfirmation
    ) {
      swapQuoteAbortControllerRef.current?.abort();
      swapQuoteAbortControllerRef.current = null;
      swapQuoteRefreshDeadlineRef.current = 0;
      setQuoteRefreshCountdown(null);
      setIsSwapQuoteRequestPending(false);
      setIsFlowLoading(false);
      return;
    }

    setIsSwapQuoteRequestPending(true);
    const initialQuoteTimeoutId = setTimeout(() => {
      triggerFlowQuoteRefresh();
    }, PORTFOLIO_SWAP_QUOTE_DEBOUNCE_MS);

    const countdownIntervalId = isQuoteAutoFetchSection(section)
      ? setInterval(() => {
          if (!swapQuoteRefreshDeadlineRef.current) {
            return;
          }

          const remainingMs = swapQuoteRefreshDeadlineRef.current - Date.now();
          if (remainingMs <= 0) {
            triggerFlowQuoteRefresh();
            return;
          }

          setQuoteRefreshCountdown(Math.ceil(remainingMs / 1000));
        }, 1000)
      : undefined;

    return () => {
      clearTimeout(initialQuoteTimeoutId);
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
    };
  }, [
    section,
    canRequestQuotes,
    pendingInAppConfirmation,
    amount,
    fromAssetId,
    toAssetId,
    selectedAccountKey,
    fiatCurrency,
    paymentMethod,
    triggerFlowQuoteRefresh,
  ]);

  useEffect(() => {
    setPendingInAppConfirmation(null);
  }, [section]);

  const buildEvmInAppConfirmationContext = async (
    account: EvmAccount,
    executionId: string,
    quote: PortfolioQuote,
    transaction: PortfolioEvmTransaction,
    fromAddress: string,
    toAddress: string,
  ): Promise<PortfolioInAppConfirmationContext> => {
    const chainId = `0x${transaction.chainId.toString(16)}`;
    const chain = await ChainUtils.getChain<EvmChain>(chainId);
    if (!chain) {
      throw new Error('portfolio_chain_not_setup');
    }

    const transactionData = {
      from: account.wallet.address,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value,
      type: chain.defaultTransactionType ?? EvmTransactionType.EIP_1559,
      chain,
      gasLimit: transaction.gasLimit ? Number(transaction.gasLimit) : undefined,
      maxFeePerGas: transaction.maxFeePerGas ?? undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ?? undefined,
      gasPrice: transaction.gasPrice ?? undefined,
    };
    const activeAccountOverride: EvmActiveAccount = {
      address: account.wallet.address,
      wallet: account.wallet,
      nativeAndErc20Tokens: { value: [], loading: false },
      nfts: { value: [], loading: false, initialized: false },
      history: {
        value: { events: [], nextCursor: null, fullyFetch: false },
        loading: false,
        initialized: false,
      },
      isReady: true,
    };

    const requiredApproval =
      await PortfolioEvmApprovalUtils.getRequiredApproval(
        chain,
        account.wallet.address,
        quote,
      );
    const approveTransactionData = requiredApproval
      ? PortfolioEvmApprovalUtils.buildApproveTransactionData(
          chain,
          account.wallet.address,
          requiredApproval,
        )
      : undefined;
    const approveFields = requiredApproval
      ? (PortfolioEvmApprovalUtils.buildApproveConfirmationFields(
          requiredApproval,
          quote.fromAsset ?? fromCanonicalAsset,
          toAssetEvmChains,
          portfolioChains,
        ).map((field, index) => ({
          ...field,
          name: field.label ?? `portfolio-approval-${index}`,
        })) as ConfirmationPageEvmFields[])
      : undefined;

    return {
      kind: 'evm',
      executionId,
      quote,
      message: I18nUtils.getMessage('portfolio_native_confirmation_message'),
      transaction,
      account,
      chain,
      activeAccountOverride,
      transactionData,
      approveTransactionData,
      approveFields,
      fields: [
        ...PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields({
          quote,
          fromAsset: fromCanonicalAsset,
          toAsset: toCanonicalAsset,
          fromAddress,
          toAddress,
          chains: toAssetEvmChains,
          portfolioChains,
        }),
        {
          label: 'portfolio_confirmation_evm_destination',
          value: EvmFormatUtils.formatAddress(transaction.to),
        },
      ].map((field, index) => ({
        ...field,
        name: field.label ?? `portfolio-confirmation-${index}`,
      })) as ConfirmationPageEvmFields[],
      onConfirm: async (
        gasFee?: GasFeeEstimationBase,
        approveGasFee?: GasFeeEstimationBase,
      ) => {
        const shouldApprove = Boolean(approveTransactionData && approveGasFee);
        if (shouldApprove) {
          addToLoadingList('portfolio_approving_smart_contract');
        }
        addToLoadingList('portfolio_sending_transaction');
        try {
          let approveNonce: number | undefined;
          if (shouldApprove) {
            const approveResponse = await EvmTransactionsUtils.send(
              account.wallet,
              {
                ...approveTransactionData!,
                type: Number(approveTransactionData!.type),
              },
              approveGasFee!,
              chain.chainId,
            );
            await approveResponse.wait();
            approveNonce = approveResponse.nonce;
            removeFromLoadingList('portfolio_approving_smart_contract');
          }

          const transactionResponse = await EvmTransactionsUtils.send(
            account.wallet,
            { ...transactionData, type: Number(transactionData.type) },
            gasFee!,
            chain.chainId,
            approveNonce !== undefined ? approveNonce + 1 : undefined,
          );
          removeFromLoadingList('portfolio_sending_transaction');
          await PortfolioApiUtils.markSubmitted(
            executionId,
            transactionResponse.hash,
          );
          persistLastUsedSwapAssets(
            quote.fromAsset?.assetId,
            quote.toAsset?.assetId,
          );
          setPendingInAppConfirmation(null);
          setHistory(
            await PortfolioApiUtils.listHistory(1, historyAddressFilters),
          );
          setSection('history');
        } catch (error) {
          resetLoading();
          Logger.error('Portfolio transaction failed', error);
          setErrorMessage('portfolio_execution_error');
          throw error;
        }
      },
    };
  };

  const buildHiveInAppConfirmationContext = async (
    account: LocalAccount,
    executionId: string,
    quote: PortfolioQuote,
    transaction: PortfolioHiveTransaction,
    fromAddress: string,
    toAddress: string,
  ): Promise<PortfolioInAppConfirmationContext> => {
    const activeKey = account.keys.active;
    if (!activeKey) {
      throw new Error('portfolio_hive_active_key_missing');
    }

    const extendedAccount = await AccountUtils.getExtendedAccount(account.name);
    if (!extendedAccount) {
      throw new Error('portfolio_hive_active_key_missing');
    }

    return {
      kind: 'hive',
      executionId,
      quote,
      message: I18nUtils.getMessage('portfolio_native_confirmation_message'),
      transaction,
      account,
      activeAccount: {
        account: extendedAccount,
        keys: account.keys,
        rc: {} as ActiveAccount['rc'],
        name: account.name,
      },
      fields: PortfolioQuoteDisplayUtils.buildPortfolioInAppConfirmationFields({
        quote,
        fromAsset: fromCanonicalAsset,
        toAsset: toCanonicalAsset,
        fromAddress,
        toAddress,
        chains: toAssetEvmChains,
        portfolioChains,
      }),
      onConfirm: async (options?: TransactionOptions) => {
        try {
          const result = await HiveTxUtils.sendOperation(
            getPortfolioHiveOperations(transaction),
            activeKey,
            false,
            options,
          );
          if (!result?.tx_id) {
            throw new Error('portfolio_execution_error');
          }
          try {
            await PortfolioApiUtils.markSubmitted(executionId, result.tx_id);
          } catch (submitError) {
            Logger.error(
              'Portfolio execution submitted on-chain but history sync failed',
              submitError,
            );
          }
          persistLastUsedSwapAssets(
            quote.fromAsset?.assetId,
            quote.toAsset?.assetId,
          );
          setPendingInAppConfirmation(null);
          setHistory(
            await PortfolioApiUtils.listHistory(1, historyAddressFilters),
          );
          setSection('history');
        } catch (error) {
          Logger.error('Portfolio transaction failed', error);
          setErrorMessage('portfolio_execution_error');
          throw error;
        }
      },
    };
  };

  const executeQuote = async (quote: PortfolioQuote) => {
    if (!flowSelectedAccount || !quoteResponse) return;
    const address = selectedAccountFromAddress;
    if (!address) {
      return;
    }
    const toAddress = resolvedToAddress;
    if (!toAddress) {
      setRecipientFieldError({
        type: PortfolioFlowUtils.normalizePortfolioRecipientAddress(
          recipientAddress,
        )
          ? 'portfolio.recipient.invalid'
          : 'string.empty',
      });
      return;
    }

    swapQuoteRefreshDeadlineRef.current = 0;
    setQuoteRefreshCountdown(null);
    setIsFlowLoading(true);
    setStatusMessage('');
    setRecipientFieldError(undefined);
    try {
      const execution = await PortfolioApiUtils.createExecution(
        quote,
        quoteResponse.request,
        address,
        toAddress,
      );

      if (quote.executionType === 'in_app') {
        const transaction = resolvePortfolioSignableTransaction(
          quote,
          execution,
        );
        if (!transaction) {
          throw new Error('portfolio_execution_prepare_failed');
        }

        if (isPortfolioHiveTransaction(transaction)) {
          if (flowSelectedAccount.type !== ChainType.HIVE) {
            throw new Error('portfolio_native_execution_requires_hive');
          }
          setPendingInAppConfirmation(
            await buildHiveInAppConfirmationContext(
              flowSelectedAccount.account,
              execution.id,
              quote,
              transaction,
              address,
              toAddress,
            ),
          );
          return;
        }

        if (isPortfolioEvmTransaction(transaction)) {
          if (flowSelectedAccount.type !== ChainType.EVM) {
            throw new Error('portfolio_native_execution_requires_evm');
          }
          setPendingInAppConfirmation(
            await buildEvmInAppConfirmationContext(
              flowSelectedAccount.account,
              execution.id,
              quote,
              transaction,
              address,
              toAddress,
            ),
          );
          return;
        }

        throw new Error('portfolio_execution_prepare_failed');
      }

      const redirectUrl =
        PortfolioApiUtils.resolvePortfolioExecutionRedirectUrl(
          execution,
          quote,
        );
      if (redirectUrl) {
        chrome.tabs.create({ url: redirectUrl });
        if (flowMode === 'swap') {
          persistLastUsedSwapAssets(
            quote.fromAsset?.assetId,
            quote.toAsset?.assetId,
          );
          setStatusMessage('portfolio_provider_opened');
        }
        setHistory(
          await PortfolioApiUtils.listHistory(1, historyAddressFilters),
        );
        setSection('history');
        return;
      }

      setStatusMessage('portfolio_provider_execution_unavailable');
    } catch (error) {
      Logger.error('Unable to execute portfolio quote', error);
      setStatusMessage(getStatusMessageKey(error, 'portfolio_execution_error'));
    } finally {
      setIsFlowLoading(false);
    }
  };

  const openFlowForRow = useCallback(
    (row: PortfolioRow, mode: PortfolioMode) => {
      const canUseAsFrom =
        PortfolioFlowUtils.hasPositivePortfolioBalance(row.balance) &&
        !row.isTestnet;
      resetFlowFormFields();
      setFromAssetId(mode === 'buy' || !canUseAsFrom ? '' : row.key);
      setToAssetId(
        mode === 'sell'
          ? ''
          : (PortfolioFlowUtils.resolvePortfolioRowToCanonicalAssetId(
              row,
              canonicalAssetsForRowResolution,
              toAssetEvmChains,
              portfolioChains,
            ) ?? ''),
      );
      setSection(mode);
    },
    [
      canonicalAssetsForRowResolution,
      portfolioChains,
      toAssetEvmChains,
    ],
  );

  const portfolioRowActions = useMemo(
    (): PortfolioMode[] =>
      selectedAccount?.type === ChainType.HIVE
        ? ['swap']
        : ['buy', 'sell', 'swap'],
    [selectedAccount?.type],
  );

  const renderAccountRow = useCallback(
    (accountKey: string) => {
      const account = accountOptions.find((item) => item.key === accountKey);
      if (!account) {
        return '—';
      }
      if (account.type === ChainType.EVM) {
        return (
          <div className="portfolio-account-row">
            <PortfolioAccountAvatar
              kind="evm"
              address={account.value}
              className="portfolio-account-row__avatar"
            />
            <div className="portfolio-account-row__text">
              {account.accountName ? (
                <span className="portfolio-account-row__ens">
                  {account.accountName}
                </span>
              ) : null}
              <span className="portfolio-account-row__address">
                {account.value}
              </span>
            </div>
          </div>
        );
      }
      return (
        <div className="portfolio-account-row">
          <PortfolioAccountAvatar
            kind="hive"
            username={account.value}
            className="portfolio-account-row__avatar"
          />
          <div className="portfolio-account-row__text">
            <span className="portfolio-account-row__address">
              @{account.value}
            </span>
          </div>
        </div>
      );
    },
    [accountOptions],
  );

  const renderRecipientOption = useCallback(
    (value: string) => {
      if (value === PORTFOLIO_RECIPIENT_OTHER_VALUE) {
        return I18nUtils.getMessage('global_other');
      }

      return renderAccountRow(value);
    },
    [renderAccountRow],
  );

  const renderNetworkOption = useCallback(
    (networkValue: string) => {
      const option = networkSelectOptions.find(
        (item) => item.value === networkValue,
      );
      if (!option) {
        return '—';
      }

      return (
        <div className="portfolio-network-row">
          {option.img ? (
            <PortfolioLogoImage
              className="portfolio-network-row__logo"
              src={option.img}
              fallbackClassName="portfolio-network-row__logo-fallback"
              fallbackLetter={option.label}
              colorKey={option.label}
            />
          ) : null}
          <span className="portfolio-network-row__label">{option.label}</span>
        </div>
      );
    },
    [networkSelectOptions],
  );

  const renderFiatCurrencyOption = (currencyValue: string) => {
    const option =
      fiatCurrencySelectOptions.find((item) => item.value === currencyValue) ??
      (currencyValue === selectedFiatCurrencyOption.value
        ? selectedFiatCurrencyOption
        : undefined);
    if (!option) {
      return currencyValue || '—';
    }

    return (
      <div className="portfolio-fiat-option">
        <span className="portfolio-fiat-option__label">{option.label}</span>
        {option.subLabel ? (
          <span className="portfolio-fiat-option__code">{option.subLabel}</span>
        ) : null}
      </div>
    );
  };

  const renderFiatCurrencyDisplay = (currencyValue: string) => {
    const option =
      fiatCurrencySelectOptions.find((item) => item.value === currencyValue) ??
      (currencyValue === selectedFiatCurrencyOption.value
        ? selectedFiatCurrencyOption
        : undefined);
    const label = option?.label ?? currencyValue ?? '—';

    return <span className="portfolio-fiat-option__label">{label}</span>;
  };

  const renderPaymentMethodOption = (methodValue: string) => {
    const option =
      paymentMethodSelectOptions.find((item) => item.value === methodValue) ??
      (methodValue === selectedPaymentMethodOption.value
        ? selectedPaymentMethodOption
        : undefined);
    if (!option) {
      return methodValue || '—';
    }

    return (
      <div className="portfolio-payment-method-option">
        {option.img ? (
          <PortfolioLogoImage
            className="portfolio-payment-method-option__logo"
            src={option.img}
            fallbackLetter={option.label}
            colorKey={option.label}
          />
        ) : null}
        <span className="portfolio-payment-method-option__label">
          {option.label}
        </span>
      </div>
    );
  };

  const renderPortfolio = (isLoadingMoreChains = false) => (
    <PortfolioBalancesSection
      hasAccounts={accountOptions.length > 0 && Boolean(selectedAccount)}
      selectedAccountKey={selectedAccountKey}
      isHiveAccount={selectedAccount?.type === ChainType.HIVE}
      showNetworkFilter={
        selectedAccount?.type === ChainType.EVM && setupEvmChains.length > 0
      }
      accountOptions={overlayAccountOptions}
      networkOptions={overlayNetworkOptions}
      selectedNetwork={selectedNetwork}
      tokenFilter={tokenFilter}
      rows={rows}
      expandedRowKeys={expandedPortfolioRowKeys}
      rowActions={portfolioRowActions}
      isLoadingMoreChains={isLoadingMoreChains}
      onSelectedAccountChange={handleSelectedAccountChange}
      onSelectedNetworkChange={setSelectedNetwork}
      onTokenFilterChange={handleTokenFilterChange}
      onToggleRowExpanded={togglePortfolioRowExpanded}
      onOpenFlowForRow={openFlowForRow}
      renderAccountOption={renderAccountRow}
      renderNetworkOption={renderNetworkOption}
    />
  );

  const renderHistoryRefreshControl = () => {
    if (section !== 'history' || !selectedAccountKey) {
      return null;
    }

    const isHistoryRefreshing = historyRefreshCountdown === null;
    const historyRefreshLabel = isHistoryRefreshing
      ? I18nUtils.getMessage('portfolio_history_refreshing')
      : I18nUtils.getMessage('portfolio_history_auto_refresh_countdown', [
          String(historyRefreshCountdown),
        ]);

    return (
      <button
        type="button"
        className="portfolio-quote-autorefresh"
        disabled={isHistoryRefreshing}
        onClick={refreshHistorySilently}
        title={I18nUtils.getMessage('portfolio_history_refresh_now')}>
        <SVGIcon
          className={`portfolio-quote-autorefresh__icon ${
            isHistoryRefreshing ? 'rotate' : ''
          }`}
          icon={SVGIcons.SWAPS_HISTORY_REFRESH}
        />
        <span>{historyRefreshLabel}</span>
      </button>
    );
  };

  const renderFlow = () => {
    const mode = flowMode;
    const selectedQuote = quoteResponse?.quotes.find(
      (quote) => quote.quoteId === selectedQuoteId,
    );
    const canExecuteSelectedQuote = selectedQuote
      ? PortfolioApiUtils.canExecutePortfolioQuote(selectedQuote)
      : false;
    const hasAvailableQuotes = (quoteResponse?.quotes.length ?? 0) > 0;
    const isAwaitingFirstSwapQuote =
      isQuoteAutoFetchSection(mode) &&
      canRequestQuotes &&
      !selectedQuoteId &&
      !amountQuoteError &&
      (isFlowLoading || isSwapQuoteRequestPending);
    const showSwapQuoteRefresh =
      isQuoteAutoFetchSection(mode) &&
      Boolean(selectedQuoteId) &&
      canRequestQuotes;
    const hasStoppedSwapQuoteFetch =
      Boolean(amountQuoteError) ||
      statusMessage === 'portfolio_no_quote_available' ||
      statusMessage === 'portfolio_recipient_address_invalid' ||
      (quoteResponse !== undefined &&
        quoteResponse.quotes.length === 0 &&
        !selectedQuoteId);
    const showSwapQuoteRetry =
      isQuoteAutoFetchSection(mode) &&
      canRequestQuotes &&
      !selectedQuoteId &&
      !isAwaitingFirstSwapQuote &&
      quoteRefreshCountdown === null &&
      hasStoppedSwapQuoteFetch;
    const showSwapQuoteActionButton =
      showSwapQuoteRefresh || showSwapQuoteRetry;
    const swapQuoteRefreshLabel = isFlowLoading
      ? I18nUtils.getMessage('portfolio_quote_refreshing')
      : quoteRefreshCountdown !== null
        ? I18nUtils.getMessage('portfolio_quote_auto_refresh_countdown', [
            String(quoteRefreshCountdown),
          ])
        : I18nUtils.getMessage('portfolio_quote_refresh_now');
    const swapQuoteActionLabel = isFlowLoading
      ? I18nUtils.getMessage('portfolio_quote_refreshing')
      : showSwapQuoteRetry
        ? I18nUtils.getMessage('portfolio_quote_retry')
        : swapQuoteRefreshLabel;
    const estimatedAmountErrorMessage =
      !selectedQuote &&
      (statusMessage === 'portfolio_no_quote_available' ||
        quoteResponse?.quotes.length === 0)
        ? I18nUtils.getMessage('portfolio_no_quote_available_short')
        : null;

    const handleSwapQuoteInputClick = () => {
      if (!hasAvailableQuotes) {
        return;
      }
      setIsQuotesPanelExpanded(true);
    };

    const handleSwapQuoteRefreshClick = (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation();
      triggerFlowQuoteRefresh();
    };

    const estimatedAmountInput = isQuoteAutoFetchSection(mode) ? (
      <div className="custom-input portfolio-swap-quote-field">
        <div className="label">
          {I18nUtils.getMessage('portfolio_estimated_amount')}
        </div>
        <div
          className={`custom-input-content ${
            hasAvailableQuotes ? 'portfolio-swap-quote-input--clickable' : ''
          }`}
          data-testid="portfolio-swap-quote-input"
          onClick={handleSwapQuoteInputClick}
          onKeyDown={(event) => {
            if (
              hasAvailableQuotes &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              setIsQuotesPanelExpanded(true);
            }
          }}
          role={hasAvailableQuotes ? 'button' : undefined}
          tabIndex={hasAvailableQuotes ? 0 : undefined}>
          <div className="portfolio-swap-quote-input__container input-container no-logo">
            <div
              className={`portfolio-swap-quote-input__value${
                estimatedAmountErrorMessage
                  ? ' portfolio-swap-quote-input__value--error-text'
                  : ''
              }`}
              data-testid="portfolio-swap-quote-value"
              role={estimatedAmountErrorMessage ? 'alert' : undefined}>
              {selectedQuote?.estimatedToAmount ??
                estimatedAmountErrorMessage ??
                ''}
            </div>
            <div className="portfolio-swap-quote-input__adornments">
              {showSwapQuoteActionButton ? (
                <button
                  type="button"
                  className="portfolio-swap-quote-input__refresh"
                  disabled={isFlowLoading}
                  onClick={handleSwapQuoteRefreshClick}
                  title={swapQuoteActionLabel}
                  aria-label={swapQuoteActionLabel}>
                  <SVGIcon
                    className={`portfolio-swap-quote-input__refresh-icon ${
                      isFlowLoading ? 'rotate' : ''
                    }`}
                    icon={SVGIcons.SWAPS_HISTORY_REFRESH}
                  />
                  <span
                    className="portfolio-swap-quote-input__refresh-label"
                    data-testid={
                      showSwapQuoteRetry
                        ? 'portfolio-swap-quote-retry-label'
                        : 'portfolio-swap-quote-refresh-label'
                    }>
                    {swapQuoteActionLabel}
                  </span>
                </button>
              ) : null}
              {isAwaitingFirstSwapQuote ? (
                <div
                  className="portfolio-swap-quote-input__spinner"
                  data-testid="portfolio-swap-quote-loading">
                  <RotatingLogoComponent />
                </div>
              ) : null}
              {selectedQuote ? (
                <PortfolioLogoImage
                  className="portfolio-swap-quote-input__logo"
                  src={selectedQuote.providerLogoUrl}
                  fallbackClassName="portfolio-swap-quote-input__logo"
                  fallbackLetter={
                    selectedQuote.providerName || selectedQuote.provider
                  }
                  colorKey={
                    selectedQuote.providerName || selectedQuote.provider
                  }
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="portfolio-amount-field">
        <InputComponent
          label="portfolio_estimated_amount"
          type={InputType.NUMBER}
          value={selectedQuote?.estimatedToAmount ?? ''}
          onChange={() => {}}
          disabled
          imageLogoUrl={selectedQuote?.providerLogoUrl ?? undefined}
          imageLogoAlt={selectedQuote?.providerName || selectedQuote?.provider}
          logoPosition={selectedQuote?.providerLogoUrl ? 'right' : undefined}
        />
        {estimatedAmountErrorMessage ? (
          <p
            className="portfolio-field-error"
            role="alert"
            data-testid="portfolio-estimated-amount-error">
            {estimatedAmountErrorMessage}
          </p>
        ) : null}
        {isSwapQuoteRequestPending && !selectedQuote ? (
          <div
            className="portfolio-swap-quote-input__spinner"
            data-testid="portfolio-flow-quote-loading">
            <RotatingLogoComponent />
          </div>
        ) : null}
      </div>
    );

    const renderQuoteCard = (quote: PortfolioQuote) => (
      <PortfolioQuoteCard
        key={quote.quoteId}
        quote={quote}
        isSelected={selectedQuoteId === quote.quoteId}
        isExecutable={PortfolioApiUtils.canExecutePortfolioQuote(quote)}
        onSelect={() => setSelectedQuoteId(quote.quoteId)}
      />
    );

    const renderQuotesSection = () => {
      if (!hasAvailableQuotes || !quoteResponse) {
        return null;
      }

      const amountHintControl = quoteAmountHint ? (
        canFillAmountHint ? (
          <button
            type="button"
            className="portfolio-amount-hint portfolio-amount-hint--action"
            onClick={handleFillAmountHint}
            data-testid="portfolio-fill-amount-hint">
            {I18nUtils.getMessage(
              quoteAmountHint.key,
              quoteAmountHint.params,
            )}
          </button>
        ) : (
          <p className="portfolio-amount-hint" role="status">
            {I18nUtils.getMessage(
              quoteAmountHint.key,
              quoteAmountHint.params,
            )}
          </p>
        )
      ) : null;

      return (
        <div className="portfolio-quotes-section">
          {amountHintControl}
          <button
            className="portfolio-quotes-toggle"
            onClick={() => setIsQuotesPanelExpanded((expanded) => !expanded)}
            type="button">
            {I18nUtils.getMessage(
              isQuotesPanelExpanded
                ? 'portfolio_hide_quotes'
                : 'portfolio_view_all_quotes',
              [String(quoteResponse.quotes.length)],
            )}
          </button>
          {isQuotesPanelExpanded && (
            <div className="portfolio-quotes-panel">
              {quoteResponse.quotes.map((quote) => renderQuoteCard(quote))}
            </div>
          )}
        </div>
      );
    };

    const fiatCurrencyField =
      mode === 'buy' || mode === 'sell' ? (
        overlayFiatCurrencyOptions.length > 0 ? (
          <PortfolioOverlayListSelect
            id="portfolio-fiat-currency"
            label={I18nUtils.getMessage('portfolio_fiat_currency')}
            options={overlayFiatCurrencyOptions}
            value={selectedFiatCurrencyOption.value}
            onChange={(next) => {
              hasUserSelectedFiatRef.current = true;
              setFiatCurrency(next);
            }}
            renderDisplay={renderFiatCurrencyDisplay}
            renderOption={renderFiatCurrencyOption}
            filterable
            disabled={isFiatRampOptionsLoading}
          />
        ) : (
          <InputComponent
            label="portfolio_fiat_currency"
            type={InputType.TEXT}
            value={fiatCurrency}
            onChange={(value: string) => {
              hasUserSelectedFiatRef.current = true;
              setFiatCurrency(value.toUpperCase().slice(0, 10));
            }}
          />
        )
      ) : null;

    const paymentMethodField =
      mode === 'buy' || mode === 'sell' ? (
        overlayPaymentMethodOptions.length > 1 ? (
          <PortfolioOverlayListSelect
            id="portfolio-payment-method"
            className="portfolio-payment-method-select"
            label={I18nUtils.getMessage('portfolio_payment_method')}
            options={overlayPaymentMethodOptions}
            value={selectedPaymentMethodOption.value}
            onChange={setPaymentMethod}
            renderDisplay={renderPaymentMethodOption}
            renderOption={renderPaymentMethodOption}
            disabled={isFiatRampOptionsLoading}
          />
        ) : (
          <InputComponent
            label="portfolio_payment_method"
            type={InputType.TEXT}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        )
      ) : null;

    const isFromAssetCatalogReady =
      mode === 'swap'
        ? hasLoadedSwapAvailableAssets && !isSwapAvailableAssetsLoading
        : mode === 'sell'
          ? !isRampAvailableAssetsLoading
          : true;
    const shouldShowEmptyFromAssetError =
      fromAssetOptions.length === 0 &&
      !isPortfolioLoading &&
      isFromAssetCatalogReady;

    const fromAssetSelect =
      mode !== 'buy' && (mode === 'swap' || fromAssetOptions.length > 0) ? (
        <PortfolioOverlayListSelect
          id="portfolio-from-asset"
          label={I18nUtils.getMessage('portfolio_from_asset')}
          options={fromAssetOptions}
          value={fromAssetId}
          onChange={setFromAssetId}
          renderOption={renderFromAssetIdentity}
          renderDisplay={renderFromAssetIdentity}
          disabled={fromAssetOptions.length === 0}
          error={
            shouldShowEmptyFromAssetError
              ? I18nUtils.getMessage(
                  mode === 'swap'
                    ? 'portfolio_swap_no_wallet_tokens'
                    : 'portfolio_no_matching_assets',
                )
              : undefined
          }
          listFooter={
            shouldShowEmptyFromAssetError && mode !== 'swap'
              ? I18nUtils.getMessage('portfolio_no_matching_assets')
              : undefined
          }
        />
      ) : null;

    const toAssetSelect =
      mode !== 'sell' && toAssetOptions.length > 0 ? (
        <PortfolioOverlayListSelect
          id="portfolio-to-asset"
          label={I18nUtils.getMessage('portfolio_to_asset')}
          options={filteredToAssetOptions}
          value={toAssetId}
          onChange={setToAssetId}
          renderOption={renderToAssetIdentity}
          renderDisplay={renderToAssetIdentity}
          listHeader={
            <PortfolioToAssetFilter
              textFilter={toAssetFilter}
              onTextFilterChange={setToAssetFilter}
              chainFilter={toAssetChainFilter}
              onChainFilterChange={setToAssetChainFilter}
              chainOptions={toAssetChainFilterOptions}
              networkSelectOptions={toAssetChainSelectOptions}
              selectedNetworkOption={selectedToAssetChainOption}
            />
          }
          listFooter={
            filteredToAssetOptions.length === 0
              ? I18nUtils.getMessage('portfolio_no_matching_assets')
              : hasToAssetFilters && toAssetTruncatedCount > 0
                ? I18nUtils.getMessage('portfolio_to_asset_results_truncated', [
                    String(toAssetTruncatedCount),
                  ])
                : !hasToAssetFilters &&
                    filteredToAssetResult.totalMatches > TO_ASSET_UNFILTERED_MAX
                  ? I18nUtils.getMessage('portfolio_to_asset_filter_hint')
                  : undefined
          }
        />
      ) : null;

    const amountField = (
      <div className="portfolio-amount-field">
        <InputComponent
          label="popup_html_transfer_amount"
          type={InputType.NUMBER}
          value={amount}
          min={0}
          onChange={setAmount}
          classname={
            amountQuoteError || hasInsufficientFromBalance
              ? 'portfolio-amount-input--error'
              : undefined
          }
          rightActionClicked={
            canSetAmountToMax ? handleSetAmountToMax : undefined
          }
          rightActionIcon={
            canSetAmountToMax ? SVGIcons.INPUT_MAX : undefined
          }
        />
        {hasInsufficientFromBalance && (
          <p className="portfolio-field-error" role="alert">
            {I18nUtils.getMessage('portfolio_insufficient_balance', [
              selectedFromRow?.symbol ?? '',
            ])}
          </p>
        )}
        {amountQuoteError &&
          (canFillMinimumAmount ? (
            <button
              type="button"
              className="portfolio-field-error portfolio-field-error--action"
              onClick={handleFillMinimumAmount}
              data-testid="portfolio-fill-minimum-amount">
              {I18nUtils.getMessage(
                amountQuoteError.key,
                amountQuoteError.params,
              )}
            </button>
          ) : (
            <p className="portfolio-field-error" role="alert">
              {I18nUtils.getMessage(
                amountQuoteError.key,
                amountQuoteError.params,
              )}
            </p>
          ))}
      </div>
    );

    const shouldShowFlowAccountSelect =
      flowAccountOptions.length > 0 && Boolean(selectedAccount);
    const shouldShowFlowAccountSelectUpFront =
      mode === 'swap' || mode === 'sell';
    const shouldShowFlowAccountSelectAfterFields =
      mode === 'buy' && Boolean(flowAccountKind);

    const flowAccountSelectValue =
      flowSelectedAccount?.key ||
      flowAccountOptions[0]?.key ||
      selectedAccountKey;

    const flowAccountSelect = shouldShowFlowAccountSelect ? (
      <div className="portfolio-flow-group">
        <PortfolioOverlayListSelect
          id="portfolio-flow-account"
          label={I18nUtils.getMessage('portfolio_account')}
          value={flowAccountSelectValue}
          onChange={handleSelectedAccountChange}
          options={flowOverlayAccountOptions}
          renderDisplay={renderAccountRow}
          renderOption={renderAccountRow}
        />
      </div>
    ) : null;

    return (
      <div className="portfolio-flow">
        {shouldShowFlowAccountSelectUpFront ? flowAccountSelect : null}
        {mode === 'buy' ? (
          <>
            <div className="portfolio-flow-group">
              <div className="portfolio-flow-pair-row portfolio-flow-pair-row--amount-first">
                {amountField}
                <div className="portfolio-flow-pair-row__secondary">
                  {fiatCurrencyField}
                </div>
              </div>
            </div>
            <div className="portfolio-flow-group">
              {toAssetOptions.length > 0 ? (
                <div className="portfolio-flow-pair-row">
                  {toAssetSelect}
                  <div className="portfolio-flow-pair-row__secondary">
                    {estimatedAmountInput}
                  </div>
                </div>
              ) : (
                toAssetSelect
              )}
              {paymentMethodField}
            </div>
            {shouldShowFlowAccountSelectAfterFields ? flowAccountSelect : null}
            {renderQuotesSection()}
          </>
        ) : mode === 'sell' ? (
          <>
            <div className="portfolio-flow-group">
              <div className="portfolio-flow-pair-row">
                {fromAssetSelect}
                <div className="portfolio-flow-pair-row__secondary">
                  {amountField}
                </div>
              </div>
            </div>
            <div className="portfolio-flow-group">
              <div className="portfolio-flow-pair-row">
                {estimatedAmountInput}
                <div className="portfolio-flow-pair-row__secondary">
                  {fiatCurrencyField}
                </div>
              </div>
              {paymentMethodField}
              {renderQuotesSection()}
            </div>
          </>
        ) : (
          <>
            <div className="portfolio-flow-group">
              <div className="portfolio-flow-pair-row">
                {fromAssetSelect}
                <div className="portfolio-flow-pair-row__secondary">
                  {amountField}
                </div>
              </div>
            </div>
            <div className="portfolio-flow-group">
              {toAssetOptions.length > 0 ? (
                <div className="portfolio-flow-pair-row">
                  {toAssetSelect}
                  <div className="portfolio-flow-pair-row__secondary">
                    {estimatedAmountInput}
                  </div>
                </div>
              ) : (
                toAssetSelect
              )}
              {renderQuotesSection()}
            </div>
          </>
        )}
        {requiresRecipientInput && (
          <div className="portfolio-flow-group">
            {shouldShowRecipientAccountSelect ? (
              <>
                <PortfolioOverlayListSelect
                  id="portfolio-recipient-account"
                  label={I18nUtils.getMessage(recipientAddressLabelKey)}
                  options={recipientOverlayAccountOptions}
                  value={recipientSelectValue}
                  onChange={handleRecipientSelectChange}
                  renderDisplay={renderRecipientOption}
                  renderOption={renderRecipientOption}
                />
                {recipientSelectValue === PORTFOLIO_RECIPIENT_OTHER_VALUE ? (
                  <InputComponent
                    id="portfolio-recipient-address"
                    type={InputType.TEXT}
                    value={recipientAddress}
                    onChange={setRecipientAddress}
                    error={recipientFieldError}
                    dataTestId="portfolio-recipient-address"
                  />
                ) : null}
              </>
            ) : (
              <InputComponent
                id="portfolio-recipient-address"
                label={recipientAddressLabelKey}
                type={InputType.TEXT}
                value={recipientAddress}
                onChange={setRecipientAddress}
                error={recipientFieldError}
                dataTestId="portfolio-recipient-address"
              />
            )}
          </div>
        )}
        {(selectedQuoteId ||
          (selectedQuote && !canExecuteSelectedQuote)) && (
          <div className="portfolio-flow-actions">
            {selectedQuoteId && (
              <ButtonComponent
                label="portfolio_continue"
                type={ButtonType.ALTERNATIVE}
                disabled={
                  !canExecuteSelectedQuote || hasInsufficientFromBalance
                }
                onClick={() => {
                  if (
                    selectedQuote &&
                    canExecuteSelectedQuote &&
                    !hasInsufficientFromBalance
                  ) {
                    void executeQuote(selectedQuote);
                  }
                }}
              />
            )}
            {selectedQuote && !canExecuteSelectedQuote && (
              <div className="portfolio-status">
                {I18nUtils.getMessage(
                  'portfolio_provider_execution_unavailable',
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderHistoryVisibilityToggle = () => {
    if (section !== 'history' || !hasCreatedExpiredHistory) {
      return null;
    }

    return (
      <CheckboxComponent
        checked={showCreatedExpiredHistory}
        onChange={setShowCreatedExpiredHistory}
        title="portfolio_history_show_created_expired"
        dataTestId="portfolio-history-show-created-expired"
      />
    );
  };

  const renderHistory = () => {
    const historyRefreshControl = renderHistoryRefreshControl();
    const historyVisibilityToggle = renderHistoryVisibilityToggle();
    const historyToolbar =
      historyRefreshControl || historyVisibilityToggle ? (
        <div className="portfolio-history-toolbar">
          {historyRefreshControl}
          {historyVisibilityToggle}
        </div>
      ) : null;

    if (visibleHistory.length === 0) {
      return (
        <>
          {historyToolbar}
          <div className="portfolio-empty">
            {I18nUtils.getMessage('portfolio_no_history')}
          </div>
        </>
      );
    }

    return (
      <>
        {historyToolbar}
        <div className="portfolio-history-list">
          {visibleHistory.map((item) => (
            <PortfolioHistoryCard
              key={item.id}
              item={item}
              fromAsset={PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
                item.fromAssetId,
                canonicalAssetsForRowResolution,
                hiveEngineTokenLogoUrls,
              )}
              toAsset={PortfolioHistoryDisplayUtils.resolvePortfolioAssetById(
                item.toAssetId,
                canonicalAssetsForRowResolution,
                hiveEngineTokenLogoUrls,
              )}
              chains={toAssetEvmChains}
              portfolioChains={portfolioChains}
            />
          ))}
        </div>
      </>
    );
  };

  const renderSectionContent = () => {
    const isLoadingPortfolioWithRows =
      isPortfolioLoading && section === 'portfolio' && rows.length > 0;

    const showInitialPortfolioSpinner =
      isPortfolioLoading && rows.length === 0 && section === 'portfolio';

    const isFlowCatalogLoading =
      section === 'swap'
        ? isSwapAvailableAssetsLoading || !hasLoadedSwapAvailableAssets
        : isFiatRampSection(section)
          ? isRampAvailableAssetsLoading || isFiatRampOptionsLoading
          : false;

    // Wait for account + flow catalog only. Portfolio balances stream in via
    // onChainUpdate so one slow RPC cannot block the whole swap/buy/sell form.
    const showFlowLoadingSpinner =
      isQuoteAutoFetchSection(section) &&
      (!selectedAccountKey || isFlowCatalogLoading);

    const showHistorySpinner =
      isHistoryLoading && history.length === 0 && section === 'history';

    if (pendingInAppConfirmation) {
      return (
        <PortfolioConfirmationStepComponent
          context={pendingInAppConfirmation}
          onDismiss={() => setPendingInAppConfirmation(null)}
        />
      );
    }

    if (
      showInitialPortfolioSpinner ||
      showFlowLoadingSpinner ||
      showHistorySpinner
    ) {
      return (
        <div className="rotating-logo-wrapper">
          <RotatingLogoComponent />
        </div>
      );
    }
    if (section === 'portfolio') {
      return renderPortfolio(isLoadingPortfolioWithRows);
    }
    if (section === 'history') return renderHistory();
    return renderFlow();
  };

  const pageTitleKey = pendingInAppConfirmation
    ? 'popup_html_confirm'
    : `portfolio_section_${section}`;
  const pageDescriptionKey =
    section === 'buy' ||
    section === 'sell' ||
    section === 'swap' ||
    section === 'history'
      ? `portfolio_page_description_${section}`
      : 'portfolio_page_description';
  const isCompactPortfolioCard =
    Boolean(pendingInAppConfirmation) ||
    (section !== 'portfolio' && section !== 'history');
  const showPortfolioRefreshButton =
    !pendingInAppConfirmation && section === 'portfolio';

  return (
    <div className="portfolio-app-shell" data-testid="portfolio-page">
      <aside className="portfolio-sidebar">
        <div className="portfolio-brand">
          <img
            src="/assets/images/keychain-round-logo.svg"
            alt=""
            width={40}
            height={40}
          />
          <span>{I18nUtils.getMessage('portfolio')}</span>
        </div>
        <nav>
          {sections.map((item) => (
            <button
              key={item}
              className={item === section ? 'active' : ''}
              data-testid={`portfolio-nav-${item}`}
              onClick={() => setSection(item)}
              title={I18nUtils.getMessage(`portfolio_section_${item}`)}
              type="button">
              <SVGIcon
                icon={sectionIcons[item as PortfolioNavSection]}
                className="portfolio-sidebar-nav-icon"
              />
              <span>{I18nUtils.getMessage(`portfolio_section_${item}`)}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="portfolio-column">
        <main className="portfolio-main">
          <section
            className={`portfolio-page-frame${
              isCompactPortfolioCard ? ' portfolio-page-frame--compact' : ''
            }`}>
            <div
              className={`portfolio-card${
                isCompactPortfolioCard ? ' portfolio-card--compact' : ''
              }`}>
              <header className="portfolio-page-header">
                <div className="portfolio-page-header__title">
                  <h1>{I18nUtils.getMessage(pageTitleKey)}</h1>
                  {showPortfolioRefreshButton && (
                    <button
                      aria-label={I18nUtils.getMessage('portfolio_refresh')}
                      className="portfolio-refresh-button"
                      disabled={isPortfolioLoading || isRefreshing}
                      onClick={() => void handleRefreshPortfolioData()}
                      title={I18nUtils.getMessage('portfolio_refresh')}
                      type="button">
                      <SVGIcon
                        className={`portfolio-refresh-icon ${
                          isRefreshing || isPortfolioLoading ? 'rotate' : ''
                        }`}
                        icon={SVGIcons.SWAPS_HISTORY_REFRESH}
                      />
                    </button>
                  )}
                </div>
                {!pendingInAppConfirmation && (
                  <p>{I18nUtils.getMessage(pageDescriptionKey)}</p>
                )}
              </header>
              {renderSectionContent()}
              {statusMessage &&
                statusMessage !== 'portfolio_no_quote_available' && (
                  <div className="portfolio-status" role="status">
                    {I18nUtils.getMessage(statusMessage, statusMessageParams)}
                  </div>
                )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  hiveAccounts: state.hive.accounts,
  evmAccounts: state.evm.accounts,
  activeHiveAccountName: state.hive.activeAccount?.account?.name,
  activeEvmAccountAddress: state.evm.activeAccount?.wallet?.address,
  activeAccountType: state.activeAccountType,
  mk: state.mk,
});

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  resetLoading,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PortfolioComponent = connector(Portfolio);

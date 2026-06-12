import { CurrencyPrices } from '@interfaces/bittrex.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc20,
  EvmSmartContractInfoNative,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import {
  DiscoveredToken,
  DiscoveredTokensChainGroup,
  EvmLightNodeUtils,
} from '@popup/evm/utils/evm-light-node.utils';
import {
  AccountCreationType,
  AccountCreationUtils,
  AccountCreationMode,
} from '@popup/hive/utils/account-creation.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setChain } from '@popup/multichain/actions/chain.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
  HiveChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { Asset } from 'hive-keychain-commons';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import CurrencyPricesUtils from 'src/popup/hive/utils/currency-prices.utils';
import HiveUtils from 'src/popup/hive/utils/hive.utils';
import { EvmFormatUtils } from 'src/popup/evm/utils/evm-format.utils';
import { EvmTokensUtils } from 'src/popup/evm/utils/evm-tokens.utils';
import FormatUtils from 'src/utils/format.utils';

const HIVE_ACCOUNT_CREATION_PRICE = 3;
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

type AccountItemType = 'HIVE' | 'EVM';

import { I18nUtils } from 'src/utils/i18n.utils';
interface AccountItemOption extends OptionItem {
  accountType: AccountItemType;
  hiveAccount?: LocalAccount;
  evmAccount?: EvmAccount;
}

export interface EvmPaymentTokenOption extends OptionItem {
  chainId: string;
  tokenAddress: string | null;
  symbol: string;
  chainName: string;
  priceUsd: number;
  balanceUsd: number;
  formattedBalance: string;
  decimals: number;
  name: string;
  logo: string;
}

const CreateAccountStepOne = ({
  activeAccount,
  accounts,
  evmAccounts,
  currencyLabels,
  currencyPrices,
  setTitleContainerProperties,
  setChain,
  navigateToWithParams,
  setErrorMessage,
  navParams,
}: PropsFromRedux) => {
  const [accountOptions, setAccountOptions] = useState<AccountItemOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountItemOption>();
  const [accountName, setAccountName] = useState('');
  const [price, setPrice] = useState(HIVE_ACCOUNT_CREATION_PRICE);
  const [creationType, setCreationType] = useState<AccountCreationType>();
  const [tokenOptions, setTokenOptions] = useState<EvmPaymentTokenOption[]>([]);
  const [selectedPaymentToken, setSelectedPaymentToken] =
    useState<EvmPaymentTokenOption>();
  const [evmTokensLoading, setEvmTokensLoading] = useState(false);
  const [evmTokensError, setEvmTokensError] = useState('');
  const [hiveUsd, setHiveUsd] = useState<number>();

  const accountCreationMode =
    navParams?.mode ?? AccountCreationMode.DEFAULT;
  const isPaidBackendCreation =
    accountCreationMode === AccountCreationMode.PAID_BACKEND_CREATION;

  const hiveUsdThreshold = useMemo(() => {
    return hiveUsd ? HIVE_ACCOUNT_CREATION_PRICE * hiveUsd : undefined;
  }, [hiveUsd]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_account',
      isBackButtonEnabled: true,
      onCloseAdditional: () => {
        restorePreviousChain();
      },
    });
    initPrice();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadHiveUsd = async () => {
      const stateHiveUsd = getHiveUsd(currencyPrices);
      if (stateHiveUsd) {
        setHiveUsd(stateHiveUsd);
        return;
      }

      const prices = await CurrencyPricesUtils.getPrices();
      const fallbackHiveUsd = getHiveUsd(prices);
      if (!cancelled && fallbackHiveUsd) {
        setHiveUsd(fallbackHiveUsd);
      }
    };

    void loadHiveUsd();

    return () => {
      cancelled = true;
    };
  }, [currencyPrices]);

  const restorePreviousChain = () => {
    const previousChain = ChainUtils.getPreviousChain();
    if (previousChain) {
      void setChain(previousChain);
    }
  };

  const initPrice = async () => {
    setPrice(await HiveUtils.getAccountPrice());
  };

  useEffect(() => {
    initAccountOptions();
  }, [accounts, evmAccounts, activeAccount, isPaidBackendCreation]);

  const initAccountOptions = () => {
    const hiveOptions: AccountItemOption[] = isPaidBackendCreation
      ? []
      : (accounts as LocalAccount[]).map((account) => ({
          label: `@${account.name!}`,
          value: `hive:${account.name!}`,
          img: `https://images.hive.blog/u/${account.name!}/avatar`,
          canDelete: false,
          accountType: 'HIVE' as AccountItemType,
          hiveAccount: account,
        }));

    const visibleEvmAccounts = (evmAccounts as EvmAccount[]).filter(
      (account) => !account.hide,
    );
    const evmOptions: AccountItemOption[] = visibleEvmAccounts.map((account) => ({
      label: EvmAccountUtils.getAccountName(account),
      subLabel: EvmFormatUtils.formatAddress(account.wallet.address),
      value: `evm:${account.wallet.address}`,
      img: SVGIcons.BLOCKCHAIN_ETHEREUM,
      canDelete: false,
      accountType: 'EVM' as AccountItemType,
      evmAccount: account,
    }));

    const options = [...hiveOptions, ...evmOptions];
    setAccountOptions(options);

    if (
      selectedAccount &&
      options.some((option) => option.value === selectedAccount.value)
    ) {
      return;
    }

    const activeHiveOption = options.find(
      (option) =>
        option.accountType === 'HIVE' &&
        option.hiveAccount?.name === activeAccount.name,
    );
    setSelectedAccount(activeHiveOption ?? options[0]);
  };

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    let cancelled = false;
    if (selectedAccount.accountType === 'HIVE') {
      void onSelectedHiveAccountChanged(selectedAccount.hiveAccount!.name!);
    } else {
      void loadEvmPaymentTokens(selectedAccount.evmAccount!, () => cancelled);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedAccount, hiveUsdThreshold]);

  const onSelectedHiveAccountChanged = async (username: string) => {
    setTokenOptions([]);
    setSelectedPaymentToken(undefined);
    setEvmTokensError('');
    const account = (await AccountUtils.getExtendedAccount(username)) as any;
    if (!account) {
      return;
    }

    if (account.pending_claimed_accounts > 0) {
      setPrice(0);
      setCreationType(AccountCreationType.USING_TICKET);
    } else {
      setPrice(HIVE_ACCOUNT_CREATION_PRICE);
      setCreationType(AccountCreationType.BUYING);
    }
  };

  const loadEvmPaymentTokens = async (
    evmAccount: EvmAccount,
    isCancelled: () => boolean,
  ) => {
    setCreationType(undefined);
    setPrice(HIVE_ACCOUNT_CREATION_PRICE);
    setTokenOptions([]);
    setSelectedPaymentToken(undefined);

    if (!hiveUsdThreshold) {
      setEvmTokensError('Unable to load HIVE/USD price.');
      return;
    }

    setEvmTokensError('');
    setEvmTokensLoading(true);
    try {
      const discovery =
        await EvmLightNodeUtils.getDiscoveredTokensForAllRegisteredChains(
          evmAccount.wallet.address,
        );
      if (isCancelled()) return;

      const options = (
        await getLiveEvmPaymentTokenOptions(
          evmAccount.wallet.address,
          discovery.chains,
        )
      )
        .filter((option) => option.balanceUsd >= hiveUsdThreshold)
        .sort((a, b) => b.balanceUsd - a.balanceUsd);

      setTokenOptions(options);
      setSelectedPaymentToken(options[0]);
      if (!options.length) {
        setEvmTokensError('No payable EVM token balance found.');
      }
    } catch (err) {
      if (!isCancelled()) {
        setEvmTokensError('Unable to load EVM payment tokens.');
      }
    } finally {
      if (!isCancelled()) {
        setEvmTokensLoading(false);
      }
    }
  };

  const validateAccountName = async () => {
    if (accountName.length < 3) {
      setErrorMessage('popup_html_create_account_username_too_short');
      return false;
    }
    if (accountName.length > 16) {
      setErrorMessage('popup_html_create_account_username_too_long');
      return false;
    }
    if (!/^[a-z0-9.-]+$/.test(accountName)) {
      setErrorMessage('popup_html_create_account_username_case_not_valid');
      return false;
    }
    if (!/^[a-zA-Z]/.test(accountName) || !/[a-zA-Z0-9]$/.test(accountName)) {
      setErrorMessage(
        'popup_html_create_account_username_start_or_end_not_valid',
      );
      return false;
    }
    if (!AccountCreationUtils.validateUsername(accountName)) {
      setErrorMessage('html_popup_create_account_account_name_not_valid');
      return false;
    }
    if (await AccountCreationUtils.checkAccountNameAvailable(accountName)) {
      return true;
    } else {
      setErrorMessage('html_popup_create_account_username_already_used');
      return false;
    }
  };

  const getPriceLabel = () => {
    if (selectedAccount?.accountType === 'EVM') {
      return hiveUsdThreshold
        ? `$${FormatUtils.withCommas(hiveUsdThreshold, 2, true)}`
        : '$...';
    }

    switch (creationType) {
      case AccountCreationType.BUYING:
        return `${price} ${currencyLabels.hive}`;
      case AccountCreationType.USING_TICKET:
        return I18nUtils.getMessage('html_popup_ticket', ['1']);
    }
  };

  const goToNextPage = async () => {
    if (!selectedAccount || !(await validateAccountName())) {
      return;
    }

    if (selectedAccount.accountType === 'EVM') {
      if (!selectedPaymentToken) {
        setErrorMessage('Unable to select an EVM payment token.');
        return;
      }

      navigateToWithParams(Screen.CREATE_ACCOUNT_PAGE_STEP_TWO, {
        newUsername: accountName,
        mode: accountCreationMode,
        evmPayerAccount: selectedAccount.evmAccount,
        evmPaymentToken: selectedPaymentToken,
        paymentSelection: {
          paymentChainId: selectedPaymentToken.chainId,
          paymentTokenAddress: selectedPaymentToken.tokenAddress,
          payerEvmAddress: selectedAccount.evmAccount!.wallet.address,
          paymentTokenSymbol: selectedPaymentToken.symbol,
          paymentTokenName: selectedPaymentToken.name,
          paymentTokenDecimals: selectedPaymentToken.decimals,
          paymentTokenLogo: selectedPaymentToken.logo,
        },
      });
      return;
    }

    const account = await AccountUtils.getExtendedAccount(
      selectedAccount.hiveAccount?.name!,
    );
    const balance = Asset.fromString(account.balance.toString());
    if (
      creationType === AccountCreationType.USING_TICKET ||
      (creationType === AccountCreationType.BUYING &&
        balance.amount >= HIVE_ACCOUNT_CREATION_PRICE)
    ) {
      navigateToWithParams(Screen.CREATE_ACCOUNT_PAGE_STEP_TWO, {
        usedAccount: selectedAccount.hiveAccount,
        newUsername: accountName,
        creationType: creationType,
        mode: accountCreationMode,
        price: price,
      });
    } else {
      setErrorMessage('html_popup_account_creation_not_enough_found');
    }
  };

  const hasEvmAccountSelected = selectedAccount?.accountType === 'EVM';

  return (
    <div
      data-testid={`${Screen.CREATE_ACCOUNT_PAGE_STEP_ONE}-page`}
      className="create-account-step-one">
      {selectedAccount && accountOptions.length > 0 && (
        <ComplexeCustomSelect<AccountItemOption>
          selectedItem={selectedAccount}
          options={accountOptions}
          setSelectedItem={(item: AccountItemOption) =>
            setSelectedAccount(item)
          }
          background="white"
          additionalClassname="create-account-user-dropdown"
        />
      )}
      {accountOptions.length === 0 && (
        <div className="create-account-empty-state">
          {isPaidBackendCreation
            ? 'No EVM account available to pay for account creation.'
            : 'No account available to create this account.'}
        </div>
      )}
      {selectedAccount && (
        <div className="price-panel">
          <span className="label">
            {I18nUtils.getMessage('html_popup_price')}
          </span>
          <span className="price">{getPriceLabel()}</span>
        </div>
      )}
      {hasEvmAccountSelected && (
        <>
          {evmTokensLoading && (
            <div className="evm-token-state">Loading payment tokens...</div>
          )}
          {!evmTokensLoading && selectedPaymentToken && (
            <ComplexeCustomSelect<EvmPaymentTokenOption>
              label="Payment token"
              skipLabelTranslation
              selectedItem={selectedPaymentToken}
              options={tokenOptions}
              setSelectedItem={setSelectedPaymentToken}
              background="white"
              filterable
              additionalClassname="payment-token-select"
            />
          )}
          {!evmTokensLoading && evmTokensError && (
            <div className="evm-token-state error">{evmTokensError}</div>
          )}
        </>
      )}
      <InputComponent
        onChange={setAccountName}
        value={accountName}
        logo={SVGIcons.INPUT_AT}
        placeholder="popup_html_username"
        label="popup_html_username"
        type={InputType.TEXT}
      />
      <div className="fill-space"></div>
      <ButtonComponent
        label="html_popup_next"
        onClick={() => goToNextPage()}
        disabled={
          !selectedAccount ||
          (hasEvmAccountSelected && (!selectedPaymentToken || evmTokensLoading))
        }
      />
    </div>
  );
};

const getHiveUsd = (currencyPrices: CurrencyPrices) => {
  const hiveUsd = currencyPrices?.hive?.usd;
  return typeof hiveUsd === 'number' && Number.isFinite(hiveUsd) && hiveUsd > 0
    ? hiveUsd
    : undefined;
};

const getLiveEvmPaymentTokenOptions = async (
  walletAddress: string,
  chainGroups: DiscoveredTokensChainGroup[],
) => {
  const chainsById = await getEvmPaymentChainsById();
  const optionsByChain = await Promise.all(
    chainGroups.map(async (chainGroup) => {
      const chain = chainsById.get(getChainIdLookupKey(chainGroup.chainId));
      if (!chain) {
        return [];
      }

      const tokenMetadata = getChainGroupPaymentTokens(chainGroup)
        .map((token) => buildEvmPaymentTokenMetadata(chain, chainGroup, token))
        .filter((token): token is EvmSmartContractInfo => !!token);
      if (!tokenMetadata.length) {
        return [];
      }

      const liveBalances = await EvmTokensUtils.getTokenBalances(
        walletAddress,
        chain,
        tokenMetadata,
      );
      return liveBalances
        .filter((balance): balance is NativeAndErc20Token => !!balance)
        .map((balance) => buildEvmPaymentTokenOption(chainGroup, balance))
        .filter((option): option is EvmPaymentTokenOption => !!option);
    }),
  );

  return optionsByChain.flat();
};

const getEvmPaymentChainsById = async () => {
  const setupChains = await ChainUtils.getSetupChains();
  const chainsById = new Map<string, EvmChain>();

  for (const chain of setupChains) {
    if (chain.type === ChainType.EVM && chain.isCustom !== true) {
      chainsById.set(getChainIdLookupKey(chain.chainId), chain as EvmChain);
    }
  }

  return chainsById;
};

const buildEvmPaymentTokenMetadata = (
  chain: EvmChain,
  chainGroup: DiscoveredTokensChainGroup,
  token: DiscoveredToken,
): EvmSmartContractInfo | undefined => {
  const tokenType = getDiscoveredTokenType(token);
  if (tokenType !== 'NATIVE' && tokenType !== 'ERC20') {
    return undefined;
  }
  if ('possibleSpam' in token && token.possibleSpam) {
    return undefined;
  }

  return tokenType === 'NATIVE'
    ? buildNativePaymentTokenMetadata(chain, chainGroup, token)
    : buildErc20PaymentTokenMetadata(chain, token);
};

const buildNativePaymentTokenMetadata = (
  chain: EvmChain,
  chainGroup: DiscoveredTokensChainGroup,
  token: DiscoveredToken,
): EvmSmartContractInfoNative => {
  const priceUsd = getTokenPriceUsd(token);
  return {
    type: EVMSmartContractType.NATIVE,
    name: token.name || chainGroup.chain.name || chain.name,
    symbol: token.symbol || chain.mainToken || chainGroup.chain.nativeToken || 'Token',
    logo:
      token.logo ||
      (token as any).logoUrl ||
      (token as any).metadata?.logoUrl ||
      chain.logo ||
      '',
    chainId: chain.chainId,
    backgroundColor:
      (token as any).backgroundColor || chainGroup.chain.backgroundColor || '',
    coingeckoId: (token as any).coingeckoId || chain.nativeCoinId || '',
    priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
    createdAt: (token as any).createdAt || new Date(0).toISOString(),
    categories: Array.isArray((token as any).categories)
      ? (token as any).categories
      : [],
  };
};

const buildErc20PaymentTokenMetadata = (
  chain: EvmChain,
  token: DiscoveredToken,
): EvmSmartContractInfoErc20 | undefined => {
  const contractAddress = (token as any).contractAddress ?? (token as any).tokenAddress;
  const decimals = Number((token as any).decimals ?? (token as any).metadata?.decimals);
  if (
    !contractAddress ||
    contractAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS ||
    !Number.isFinite(decimals)
  ) {
    return undefined;
  }

  const priceUsd = getTokenPriceUsd(token);
  return {
    type: EVMSmartContractType.ERC20,
    name: token.name || (token as any).metadata?.name || token.symbol || 'Token',
    symbol: token.symbol || (token as any).metadata?.symbol || 'Token',
    decimals,
    logo:
      token.logo || (token as any).logoUrl || (token as any).metadata?.logoUrl || '',
    chainId: chain.chainId,
    contractAddress,
    backgroundColor: (token as any).backgroundColor || '',
    coingeckoId: (token as any).coingeckoId || (token as any).metadata?.coingeckoId,
    priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
    possibleSpam: !!(token as any).possibleSpam,
    verifiedContract: (token as any).verifiedContract ?? true,
    isProxy: !!(token as any).isProxy,
    proxyTarget: (token as any).proxyTarget ?? null,
    validated: Number((token as any).validated ?? 0),
  };
};

const buildEvmPaymentTokenOption = (
  chainGroup: DiscoveredTokensChainGroup,
  tokenBalance: NativeAndErc20Token,
): EvmPaymentTokenOption | undefined => {
  const { tokenInfo } = tokenBalance;
  const priceUsd = Number(tokenInfo.priceUsd);
  const balanceUsd = tokenBalance.balanceInteger * priceUsd;
  if (
    !Number.isFinite(balanceUsd) ||
    balanceUsd <= 0 ||
    !Number.isFinite(priceUsd) ||
    priceUsd <= 0
  ) {
    return undefined;
  }

  const rawTokenAddress =
    tokenInfo.type === EVMSmartContractType.NATIVE
      ? null
      : (tokenInfo as EvmSmartContractInfoErc20).contractAddress;
  const tokenAddress =
    !rawTokenAddress || rawTokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS
      ? null
      : rawTokenAddress;

  return {
    label: tokenInfo.symbol || chainGroup.chain.nativeToken || 'Token',
    subLabel: chainGroup.chain.name,
    subLabelHover: chainGroup.chain.name,
    value: `${chainGroup.chainId}:${tokenAddress ?? 'native'}`,
    key: `evm-payment-token-${chainGroup.chainId}-${tokenAddress ?? 'native'}`,
    img:
      tokenInfo.logo ||
      (tokenInfo as any).logoUrl ||
      (tokenInfo as any).metadata?.logoUrl ||
      SVGIcons.MENU_TOKENS,
    imgChip: chainGroup.chain.logoUrl ?? undefined,
    imgChipChainName: chainGroup.chain.name,
    chainId: String(chainGroup.chainId),
    tokenAddress,
    symbol: tokenInfo.symbol || chainGroup.chain.nativeToken || 'Token',
    name: tokenInfo.name || tokenInfo.symbol || chainGroup.chain.name,
    decimals:
      tokenInfo.type === EVMSmartContractType.ERC20 ? tokenInfo.decimals : 18,
    logo:
      tokenInfo.logo ||
      (tokenInfo as any).logoUrl ||
      (tokenInfo as any).metadata?.logoUrl ||
      '',
    chainName: chainGroup.chain.name,
    priceUsd,
    balanceUsd,
    formattedBalance: tokenBalance.formattedBalance,
  };
};

const getDiscoveredTokenType = (token: DiscoveredToken) => {
  return String((token as any).type ?? (token as any).kind ?? '').toUpperCase();
};

const getChainGroupPaymentTokens = (chainGroup: DiscoveredTokensChainGroup) => {
  const tokens = [...chainGroup.tokens];
  const nativeToken = (chainGroup as any).nativeToken;
  if (
    nativeToken &&
    !tokens.some((token) => getDiscoveredTokenType(token) === 'NATIVE')
  ) {
    tokens.unshift(nativeToken);
  }

  return tokens;
};

const getTokenPriceUsd = (token: DiscoveredToken) => {
  return parseNumber(
    (token as any).priceUsd ??
      (token as any).price?.priceUsd ??
      (token as any).usdPrice,
  );
};

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const numericMatch = value.replace(/[$,]/g, '').match(/-?\d+(\.\d+)?/);
    return numericMatch ? Number(numericMatch[0]) : NaN;
  }

  return NaN;
};

const getChainIdLookupKey = (chainId: string | number) => {
  const value = String(chainId).trim().toLowerCase();
  if (/^0x[0-9a-f]+$/i.test(value)) {
    return BigInt(value).toString();
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? String(Math.trunc(numericValue)) : value;
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    accounts: state.hive.accounts,
    evmAccounts: state.evm.accounts,
    currencyLabels: (state.chain as HiveChain).mainTokens,
    currencyPrices: state.hive.currencyPrices,
    navParams: state.navigation.params,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setChain,
  navigateToWithParams,
  setErrorMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const CreateAccountStepOneComponent = connector(CreateAccountStepOne);

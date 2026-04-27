import {
  ShortcutAccountType,
  ShortcutActionType,
  ShortcutDefinition,
  ShortcutParams,
} from '@interfaces/shortcut.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { NativeAndErc20Token } from '@popup/evm/interfaces/active-account.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfoErc20,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { EvmAccountUtils } from '@popup/evm/utils/evm-account.utils';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { HiveScreen } from '@popup/hive/reference-data/hive-screen.enum';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  Chain,
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import ShortcutsUtils from 'src/utils/shortcuts.utils';

const LAST_USED_EVM_CHAIN_TARGET = 'last_used_evm_chain';

const buildEvmTokenKey = (token: NativeAndErc20Token) => {
  if (token.tokenInfo.type === EVMSmartContractType.NATIVE) {
    return `${EVMSmartContractType.NATIVE}:${token.tokenInfo.symbol}`;
  }
  return `${EVMSmartContractType.ERC20}:${token.tokenInfo.chainId}:${(
    token.tokenInfo as EvmSmartContractInfoErc20
  ).contractAddress.toLowerCase()}`;
};

const getEvmTokenContractAddress = (token: NativeAndErc20Token) =>
  token.tokenInfo.type === EVMSmartContractType.ERC20
    ? (token.tokenInfo as EvmSmartContractInfoErc20).contractAddress
    : undefined;

const Shortcuts = ({
  accounts,
  evmAccounts,
  mk,
  userTokens,
  tokens,
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingShortcutId, setEditingShortcutId] = useState<string | null>(
    null,
  );
  const [combo, setCombo] = useState('');
  const [actionType, setActionType] = useState<ShortcutActionType>(
    ShortcutActionType.NAVIGATE,
  );
  const [target, setTarget] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'hive' | 'hbd'>(
    'hive',
  );
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState('');
  const [selectedDelegationType, setSelectedDelegationType] =
    useState<DelegationType>(DelegationType.OUTGOING);
  const [selectedTransferChainId, setSelectedTransferChainId] = useState('');
  const [selectedEvmTokenKey, setSelectedEvmTokenKey] = useState('');
  const [evmTransferTokens, setEvmTransferTokens] = useState<
    NativeAndErc20Token[]
  >([]);
  const [evmLocalAccounts, setEvmLocalAccounts] = useState<EvmAccount[]>([]);
  const [setupChains, setSetupChains] = useState<Chain[]>([]);

  // `combo` is stored normalized for binding (e.g. "shift+command+w").
  // We format it only for display (e.g. "⇧+⌘+W").
  const comboDisplay = useMemo(() => {
    return combo ? ShortcutsUtils.formatShortcutCombo(combo) : '';
  }, [combo]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_shortcuts',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  useEffect(() => {
    if (!isFormVisible) return;
    const input = keyInputRef.current;
    if (!input) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Tab') return;
      event.preventDefault();
      event.stopPropagation();
      if (['Backspace', 'Delete', 'Escape'].includes(event.key)) {
        setCombo('');
        return;
      }
      const newCombo = ShortcutsUtils.buildShortcutComboFromEvent(event);
      if (!newCombo) return;
      setCombo(newCombo);
    };
    input.addEventListener('keydown', handler);
    return () => {
      input.removeEventListener('keydown', handler);
    };
  }, [isFormVisible]);

  const init = async () => {
    const [storedShortcuts, chains, rebuiltEvmAccounts] = await Promise.all([
      LocalStorageUtils.getValueFromLocalStorage(LocalStorageKeyEnum.SHORTCUTS),
      ChainUtils.getSetupChains(true),
      mk ? EvmWalletUtils.rebuildAccountsFromLocalStorage(mk) : evmAccounts,
    ]);
    setShortcuts(Array.isArray(storedShortcuts) ? storedShortcuts : []);
    setSetupChains(chains);
    setEvmLocalAccounts(rebuiltEvmAccounts ?? evmAccounts ?? []);
  };

  const screenOptions = useMemo<OptionItem[]>(() => {
    const uniqueScreens = Array.from(
      new Set(ShortcutsUtils.NAVIGATION_SCREENS),
    );
    return uniqueScreens.map((screen) => ({
      label: ShortcutsUtils.formatScreenLabel(screen),
      value: screen,
    }));
  }, []);

  const accountOptions = useMemo<OptionItem[]>(() => {
    const hiveOptions =
      accounts?.map((account) => ({
        label: account.name,
        value: ShortcutsUtils.buildShortcutAccountTarget(
          ShortcutAccountType.HIVE,
          account.name,
        ),
        subLabel: 'Hive',
      })) ?? [];
    const evmOptions =
      evmLocalAccounts
        ?.filter((account) => !account.hide)
        .map((account) => ({
          label: EvmAccountUtils.getAccountFullname(account),
          value: ShortcutsUtils.buildShortcutAccountTarget(
            ShortcutAccountType.EVM,
            account.wallet.address,
          ),
          subLabel: FormatUtils.shortenString(account.wallet.address, 6),
        })) ?? [];

    if (hiveOptions.length === 0 && evmOptions.length === 0) {
      return [
        {
          label: chrome.i18n.getMessage('popup_html_shortcuts_no_accounts'),
          value: '',
        },
      ];
    }
    return [...hiveOptions, ...evmOptions];
  }, [accounts, evmLocalAccounts]);

  const transferChainOptions = useMemo<OptionItem[]>(() => {
    if (!setupChains.length) {
      return [{ label: 'No chains available', value: '' }];
    }
    return setupChains.map((chain) => ({
      label: chain.name,
      value: chain.chainId,
      subLabel: chain.type,
      imgChip: chain.logo,
      imgChipChainName: chain.name,
    }));
  }, [setupChains]);

  const chainOptions = useMemo<OptionItem[]>(() => {
    const options: OptionItem[] = [...transferChainOptions];
    if (
      setupChains.some((chain) => chain.type === ChainType.EVM) &&
      !options.some((option) => option.value === LAST_USED_EVM_CHAIN_TARGET)
    ) {
      options.push({
        label: 'Last used EVM chain',
        value: LAST_USED_EVM_CHAIN_TARGET,
        subLabel: ChainType.EVM,
      });
    }
    return options;
  }, [setupChains, transferChainOptions]);

  const selectedTransferChain = useMemo(
    () => setupChains.find((chain) => chain.chainId === selectedTransferChainId),
    [selectedTransferChainId, setupChains],
  );

  const currencyOptions = useMemo<OptionItem[]>(
    () => [
      {
        label: 'HIVE',
        value: 'hive',
        img: '/assets/images/wallet/hive-logo.svg',
      },
      {
        label: 'HBD',
        value: 'hbd',
        img: '/assets/images/wallet/hbd-logo.svg',
      },
    ],
    [],
  );

  const tokenOptions = useMemo<OptionItem[]>(() => {
    if (!userTokens?.list || userTokens.list.length === 0) {
      return [
        {
          label: chrome.i18n.getMessage('popup_html_tokens_no_tokens'),
          value: '',
        },
      ];
    }
    return userTokens.list.map((tokenBalance: TokenBalance) => {
      const tokenInfo = tokens.find(
        (token: Token) => token.symbol === tokenBalance.symbol,
      );
      return {
        label: tokenBalance.symbol,
        value: tokenBalance.symbol,
        subLabel: tokenInfo?.name,
        img: tokenInfo?.metadata?.icon,
        imgBackup: '/assets/images/wallet/hive-engine.svg',
      };
    });
  }, [userTokens, tokens]);

  const transferTokenOptions = useMemo<OptionItem[]>(() => {
    if (selectedTransferChain?.type === ChainType.EVM) {
      if (!evmTransferTokens.length) {
        return [{ label: 'No tokens available', value: '' }];
      }
      return evmTransferTokens.map((token) => ({
        label: token.tokenInfo.symbol,
        value: buildEvmTokenKey(token),
        subLabel: token.tokenInfo.name,
        img: token.tokenInfo.logo,
      }));
    }
    return currencyOptions;
  }, [currencyOptions, evmTransferTokens, selectedTransferChain]);

  const delegationOptions = useMemo<OptionItem[]>(
    () => [
      {
        label: chrome.i18n.getMessage(DelegationType.OUTGOING),
        value: DelegationType.OUTGOING,
      },
      {
        label: chrome.i18n.getMessage(DelegationType.INCOMING),
        value: DelegationType.INCOMING,
      },
    ],
    [],
  );

  const actionOptions = useMemo<OptionItem[]>(() => {
    return [
      {
        label: chrome.i18n.getMessage('popup_html_shortcuts_action_navigate'),
        value: ShortcutActionType.NAVIGATE,
      },
      {
        label: chrome.i18n.getMessage(
          'popup_html_shortcuts_action_change_account',
        ),
        value: ShortcutActionType.CHANGE_ACCOUNT,
      },
      {
        label:
          chrome.i18n.getMessage('popup_html_shortcuts_action_change_chain') ||
          'Change chain',
        value: ShortcutActionType.CHANGE_CHAIN,
      },
    ];
  }, []);

  const targetOptions = useMemo<OptionItem[]>(() => {
    if (actionType === ShortcutActionType.NAVIGATE) return screenOptions;
    if (actionType === ShortcutActionType.CHANGE_ACCOUNT) return accountOptions;
    return chainOptions;
  }, [actionType, screenOptions, accountOptions, chainOptions]);

  const requiresCurrency = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      target !== MultichainScreen.TRANSFER_FUND_PAGE &&
      ShortcutsUtils.CURRENCY_REQUIRED_SCREENS.includes(target as HiveScreen),
    [actionType, target],
  );

  const requiresToken = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      ShortcutsUtils.TOKEN_REQUIRED_SCREENS.includes(target as HiveScreen),
    [actionType, target],
  );

  const requiresDelegationType = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      ShortcutsUtils.DELEGATION_REQUIRED_SCREENS.includes(target as HiveScreen),
    [actionType, target],
  );

  const requiresTransferChain = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      target === MultichainScreen.TRANSFER_FUND_PAGE,
    [actionType, target],
  );

  useEffect(() => {
    const optionMatch = targetOptions.find((item) => item.value === target);
    if (!optionMatch) {
      if (actionType === ShortcutActionType.CHANGE_ACCOUNT && target) {
        const accountTarget = ShortcutsUtils.parseShortcutAccountTarget(target);
        const normalizedTarget = ShortcutsUtils.buildShortcutAccountTarget(
          accountTarget.accountType,
          accountTarget.accountId,
        );
        if (targetOptions.some((item) => item.value === normalizedTarget)) {
          setTarget(normalizedTarget);
          return;
        }
      }
      setTarget(targetOptions[0]?.value ?? '');
    }
  }, [actionType, target, targetOptions]);

  useEffect(() => {
    if (requiresTransferChain && !selectedTransferChainId) {
      setSelectedTransferChainId(setupChains[0]?.chainId ?? '');
    }
    if (requiresCurrency && !selectedCurrency) {
      setSelectedCurrency('hive');
    }
    if (requiresToken && !selectedTokenSymbol) {
      setSelectedTokenSymbol(tokenOptions[0]?.value ?? '');
    }
    if (requiresDelegationType && !selectedDelegationType) {
      setSelectedDelegationType(DelegationType.OUTGOING);
    }
  }, [
    requiresCurrency,
    requiresToken,
    requiresDelegationType,
    requiresTransferChain,
    selectedTransferChainId,
    setupChains,
    tokenOptions,
    selectedCurrency,
    selectedTokenSymbol,
    selectedDelegationType,
  ]);

  useEffect(() => {
    let isCancelled = false;
    const loadEvmTransferTokens = async () => {
      try {
        if (
          !requiresTransferChain ||
          selectedTransferChain?.type !== ChainType.EVM
        ) {
          setEvmTransferTokens([]);
          return;
        }
        if (!evmLocalAccounts.some((account) => !account.hide)) {
          setEvmTransferTokens([]);
          return;
        }
        const chain = selectedTransferChain as EvmChain;
        const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
          chain,
          evmLocalAccounts,
        );
        let tokenInfos: NativeAndErc20Token['tokenInfo'][];
        if (chain.isCustom === true) {
          tokenInfos = [EvmTokensUtils.buildFallbackNativeTokenInfo(chain)];
        } else {
          const discoveredTokens = await EvmLightNodeUtils.getDiscoveredTokens(
            chain.chainId,
            wallet.address,
          );
          tokenInfos = discoveredTokens.tokens.filter(
            (token) =>
              token.type === EVMSmartContractType.ERC20 ||
              token.type === EVMSmartContractType.NATIVE,
          ) as NativeAndErc20Token['tokenInfo'][];
        }
        const customTokenInfos = await EvmTokensUtils.getCustomErc20TokenInfos(
          chain,
          wallet.address,
        );
        const tokens = await EvmTokensUtils.getTokenBalances(
          wallet.address,
          chain,
          EvmTokensUtils.mergeCustomErc20TokenInfos(
            tokenInfos,
            customTokenInfos,
          ),
        );
        if (isCancelled) return;
        const filteredTokens =
          (await EvmTokensUtils.filterTokensBasedOnSettings(
            tokens as NativeAndErc20Token[],
          )) as NativeAndErc20Token[];
        if (isCancelled) return;
        setEvmTransferTokens(filteredTokens);
        if (
          !selectedEvmTokenKey ||
          !filteredTokens.some(
            (token) => buildEvmTokenKey(token) === selectedEvmTokenKey,
          )
        ) {
          setSelectedEvmTokenKey(
            filteredTokens[0] ? buildEvmTokenKey(filteredTokens[0]) : '',
          );
        }
      } catch {
        if (!isCancelled) {
          setEvmTransferTokens([]);
          setSelectedEvmTokenKey('');
        }
      }
    };

    void loadEvmTransferTokens();
    return () => {
      isCancelled = true;
    };
  }, [
    evmLocalAccounts,
    requiresTransferChain,
    selectedEvmTokenKey,
    selectedTransferChain,
  ]);

  const selectedActionOption = useMemo<OptionItem>(() => {
    return (
      actionOptions.find((option) => option.value === actionType) ??
      actionOptions[0]
    );
  }, [actionOptions, actionType]);

  const selectedTargetOption = useMemo<OptionItem>(() => {
    if (target) {
      const option = targetOptions.find((item) => item.value === target);
      if (option) return option;
      return { label: target, value: target };
    }
    return targetOptions[0];
  }, [target, targetOptions]);

  const selectedCurrencyOption = useMemo<OptionItem>(() => {
    return (
      currencyOptions.find((option) => option.value === selectedCurrency) ??
      currencyOptions[0]
    );
  }, [currencyOptions, selectedCurrency]);

  const selectedTokenOption = useMemo<OptionItem>(() => {
    if (selectedTokenSymbol) {
      const option = tokenOptions.find(
        (item) => item.value === selectedTokenSymbol,
      );
      if (option) return option;
      return { label: selectedTokenSymbol, value: selectedTokenSymbol };
    }
    return tokenOptions[0];
  }, [selectedTokenSymbol, tokenOptions]);

  const selectedDelegationOption = useMemo<OptionItem>(() => {
    return (
      delegationOptions.find(
        (option) => option.value === selectedDelegationType,
      ) ?? delegationOptions[0]
    );
  }, [delegationOptions, selectedDelegationType]);

  const selectedTransferChainOption = useMemo<OptionItem>(() => {
    return (
      transferChainOptions.find(
        (option) => option.value === selectedTransferChainId,
      ) ?? transferChainOptions[0]
    );
  }, [transferChainOptions, selectedTransferChainId]);

  const selectedTransferTokenOption = useMemo<OptionItem>(() => {
    const value =
      selectedTransferChain?.type === ChainType.EVM
        ? selectedEvmTokenKey
        : selectedCurrency;
    return (
      transferTokenOptions.find((option) => option.value === value) ??
      transferTokenOptions[0]
    );
  }, [
    selectedCurrency,
    selectedEvmTokenKey,
    selectedTransferChain,
    transferTokenOptions,
  ]);

  const resetForm = useCallback(() => {
    setCombo('');
    setActionType(ShortcutActionType.NAVIGATE);
    setTarget('');
    setSelectedCurrency('hive');
    setSelectedTokenSymbol('');
    setSelectedDelegationType(DelegationType.OUTGOING);
    setSelectedTransferChainId('');
    setSelectedEvmTokenKey('');
    setEditingShortcutId(null);
    setFormVisible(false);
  }, []);

  const saveShortcuts = useCallback((updated: ShortcutDefinition[]) => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.SHORTCUTS,
      updated,
    );
    setShortcuts(updated);
  }, []);

  const validateForm = () => {
    if (!combo) {
      setErrorMessage('popup_html_shortcuts_missing_combo');
      return false;
    }
    if (!target) {
      setErrorMessage('popup_html_shortcuts_missing_target');
      return false;
    }
    if (requiresCurrency && !selectedCurrency) {
      setErrorMessage('popup_html_shortcuts_missing_target');
      return false;
    }
    if (requiresToken && !selectedTokenSymbol) {
      setErrorMessage('popup_html_shortcuts_missing_target');
      return false;
    }
    if (requiresTransferChain && !selectedTransferChainId) {
      setErrorMessage('popup_html_shortcuts_missing_target');
      return false;
    }
    if (
      requiresTransferChain &&
      selectedTransferChain?.type === ChainType.EVM &&
      !selectedEvmTokenKey
    ) {
      setErrorMessage('popup_html_shortcuts_missing_target');
      return false;
    }
    const normalizedCombo = ShortcutsUtils.normalizeShortcutCombo(combo);
    const isDuplicate = shortcuts.some(
      (shortcut) =>
        ShortcutsUtils.normalizeShortcutCombo(shortcut.combo) ===
          normalizedCombo && shortcut.id !== editingShortcutId,
    );
    if (isDuplicate) {
      setErrorMessage('popup_html_shortcuts_duplicate');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const normalizedCombo = ShortcutsUtils.normalizeShortcutCombo(combo);
    const params: ShortcutParams = {};
    if (requiresTransferChain) {
      params.chainId = selectedTransferChainId;
      if (selectedTransferChain?.type === ChainType.HIVE) {
        params.selectedCurrency = selectedCurrency;
      }
      if (selectedTransferChain?.type === ChainType.EVM) {
        const token = evmTransferTokens.find(
          (token) => buildEvmTokenKey(token) === selectedEvmTokenKey,
        );
        if (token) {
          params.tokenSymbol = token.tokenInfo.symbol;
          params.evmTokenType = token.tokenInfo.type;
          params.evmTokenContractAddress = getEvmTokenContractAddress(token);
        }
      }
    }
    if (requiresCurrency) {
      params.selectedCurrency = selectedCurrency;
    }
    if (requiresToken) {
      params.tokenSymbol = selectedTokenSymbol;
    }
    if (requiresDelegationType) {
      params.delegationType = selectedDelegationType;
    }
    if (actionType === ShortcutActionType.CHANGE_ACCOUNT) {
      const accountTarget = ShortcutsUtils.parseShortcutAccountTarget(target);
      params.accountType = accountTarget.accountType;
      params.accountId = accountTarget.accountId;
    }
    if (actionType === ShortcutActionType.CHANGE_CHAIN) {
      if (target === LAST_USED_EVM_CHAIN_TARGET) {
        params.chainId = undefined;
      } else {
        const chain = setupChains.find((chain) => chain.chainId === target);
        if (chain) {
          params.chainId = chain.chainId;
        }
      }
    }
    if (target === HiveScreen.POWER_UP_PAGE) {
      params.powerType = PowerType.POWER_UP;
    } else if (target === HiveScreen.POWER_DOWN_PAGE) {
      params.powerType = PowerType.POWER_DOWN;
    }
    const shortcut: ShortcutDefinition = {
      id: editingShortcutId ?? ShortcutsUtils.createShortcutId(),
      combo: normalizedCombo,
      actionType,
      target,
      params: Object.keys(params).length ? params : undefined,
    };
    const updatedShortcuts = editingShortcutId
      ? shortcuts.map((item) =>
          item.id === editingShortcutId ? shortcut : item,
        )
      : [...shortcuts, shortcut];
    saveShortcuts(updatedShortcuts);
    setSuccessMessage('popup_html_save_successful');
    resetForm();
  };

  const handleEdit = (shortcut: ShortcutDefinition) => {
    setEditingShortcutId(shortcut.id);
    setCombo(ShortcutsUtils.normalizeShortcutCombo(shortcut.combo));
    setActionType(shortcut.actionType);
    setTarget(shortcut.target);
    setSelectedCurrency(shortcut.params?.selectedCurrency ?? 'hive');
    setSelectedTokenSymbol(shortcut.params?.tokenSymbol ?? '');
    setSelectedDelegationType(
      (shortcut.params?.delegationType as DelegationType) ??
        DelegationType.OUTGOING,
    );
    setSelectedTransferChainId(shortcut.params?.chainId ?? '');
    if (shortcut.params?.evmTokenType === EVMSmartContractType.NATIVE) {
      setSelectedEvmTokenKey(
        `${EVMSmartContractType.NATIVE}:${shortcut.params.tokenSymbol ?? ''}`,
      );
    } else if (
      shortcut.params?.evmTokenType === EVMSmartContractType.ERC20 &&
      shortcut.params?.evmTokenContractAddress
    ) {
      setSelectedEvmTokenKey(
        `${EVMSmartContractType.ERC20}:${shortcut.params.chainId}:` +
          shortcut.params.evmTokenContractAddress.toLowerCase(),
      );
    } else {
      setSelectedEvmTokenKey('');
    }
    setFormVisible(true);
    setTimeout(() => keyInputRef.current?.focus(), 0);
  };

  const handleDelete = (shortcutId: string) => {
    const updatedShortcuts = shortcuts.filter(
      (shortcut) => shortcut.id !== shortcutId,
    );
    saveShortcuts(updatedShortcuts);
  };

  const startAddShortcut = () => {
    setEditingShortcutId(null);
    setCombo('');
    setActionType(ShortcutActionType.NAVIGATE);
    setTarget(screenOptions[0]?.value ?? '');
    setSelectedCurrency('hive');
    setSelectedTokenSymbol(tokenOptions[0]?.value ?? '');
    setSelectedDelegationType(DelegationType.OUTGOING);
    setSelectedTransferChainId(setupChains[0]?.chainId ?? '');
    setSelectedEvmTokenKey('');
    setFormVisible(true);
    setTimeout(() => keyInputRef.current?.focus(), 0);
  };

  const getShortcutExtraLabel = (shortcut: ShortcutDefinition) => {
    if (shortcut.target === HiveScreen.POWER_UP_PAGE) {
      return chrome.i18n.getMessage('popup_html_pu');
    }
    if (shortcut.target === HiveScreen.POWER_DOWN_PAGE) {
      return chrome.i18n.getMessage('dialog_title_powerdown');
    }
    if (!shortcut.params) return '';
    if (shortcut.params.tokenSymbol) {
      const delegationLabel = shortcut.params.delegationType
        ? chrome.i18n.getMessage(shortcut.params.delegationType)
        : '';
      return delegationLabel
        ? `${shortcut.params.tokenSymbol} · ${delegationLabel}`
        : shortcut.params.tokenSymbol;
    }
    if (shortcut.params.selectedCurrency) {
      return shortcut.params.selectedCurrency.toUpperCase();
    }
    if (shortcut.params.chainId) {
      const chain = setupChains.find(
        (chain) => chain.chainId === shortcut.params?.chainId,
      );
      const token = shortcut.params.tokenSymbol
        ? ` · ${shortcut.params.tokenSymbol}`
        : '';
      return `${chain?.name ?? shortcut.params.chainId}${token}`;
    }
    return '';
  };

  const getShortcutActionLabel = (action: ShortcutActionType) => {
    if (action === ShortcutActionType.CHANGE_ACCOUNT) {
      return chrome.i18n.getMessage(
        'popup_html_shortcuts_action_change_account',
      );
    }
    if (action === ShortcutActionType.CHANGE_CHAIN) {
      return (
        chrome.i18n.getMessage('popup_html_shortcuts_action_change_chain') ||
        'Change chain'
      );
    }
    return chrome.i18n.getMessage('popup_html_shortcuts_action_navigate');
  };

  const getChainLabel = (shortcut: ShortcutDefinition) => {
    if (shortcut.target === LAST_USED_EVM_CHAIN_TARGET) {
      return 'Last used EVM chain';
    }
    const chainId = shortcut.params?.chainId ?? shortcut.target;
    const chain = setupChains.find((chain) => chain.chainId === chainId);
    if (chain) return chain.name;
    return shortcut.target;
  };

  const getShortcutDisplayParts = (shortcut: ShortcutDefinition) => {
    if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
      const accountTarget = ShortcutsUtils.parseShortcutAccountTarget(
        shortcut.target,
        shortcut.params?.accountType,
        shortcut.params?.accountId,
      );
      return {
        firstLine: getShortcutActionLabel(shortcut.actionType),
        secondLine:
          accountTarget.accountType === ShortcutAccountType.EVM
            ? FormatUtils.shortenString(accountTarget.accountId, 6)
            : `@${accountTarget.accountId}`,
      };
    }

    if (shortcut.actionType === ShortcutActionType.CHANGE_CHAIN) {
      return {
        firstLine: getShortcutActionLabel(shortcut.actionType),
        secondLine: getChainLabel(shortcut),
      };
    }

    const actionLabel = getShortcutActionLabel(shortcut.actionType);
    const screenLabel = ShortcutsUtils.formatScreenLabel(
      shortcut.target as HiveScreen | MultichainScreen | EvmScreen,
    );
    const extraLabel = getShortcutExtraLabel(shortcut);

    const parts: string[] = [actionLabel, screenLabel];
    if (extraLabel) {
      // Split extra label if it contains " · "
      if (extraLabel.includes(' · ')) {
        parts.push(...extraLabel.split(' · '));
      } else {
        parts.push(extraLabel);
      }
    }

    if (parts.length === 1) {
      return {
        firstLine: parts[0],
        secondLine: '',
      };
    }

    const lastPart = parts[parts.length - 1];
    const firstParts = parts.slice(0, -1);

    return {
      firstLine: firstParts.join(' · '),
      secondLine: lastPart,
    };
  };

  return (
    <div
      data-testid={`${MultichainScreen.SETTINGS_SHORTCUTS}-page`}
      className="shortcuts-page">
      <div className="shortcuts-header">
        <div className="shortcuts-intro">
          {chrome.i18n.getMessage('popup_html_shortcuts_intro')}
        </div>
        <ButtonComponent
          dataTestId="shortcuts-add-button"
          label="popup_html_shortcuts_add_button"
          logo={SVGIcons.GLOBAL_ADD_CIRCLE}
          type={ButtonType.ALTERNATIVE}
          height="small"
          additionalClass="shortcuts-add-button"
          onClick={startAddShortcut}
        />
      </div>

      <div className="shortcuts-list">
        {shortcuts.length === 0 && (
          <div className="shortcuts-empty">
            {chrome.i18n.getMessage('popup_html_shortcuts_no_shortcuts')}
          </div>
        )}
        {shortcuts.map((shortcut) => {
          const displayParts = getShortcutDisplayParts(shortcut);
          return (
            <div key={shortcut.id} className="shortcut-item">
              <div className="shortcut-details">
                <div className="shortcut-combo">{displayParts.firstLine}</div>
                {displayParts.secondLine && (
                  <div className="shortcut-meta">{displayParts.secondLine}</div>
                )}
              </div>
              <div className="shortcut-actions">
                <span className="shortcut-label">
                  {ShortcutsUtils.formatShortcutCombo(shortcut.combo)}
                </span>
                <div
                  className="shortcut-action-icon"
                  onClick={() => handleEdit(shortcut)}
                  title={chrome.i18n.getMessage(
                    'html_popup_button_edit_label',
                  )}>
                  <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_EDIT} />
                </div>
                <div
                  className="shortcut-action-icon"
                  onClick={() => handleDelete(shortcut.id)}
                  title={chrome.i18n.getMessage('delete_label')}>
                  <SVGIcon icon={SVGIcons.FAVORITE_ACCOUNTS_DELETE} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isFormVisible && (
        <div className="shortcut-form">
          <InputComponent
            dataTestId="shortcuts-combo-input"
            label="popup_html_shortcuts_key_combo"
            placeholder="popup_html_shortcuts_key_combo_placeholder"
            value={comboDisplay}
            onChange={() => undefined}
            type={InputType.TEXT}
            ref={keyInputRef}
            readOnly
          />
          <ComplexeCustomSelect
            label="popup_html_shortcuts_action"
            skipLabelTranslation={false}
            options={actionOptions}
            selectedItem={selectedActionOption}
            setSelectedItem={(option) =>
              setActionType(option.value as ShortcutActionType)
            }
          />
          <ComplexeCustomSelect
            label="popup_html_shortcuts_target"
            skipLabelTranslation={false}
            options={targetOptions}
            selectedItem={selectedTargetOption}
            setSelectedItem={(option) => setTarget(option.value)}
          />
          {requiresTransferChain && (
            <ComplexeCustomSelect
              label="Chain"
              skipLabelTranslation
              options={transferChainOptions}
              selectedItem={selectedTransferChainOption}
              setSelectedItem={(option) =>
                setSelectedTransferChainId(option.value)
              }
            />
          )}
          {requiresTransferChain && (
            <ComplexeCustomSelect
              label="popup_html_tokens"
              skipLabelTranslation={false}
              options={transferTokenOptions}
              selectedItem={selectedTransferTokenOption}
              setSelectedItem={(option) => {
                if (selectedTransferChain?.type === ChainType.EVM) {
                  setSelectedEvmTokenKey(option.value);
                } else {
                  setSelectedCurrency(option.value as 'hive' | 'hbd');
                }
              }}
            />
          )}
          {requiresCurrency && (
            <ComplexeCustomSelect
              label="popup_html_currency"
              skipLabelTranslation={false}
              options={currencyOptions}
              selectedItem={selectedCurrencyOption}
              setSelectedItem={(option) =>
                setSelectedCurrency(option.value as 'hive' | 'hbd')
              }
            />
          )}
          {requiresToken && (
            <ComplexeCustomSelect
              label="popup_html_tokens"
              skipLabelTranslation={false}
              options={tokenOptions}
              selectedItem={selectedTokenOption}
              setSelectedItem={(option) => setSelectedTokenSymbol(option.value)}
            />
          )}
          {requiresDelegationType && (
            <ComplexeCustomSelect
              label="popup_html_shortcuts_delegation_type"
              skipLabelTranslation={false}
              options={delegationOptions}
              selectedItem={selectedDelegationOption}
              setSelectedItem={(option) =>
                setSelectedDelegationType(option.value as DelegationType)
              }
            />
          )}
          <div className="shortcut-form-actions">
            <ButtonComponent
              dataTestId="shortcuts-save-button"
              label="popup_html_shortcuts_save_button"
              onClick={handleSave}
              disabled={!combo || !target}
            />
            <ButtonComponent
              dataTestId="shortcuts-cancel-button"
              label="popup_html_shortcuts_cancel_button"
              type={ButtonType.ALTERNATIVE}
              onClick={resetForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    evmAccounts: state.evm.accounts,
    mk: state.mk,
    userTokens: state.hive.userTokens,
    tokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ShortcutsComponent = connector(Shortcuts);

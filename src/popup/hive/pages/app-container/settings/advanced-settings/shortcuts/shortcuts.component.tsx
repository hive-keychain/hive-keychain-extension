import { ShortcutActionType, ShortcutDefinition, ShortcutParams } from '@interfaces/shortcut.interface';
import { Token, TokenBalance } from '@interfaces/tokens.interface';
import { setErrorMessage, setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, { ButtonType } from 'src/common-ui/button/button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { DelegationType } from 'src/popup/hive/pages/app-container/home/delegations/delegation-type.enum';
import { PowerType } from 'src/popup/hive/pages/app-container/home/power-up-down/power-type.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import ShortcutsUtils from 'src/utils/shortcuts.utils';



const Shortcuts = ({
  accounts,
  activeAccount,
  userTokens,
  tokens,
  loadActiveAccount,
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
  const [selectedDelegationType, setSelectedDelegationType] = useState<
    DelegationType
  >(DelegationType.OUTGOING);

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
    const storedShortcuts =
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.SHORTCUTS,
      )) || [];
    setShortcuts(Array.isArray(storedShortcuts) ? storedShortcuts : []);
  };

  const screenOptions = useMemo<OptionItem[]>(() => {
    const uniqueScreens = Array.from(new Set(ShortcutsUtils.NAVIGATION_SCREENS));
    return uniqueScreens.map((screen) => ({
      label: ShortcutsUtils.formatScreenLabel(screen),
      value: screen,
    }));
  }, []);

  const accountOptions = useMemo<OptionItem[]>(() => {
    if (!accounts || accounts.length === 0) {
      return [
        {
          label: chrome.i18n.getMessage('popup_html_shortcuts_no_accounts'),
          value: '',
        },
      ];
    }
    return accounts.map((account) => ({
      label: account.name,
      value: account.name,
    }));
  }, [accounts]);

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
    ];
  }, []);

  const targetOptions = useMemo<OptionItem[]>(() => {
    return actionType === ShortcutActionType.NAVIGATE
      ? screenOptions
      : accountOptions;
  }, [actionType, screenOptions, accountOptions]);

  const requiresCurrency = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      ShortcutsUtils.CURRENCY_REQUIRED_SCREENS.includes(target as Screen),
    [actionType, target],
  );

  const requiresToken = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      ShortcutsUtils.TOKEN_REQUIRED_SCREENS.includes(target as Screen),
    [actionType, target],
  );

  const requiresDelegationType = useMemo(
    () =>
      actionType === ShortcutActionType.NAVIGATE &&
      ShortcutsUtils.DELEGATION_REQUIRED_SCREENS.includes(target as Screen),
    [actionType, target],
  );

  useEffect(() => {
    const optionMatch = targetOptions.find((item) => item.value === target);
    if (!optionMatch) {
      setTarget(targetOptions[0]?.value ?? '');
    }
  }, [actionType, targetOptions]);

  // Sync activeAccount to target when in CHANGE_ACCOUNT mode
  useEffect(() => {
    if (
      actionType === ShortcutActionType.CHANGE_ACCOUNT &&
      isFormVisible &&
      activeAccount?.name &&
      activeAccount.name !== target
    ) {
      setTarget(activeAccount.name);
    }
  }, [actionType, activeAccount?.name, isFormVisible, target]);

  useEffect(() => {
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
    tokenOptions,
    selectedCurrency,
    selectedTokenSymbol,
    selectedDelegationType,
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

  const resetForm = useCallback(() => {
    setCombo('');
    setActionType(ShortcutActionType.NAVIGATE);
    setTarget('');
    setSelectedCurrency('hive');
    setSelectedTokenSymbol('');
    setSelectedDelegationType(DelegationType.OUTGOING);
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
    const normalizedCombo = ShortcutsUtils.normalizeShortcutCombo(combo);
    const isDuplicate = shortcuts.some(
      (shortcut) =>
        ShortcutsUtils.normalizeShortcutCombo(shortcut.combo) === normalizedCombo &&
        shortcut.id !== editingShortcutId,
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
    if (requiresCurrency) {
      params.selectedCurrency = selectedCurrency;
    }
    if (requiresToken) {
      params.tokenSymbol = selectedTokenSymbol;
    }
    if (requiresDelegationType) {
      params.delegationType = selectedDelegationType;
    }
    if (target === Screen.POWER_UP_PAGE) {
      params.powerType = PowerType.POWER_UP;
    } else if (target === Screen.POWER_DOWN_PAGE) {
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
      ? shortcuts.map((item) => (item.id === editingShortcutId ? shortcut : item))
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
    if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
      const account = accounts?.find(
        (item: LocalAccount) => item.name === shortcut.target,
      );
      if (account) {
        loadActiveAccount(account);
      }
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
    setFormVisible(true);
    setTimeout(() => keyInputRef.current?.focus(), 0);
  };

  const getShortcutExtraLabel = (shortcut: ShortcutDefinition) => {
    if (shortcut.target === Screen.POWER_UP_PAGE) {
      return chrome.i18n.getMessage('popup_html_pu');
    }
    if (shortcut.target === Screen.POWER_DOWN_PAGE) {
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
    return '';
  };

  const getShortcutDisplayParts = (shortcut: ShortcutDefinition) => {
    if (shortcut.actionType === ShortcutActionType.CHANGE_ACCOUNT) {
      return {
        firstLine: chrome.i18n.getMessage('popup_html_shortcuts_action_change_account'),
        secondLine: `@${shortcut.target}`,
      };
    }

    // For NAVIGATE actions
    const actionLabel = chrome.i18n.getMessage('popup_html_shortcuts_action_navigate');
    const screenLabel = ShortcutsUtils.formatScreenLabel(shortcut.target as Screen);
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
      data-testid={`${Screen.SETTINGS_SHORTCUTS}-page`}
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
                <div className="shortcut-combo">
                  {displayParts.firstLine}
                </div>
                {displayParts.secondLine && (
                  <div className="shortcut-meta">
                    {displayParts.secondLine}
                  </div>
                )}
              </div>
              <div className="shortcut-actions">
                <span className="shortcut-label">
                  {ShortcutsUtils.formatShortcutCombo(shortcut.combo)}
                </span>
                <div
                  className="shortcut-action-icon"
                  onClick={() => handleEdit(shortcut)}
                  title={chrome.i18n.getMessage('html_popup_button_edit_label')}>
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
          {actionType === ShortcutActionType.CHANGE_ACCOUNT ? (
            <div className="shortcuts-account-selector">
              <div className="label">
                {chrome.i18n.getMessage('popup_html_shortcuts_target')}
              </div>
              <SelectAccountSectionComponent fullSize background="white" />
            </div>
          ) : (
            <ComplexeCustomSelect
              label="popup_html_shortcuts_target"
              skipLabelTranslation={false}
              options={targetOptions}
              selectedItem={selectedTargetOption}
              setSelectedItem={(option) => setTarget(option.value)}
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
    activeAccount: state.hive.activeAccount,
    userTokens: state.hive.userTokens,
    tokens: state.hive.tokens,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
  loadActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ShortcutsComponent = connector(Shortcuts);

import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import CheckboxComponent from '@common-ui/checkbox/checkbox/checkbox.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { ChainListOrgUtils } from '@popup/evm/utils/chain-list-org.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';
export const normalizeEvmChainIdInput = (input: string): string => {
  const trimmed = input.trim();
  if (/^0x[0-9a-fA-F]+$/.test(trimmed)) {
    return '0x' + BigInt(trimmed).toString(16);
  }
  if (/^[0-9]+$/.test(trimmed)) {
    return '0x' + BigInt(trimmed).toString(16);
  }
  throw new Error('invalid_chain_id');
};

const isValidRpcUrl = (url: string) => {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const ADD_RPC_FALLBACK = 'Add another RPC URL';

const TX_TYPE_ORDER: EvmTransactionType[] = [
  EvmTransactionType.LEGACY,
  EvmTransactionType.EIP_155,
  EvmTransactionType.EIP_1559,
  EvmTransactionType.EIP_4844,
  EvmTransactionType.EIP_7702,
];

const TX_TYPE_LABEL_KEY: Record<EvmTransactionType, string> = {
  [EvmTransactionType.LEGACY]: 'evm_custom_chains_tx_type_legacy',
  [EvmTransactionType.EIP_155]: 'evm_custom_chains_tx_type_eip155',
  [EvmTransactionType.EIP_1559]: 'evm_custom_chains_tx_type_eip1559',
  [EvmTransactionType.EIP_4844]: 'evm_custom_chains_tx_type_eip4844',
  [EvmTransactionType.EIP_7702]: 'evm_custom_chains_tx_type_eip7702',
};

const getTxTypeOptionLabel = (t: EvmTransactionType): string => {
  const key = TX_TYPE_LABEL_KEY[t];
  if (!key) return String(t);
  const msg = I18nUtils.getMessage(key);
  return msg || key;
};

const parseTxType = (raw: string): EvmTransactionType => {
  const v = raw as EvmTransactionType;
  return TX_TYPE_ORDER.includes(v) ? v : EvmTransactionType.LEGACY;
};

const getRpcsFromUrls = (rpcUrls: string[]) =>
  rpcUrls.map((url, index) => ({
    url,
    isDefault: index === 0,
  }));

/** Same resolution path as AddChain dialog init (defaults → ChainList.org + RPC validation). */
const resolveChainForAddPrefill = async (
  chainId: string,
): Promise<EvmChain | undefined> => {
  const defaultChain =
    await ChainUtils.getChainFromDefaultChains<EvmChain>(chainId);
  if (defaultChain) {
    return defaultChain;
  }

  let chainListChain;
  try {
    chainListChain = await ChainListOrgUtils.findByChainId(
      Number(BigInt(chainId)),
    );
  } catch {
    chainListChain = undefined;
  }

  if (!chainListChain) {
    return undefined;
  }

  const chainListEvmChain = ChainListOrgUtils.getEvmChain(
    chainListChain,
    chainId,
  );
  const validRpcUrls = await EvmRpcUtils.filterValidRpcsForChainId(
    chainListEvmChain.rpcs.map((rpc) => rpc.url),
    chainId,
  );
  return {
    ...chainListEvmChain,
    rpcs: getRpcsFromUrls(validRpcUrls),
  };
};

export interface CustomEvmChainFormProps {
  onSubmit: (chain: EvmChain) => Promise<void> | void;
  onCancel: () => void;
  onResetToDefault?: () => Promise<void> | void;
  chainToEdit?: EvmChain;
  initialChain?: Partial<EvmChain>;
  isDefaultChain?: boolean;
  setErrorMessage?: (key: string) => void;
  submitLabel?: string;
}

export const CustomEvmChainForm = ({
  onSubmit,
  onCancel,
  onResetToDefault,
  chainToEdit,
  initialChain,
  isDefaultChain,
  setErrorMessage,
  submitLabel,
}: CustomEvmChainFormProps) => {
  const isEdit = !!chainToEdit;
  /** Locked when editing a saved chain or when the caller fixed the id (e.g. dapp add-chain request). */
  const isChainIdDisabled = isEdit || !!initialChain?.chainId?.trim();
  const addRpcAriaLabel =
    I18nUtils.getMessage('evm_custom_chains_add_rpc') || ADD_RPC_FALLBACK;
  const removeRpcAriaLabel =
    I18nUtils.getMessage('evm_custom_chains_remove_rpc') || 'Remove';

  const [name, setName] = useState('');
  const [chainIdInput, setChainIdInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const [rpcUrls, setRpcUrls] = useState<string[]>(['']);
  const [explorer, setExplorer] = useState('');
  const [logo, setLogo] = useState('');
  const [txType, setTxType] = useState<EvmTransactionType>(
    EvmTransactionType.LEGACY,
  );
  const [testnet, setTestnet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [localError, setLocalError] = useState<string>();
  /** Row indices that failed the pre-save chain id RPC check (red borders). */
  const [failedRpcRowIndices, setFailedRpcRowIndices] = useState<number[]>([]);
  const [logoPreviewErrored, setLogoPreviewErrored] = useState(false);
  const [chainPrefillLoading, setChainPrefillLoading] = useState(false);
  /** After auto-prefill from chain id lookup, we keep tx type hidden. */
  const [addChainListPreloaded, setAddChainListPreloaded] = useState(false);
  /** When preloaded with ≥1 RPC, start with the RPC block collapsed (user can expand). */
  const [rpcPanelCollapsed, setRpcPanelCollapsed] = useState(false);
  const chainIdInputRef = useRef(chainIdInput);
  chainIdInputRef.current = chainIdInput;
  const lastPrefilledChainIdRef = useRef<string | null>(null);

  const logoTrimmed = logo.trim();
  const logoPreviewSrc =
    logoTrimmed && isValidRpcUrl(logoTrimmed) ? logoTrimmed : undefined;

  useEffect(() => {
    setLogoPreviewErrored(false);
  }, [logo]);

  useEffect(() => {
    if (chainToEdit) {
      setName(chainToEdit.name);
      setChainIdInput(chainToEdit.chainId);
      setSymbol(chainToEdit.mainToken);
      setRpcUrls(
        chainToEdit.rpcs?.length ? chainToEdit.rpcs.map((r) => r.url) : [''],
      );
      setExplorer(chainToEdit.blockExplorer?.url ?? '');
      setLogo(chainToEdit.logo ?? '');
      setTxType(parseTxType(chainToEdit.defaultTransactionType ?? ''));
      setTestnet(!!chainToEdit.testnet);
      return;
    }

    setName(initialChain?.name ?? '');
    setChainIdInput(initialChain?.chainId ?? '');
    setSymbol(initialChain?.mainToken ?? '');
    setRpcUrls(
      initialChain?.rpcs?.length ? initialChain.rpcs.map((r) => r.url) : [''],
    );
    setExplorer(initialChain?.blockExplorer?.url ?? '');
    setLogo(initialChain?.logo ?? '');
    setTxType(parseTxType(initialChain?.defaultTransactionType ?? ''));
    setTestnet(!!initialChain?.testnet);
  }, [chainToEdit, initialChain]);

  const addTxTypeHidden = !isEdit && addChainListPreloaded;
  const addTxTypeChoiceOrder: EvmTransactionType[] = [
    EvmTransactionType.LEGACY,
    EvmTransactionType.EIP_1559,
  ];
  const txTypeOptions: OptionItem[] = (
    isEdit ? TX_TYPE_ORDER : addTxTypeChoiceOrder
  ).map((value) => ({
    value,
    label: getTxTypeOptionLabel(value),
    key: value,
  }));
  const txTypeForSelect = isEdit
    ? txType
    : addTxTypeChoiceOrder.includes(txType)
      ? txType
      : EvmTransactionType.LEGACY;

  useEffect(() => {
    if (isEdit || addTxTypeHidden) {
      return;
    }
    if (!addTxTypeChoiceOrder.includes(txType)) {
      setTxType(EvmTransactionType.LEGACY);
    }
  }, [isEdit, addTxTypeHidden, txType]);

  const reportError = (key: string) => {
    if (setErrorMessage) {
      setErrorMessage(key);
    } else {
      setLocalError(key);
    }
  };

  const clearError = () => {
    setLocalError(undefined);
    setFailedRpcRowIndices([]);
  };

  const applyResolvedChainToForm = (chain: EvmChain) => {
    setName(chain.name);
    setChainIdInput(chain.chainId);
    setSymbol(chain.mainToken);
    setRpcUrls(
      chain.rpcs?.length ? chain.rpcs.map((r) => r.url) : [''],
    );
    setExplorer(chain.blockExplorer?.url ?? '');
    setLogo(chain.logo ?? '');
    setTxType(parseTxType(chain.defaultTransactionType ?? ''));
    setTestnet(!!chain.testnet);
    setAddChainListPreloaded(true);
    const preloadedRpcCount = (chain.rpcs ?? []).filter((r) =>
      r.url.trim(),
    ).length;
    if (preloadedRpcCount > 0) {
      setRpcPanelCollapsed(true);
    }
  };

  const handleChainIdBlur = async () => {
    if (isEdit || isChainIdDisabled) {
      return;
    }

    let normalizedChainId: string;
    try {
      normalizedChainId = normalizeEvmChainIdInput(chainIdInput);
    } catch {
      return;
    }

    if (lastPrefilledChainIdRef.current === normalizedChainId) {
      return;
    }

    clearError();
    setChainPrefillLoading(true);
    try {
      const chain = await resolveChainForAddPrefill(normalizedChainId);
      if (!chain) {
        return;
      }

      let currentNormalizedChainId: string;
      try {
        currentNormalizedChainId = normalizeEvmChainIdInput(
          chainIdInputRef.current,
        );
      } catch {
        return;
      }
      if (currentNormalizedChainId !== normalizedChainId) {
        return;
      }

      applyResolvedChainToForm(chain);
      lastPrefilledChainIdRef.current = normalizedChainId;
    } finally {
      setChainPrefillLoading(false);
    }
  };

  const setRpcAt = (index: number, value: string) => {
    clearError();
    setRpcUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addRpcRow = () => {
    clearError();
    setRpcUrls((prev) => [...prev, '']);
  };

  const removeRpcRow = (index: number) => {
    clearError();
    setRpcUrls((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const submit = async () => {
    clearError();
    if (!name.trim()) {
      reportError('evm_custom_chains_error_name');
      return;
    }
    if (!symbol.trim()) {
      reportError('evm_custom_chains_error_symbol');
      return;
    }

    const cleanedRpcs = rpcUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanedRpcs.length === 0) {
      reportError('evm_custom_chains_error_rpc');
      return;
    }
    const seen = new Set<string>();
    for (const url of cleanedRpcs) {
      if (!isValidRpcUrl(url)) {
        reportError('evm_custom_chains_error_rpc');
        return;
      }
      const key = url.toLowerCase();
      if (seen.has(key)) {
        reportError('evm_custom_chains_error_rpc_duplicate');
        return;
      }
      seen.add(key);
    }

    let chainId: string;
    try {
      chainId = normalizeEvmChainIdInput(chainIdInput);
    } catch {
      reportError('evm_custom_chains_error_chain_id');
      return;
    }

    setSaving(true);
    try {
      const rpcCheckRows = rpcUrls
        .map((u, index) => ({ index, url: u.trim() }))
        .filter(({ url }) => url.length > 0);

      const rpcCheckResults = await Promise.all(
        rpcCheckRows.map(({ index, url }) =>
          EvmRpcUtils.isValidRpcForChainId(url, chainId).then((ok) => ({
            index,
            ok,
          })),
        ),
      );

      const failedIndices = rpcCheckResults
        .filter((r) => !r.ok)
        .map((r) => r.index);
      if (failedIndices.length > 0) {
        setFailedRpcRowIndices(failedIndices);
        setRpcPanelCollapsed(false);
        reportError('evm_custom_chains_error_rpc_unreachable');
        return;
      }

      const chain: EvmChain = {
        ...(chainToEdit ?? {}),
        type: ChainType.EVM,
        isCustom: !isDefaultChain,
        active: chainToEdit?.active ?? true,
        name: name.trim(),
        chainId,
        mainToken: symbol.trim(),
        logo: logo.trim(),
        testnet,
        rpcs: cleanedRpcs.map((url, i) => ({
          url,
          isDefault: i === 0,
        })),
        defaultTransactionType: txType,
      };

      if (explorer.trim()) {
        chain.blockExplorer = { url: explorer.trim() };
      } else {
        delete chain.blockExplorer;
      }

      if (!isDefaultChain) {
        chain.disableTokensAndHistoryAutoLoading = true;
        chain.addTokensManually = true;
        chain.manualDiscoverAvailable = false;
      }

      await onSubmit(chain);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'duplicate_custom_chain') {
        reportError('evm_custom_chains_error_duplicate');
      } else if (msg === 'chain_exists_in_defaults') {
        reportError('evm_custom_chains_error_default_exists');
      } else if (msg === 'custom_chain_not_found') {
        reportError('evm_custom_chains_error_not_found');
      } else {
        reportError('evm_custom_chains_error_generic');
      }
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!onResetToDefault) return;
    clearError();
    setResetting(true);
    try {
      await onResetToDefault();
    } catch {
      reportError('evm_custom_chains_error_generic');
    } finally {
      setResetting(false);
    }
  };

  const rpcFilledCount = rpcUrls.filter((u) => u.trim()).length;
  const rpcPanelCollapsible = addChainListPreloaded && rpcFilledCount > 0;
  const showRpcInputs = !rpcPanelCollapsible || !rpcPanelCollapsed;

  return (
    <div className="add-custom-evm-chain-form">
      {localError && (
        <div className="add-custom-evm-chain-form__error">
          {I18nUtils.getMessage(localError)}
        </div>
      )}
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_chain_id"
        value={chainIdInput}
        onChange={(v) => {
          clearError();
          setChainIdInput(v);
        }}
        onBlur={() => {
          void handleChainIdBlur();
        }}
        disabled={isChainIdDisabled}
        dataTestId="custom-evm-chain-id"
      />
      {chainPrefillLoading && (
        <div
          className="add-custom-evm-chain-form__chainlist-hint"
          data-testid="custom-evm-chain-prefill-loading">
          <span className="add-custom-evm-chain-form__chainlist-hint-spinner" />
        </div>
      )}
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_name"
        value={name}
        onChange={(v) => {
          clearError();
          setName(v);
        }}
        dataTestId="custom-evm-chain-name"
      />
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_symbol"
        value={symbol}
        onChange={(v) => {
          clearError();
          setSymbol(v);
        }}
        dataTestId="custom-evm-chain-symbol"
      />
      <div className="add-custom-evm-chain-form__logo-row">
        <div className="add-custom-evm-chain-form__logo-input-wrap">
          <InputComponent
            type={InputType.TEXT}
            label="evm_custom_chains_field_logo"
            value={logo}
            onChange={(v) => {
              clearError();
              setLogo(v);
            }}
            dataTestId="custom-evm-chain-logo"
          />
        </div>
        {logoPreviewSrc && !logoPreviewErrored && (
          <img
            className="add-custom-evm-chain-form__logo-preview"
            src={logoPreviewSrc}
            alt=""
            onError={() => setLogoPreviewErrored(true)}
            data-testid="custom-evm-chain-logo-preview"
          />
        )}
      </div>
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_explorer"
        value={explorer}
        onChange={(v) => {
          clearError();
          setExplorer(v);
        }}
        dataTestId="custom-evm-chain-explorer"
      />
      <div
        className={
          'add-custom-evm-chain-form__rpc-block' +
          (rpcPanelCollapsible
            ? ' add-custom-evm-chain-form__rpc-block--collapsible'
            : '')
        }>
        <div className="add-custom-evm-chain-form__rpc-header">
          {rpcPanelCollapsible ? (
            <button
              type="button"
              className="add-custom-evm-chain-form__rpc-header-toggle"
              onClick={() => setRpcPanelCollapsed((c) => !c)}
              aria-expanded={!rpcPanelCollapsed}
              data-testid="custom-evm-chain-rpc-toggle">
              <span className="add-custom-evm-chain-form__rpc-label">
                {I18nUtils.getMessage('evm_custom_chains_field_rpc')}
              </span>
              <span className="add-custom-evm-chain-form__rpc-header-right">
                {rpcPanelCollapsed && (
                  <span className="add-custom-evm-chain-form__rpc-collapsed-hint">
                    {I18nUtils.getMessage(
                      'evm_custom_chains_rpc_collapsed_summary',
                      [String(rpcFilledCount)],
                    )}
                  </span>
                )}
                <SVGIcon
                  className="add-custom-evm-chain-form__rpc-toggle-chevron"
                  icon={
                    rpcPanelCollapsed
                      ? SVGIcons.SELECT_ARROW_DOWN
                      : SVGIcons.SELECT_ARROW_UP
                  }
                />
              </span>
            </button>
          ) : (
            <div className="add-custom-evm-chain-form__rpc-label">
              {I18nUtils.getMessage('evm_custom_chains_field_rpc')}
            </div>
          )}
        </div>
        {showRpcInputs &&
          rpcUrls.map((rpcUrl, index) => (
            <div key={index} className="add-custom-evm-chain-form__rpc-row">
              <InputComponent
                type={InputType.TEXT}
                placeholder="evm_custom_chains_field_rpc_placeholder"
                value={rpcUrl}
                onChange={(v) => setRpcAt(index, v)}
                dataTestId={`custom-evm-chain-rpc-${index}`}
                classname={
                  failedRpcRowIndices.includes(index)
                    ? 'add-custom-evm-chain-form__rpc-input--invalid'
                    : undefined
                }
              />
              {index === 0 && (
                <button
                  type="button"
                  className="add-custom-evm-chain-form__rpc-add-icon"
                  onClick={addRpcRow}
                  disabled={saving}
                  aria-label={addRpcAriaLabel}
                  title={addRpcAriaLabel}
                  data-testid="add-custom-chain-rpc-row">
                  <SVGIcon icon={SVGIcons.GLOBAL_ADD_CIRCLE} />
                </button>
              )}
              {index > 0 && (
                <button
                  type="button"
                  className="add-custom-evm-chain-form__rpc-remove-icon"
                  onClick={() => removeRpcRow(index)}
                  disabled={saving}
                  aria-label={removeRpcAriaLabel}
                  title={removeRpcAriaLabel}
                  data-testid={`remove-custom-chain-rpc-row-${index}`}>
                  <SVGIcon icon={SVGIcons.EVM_ACCOUNT_DELETE} />
                </button>
              )}
            </div>
          ))}
      </div>
      {!isDefaultChain && (
        <CheckboxComponent
          title="evm_custom_chains_field_testnet"
          checked={testnet}
          onChange={(v) => {
            clearError();
            setTestnet(v);
          }}
          dataTestId="custom-evm-chain-testnet"
        />
      )}
      {!isDefaultChain && (isEdit || !addTxTypeHidden) && (
        <ComplexeCustomSelect
          label="evm_custom_chains_field_default_tx_type"
          options={txTypeOptions}
          selectedItem={{
            label: getTxTypeOptionLabel(txTypeForSelect),
            value: txTypeForSelect,
            key: txTypeForSelect,
          }}
          setSelectedItem={(item) => {
            clearError();
            setTxType(item.value as EvmTransactionType);
          }}
          background="white"
        />
      )}
      <div className="add-custom-evm-chain-form__actions">
        {isDefaultChain && chainToEdit?.isDefaultOverride && (
          <ButtonComponent
            label="evm_custom_chains_reset_default"
            type={ButtonType.ALTERNATIVE}
            onClick={() => resetToDefault()}
            disabled={saving || resetting}
            dataTestId="custom-evm-chain-reset-default"
            additionalClass="add-custom-evm-chain-form__reset-default-button"
          />
        )}
        {!isDefaultChain && (
          <ButtonComponent
            label="popup_html_button_label_cancel"
            type={ButtonType.ALTERNATIVE}
            onClick={onCancel}
            disabled={saving || resetting}
          />
        )}
        <ButtonComponent
          label={
            submitLabel ??
            (isEdit ? 'evm_custom_chains_update' : 'evm_custom_chains_save')
          }
          onClick={() => submit()}
          disabled={saving || resetting}
          dataTestId="custom-evm-chain-submit"
        />
      </div>
    </div>
  );
};

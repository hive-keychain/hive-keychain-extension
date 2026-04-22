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
import { ChainListOrgChain } from '@popup/evm/interfaces/chain-list-org.interface';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { ChainListOrgUtils } from '@popup/evm/utils/chain-list-org.utils';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

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
  const msg = chrome.i18n.getMessage(key);
  return msg || key;
};

const parseTxType = (raw: string): EvmTransactionType => {
  const v = raw as EvmTransactionType;
  return TX_TYPE_ORDER.includes(v) ? v : EvmTransactionType.LEGACY;
};

const CHAIN_ID_LOOKUP_DEBOUNCE_MS = 400;

/** From ChainList.org `features` — if EIP-1559 is listed, prefer EIP-1559; else legacy. */
const inferTxTypeFromChainListFeatures = (
  chain: ChainListOrgChain,
): EvmTransactionType => {
  for (const f of chain.features ?? []) {
    const n = (f.name ?? '').toLowerCase().replace(/[\s_]/g, '-');
    if (n.includes('eip-1559') || n.replace(/-/g, '') === 'eip1559') {
      return EvmTransactionType.EIP_1559;
    }
    if (n.includes('eip') && n.includes('1559')) {
      return EvmTransactionType.EIP_1559;
    }
  }
  return EvmTransactionType.LEGACY;
};

const applyChainListOrgToFormState = async (chain: ChainListOrgChain) => {
  const httpCandidateUrls = chain.rpc
    .filter((rpc) => !rpc.url.startsWith('wss://'))
    .map((rpc) => rpc.url);

  const statusByUrl = await Promise.all(
    httpCandidateUrls.map((url) =>
      EvmRpcUtils.checkRpcStatus(url).then((ok) => {
        console.log({ url, ok });
        return { url, ok };
      }),
    ),
  );

  const httpRpcs = statusByUrl.filter((r) => r.ok).map((r) => r.url);
  console.log({ httpRpcs });
  console.log({ statusByUrl });

  return {
    name: chain.name,
    chainIdInput: '0x' + BigInt(chain.chainId).toString(16),
    symbol: chain.nativeCurrency.symbol.toUpperCase(),
    rpcUrls: httpRpcs.length > 0 ? httpRpcs : [''],
    explorer: chain.explorers?.[0]?.url?.trim() ?? '',
    logo: chain.icon
      ? `https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg`
      : '',
    testnet: !!chain.isTestnet,
  };
};

export interface CustomEvmChainFormProps {
  onSubmit: (chain: EvmChain) => Promise<void> | void;
  onCancel: () => void;
  chainToEdit?: EvmChain;
  initialChain?: Partial<EvmChain>;
  setErrorMessage?: (key: string) => void;
  submitLabel?: string;
}

export const CustomEvmChainForm = ({
  onSubmit,
  onCancel,
  chainToEdit,
  initialChain,
  setErrorMessage,
  submitLabel,
}: CustomEvmChainFormProps) => {
  const isEdit = !!chainToEdit;
  const addRpcAriaLabel =
    chrome.i18n.getMessage('evm_custom_chains_add_rpc') || ADD_RPC_FALLBACK;
  const removeRpcAriaLabel =
    chrome.i18n.getMessage('evm_custom_chains_remove_rpc') || 'Remove';

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
  const [localError, setLocalError] = useState<string>();
  /** Row indices that failed the pre-save `checkRpcStatus` (red borders). */
  const [failedRpcRowIndices, setFailedRpcRowIndices] = useState<number[]>([]);
  const [logoPreviewErrored, setLogoPreviewErrored] = useState(false);
  const [chainListMatch, setChainListMatch] =
    useState<ChainListOrgChain | null>(null);
  /** ChainList.org fetch in progress (after debounce). */
  const [chainListLookupLoading, setChainListLookupLoading] = useState(false);
  /** Preload click: parallel RPC checks in `applyChainListOrgToFormState`. */
  const [chainListPreloadLoading, setChainListPreloadLoading] = useState(false);
  /** After user preloads from ChainList, we keep tx hidden like when a match is present. */
  const [addChainListPreloaded, setAddChainListPreloaded] = useState(false);
  /** When preloaded with ≥1 RPC, start with the RPC block collapsed (user can expand). */
  const [rpcPanelCollapsed, setRpcPanelCollapsed] = useState(false);
  const chainIdInputRef = useRef(chainIdInput);
  chainIdInputRef.current = chainIdInput;

  const logoTrimmed = logo.trim();
  const logoPreviewSrc =
    logoTrimmed && isValidRpcUrl(logoTrimmed) ? logoTrimmed : undefined;

  useEffect(() => {
    setLogoPreviewErrored(false);
  }, [logo]);

  useEffect(() => {
    if (isEdit) {
      setChainListMatch(null);
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      return;
    }
    setChainListMatch(null);
    setAddChainListPreloaded(false);
    setRpcPanelCollapsed(false);
    setChainListLookupLoading(false);
    const trimmed = chainIdInput.trim();
    if (!trimmed) {
      return;
    }
    let requestedChainId: number;
    try {
      requestedChainId = Number(BigInt(normalizeEvmChainIdInput(chainIdInput)));
    } catch {
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        if (cancelled) {
          return;
        }
        setChainListLookupLoading(true);
        try {
          const found = await ChainListOrgUtils.findByChainId(requestedChainId);
          if (cancelled) {
            return;
          }
          let currentId: number;
          try {
            currentId = Number(
              BigInt(normalizeEvmChainIdInput(chainIdInputRef.current)),
            );
          } catch {
            return;
          }
          if (currentId !== requestedChainId) {
            return;
          }
          if (found) {
            setTxType(inferTxTypeFromChainListFeatures(found));
            setChainListMatch(found);
          } else {
            setChainListMatch(null);
            setTxType(EvmTransactionType.LEGACY);
          }
        } catch {
          if (!cancelled) {
            setChainListMatch(null);
            setTxType(EvmTransactionType.LEGACY);
          }
        } finally {
          if (!cancelled) {
            setChainListLookupLoading(false);
          }
        }
      })();
    }, CHAIN_ID_LOOKUP_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
      setChainListLookupLoading(false);
    };
  }, [chainIdInput, isEdit]);

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

  const addTxTypeHidden =
    !isEdit && (!!chainListMatch || addChainListPreloaded);
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

  const applyChainListPreload = async () => {
    if (!chainListMatch) {
      return;
    }
    clearError();
    setChainListPreloadLoading(true);
    try {
      const v = await applyChainListOrgToFormState(chainListMatch);
      console.log({ v });
      setName(v.name);
      setChainIdInput(v.chainIdInput);
      setSymbol(v.symbol);
      setRpcUrls(v.rpcUrls);
      setExplorer(v.explorer);
      setLogo(v.logo);
      setTestnet(v.testnet);
      setTxType(inferTxTypeFromChainListFeatures(chainListMatch));
      setAddChainListPreloaded(true);
      const preloadedRpcCount = v.rpcUrls.filter((u) => u.trim()).length;
      if (preloadedRpcCount > 0) {
        setRpcPanelCollapsed(true);
      }
      setChainListMatch(null);
    } finally {
      setChainListPreloadLoading(false);
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
          EvmRpcUtils.checkRpcStatus(url).then((ok) => ({ index, ok })),
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
        type: ChainType.EVM,
        isCustom: true,
        active: true,
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
        disableTokensAndHistoryAutoLoading: true,
        addTokensManually: true,
        manualDiscoverAvailable: false,
      };

      if (explorer.trim()) {
        chain.blockExplorer = { url: explorer.trim() };
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

  const rpcFilledCount = rpcUrls.filter((u) => u.trim()).length;
  const rpcPanelCollapsible = addChainListPreloaded && rpcFilledCount > 0;
  const showRpcInputs = !rpcPanelCollapsible || !rpcPanelCollapsed;

  return (
    <div className="add-custom-evm-chain-form">
      {localError && (
        <div className="add-custom-evm-chain-form__error">
          {chrome.i18n.getMessage(localError)}
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
        dataTestId="custom-evm-chain-id"
      />
      {!isEdit && (chainListLookupLoading || chainListMatch) && (
        <div
          className="add-custom-evm-chain-form__chainlist-hint"
          aria-busy={chainListLookupLoading || chainListPreloadLoading}>
          <div className="add-custom-evm-chain-form__chainlist-hint-main">
            {chainListMatch ? (
              <>
                <span className="add-custom-evm-chain-form__chainlist-hint-text">
                  {chrome.i18n.getMessage('evm_custom_chains_chainlist_found')}
                </span>{' '}
                <button
                  type="button"
                  className="add-custom-evm-chain-form__chainlist-preload"
                  onClick={applyChainListPreload}
                  disabled={saving || chainListPreloadLoading}
                  data-testid="custom-evm-chain-chainlist-preload">
                  {chrome.i18n.getMessage(
                    'evm_custom_chains_chainlist_preload_link',
                  )}
                </button>
              </>
            ) : (
              <span className="add-custom-evm-chain-form__chainlist-hint-text">
                {chrome.i18n.getMessage(
                  'evm_custom_chains_chainlist_looking_up',
                )}
              </span>
            )}
          </div>
          {(chainListLookupLoading || chainListPreloadLoading) && (
            <div
              className="add-custom-evm-chain-form__chainlist-hint-spinner"
              aria-hidden={true}
              data-testid="custom-evm-chain-chainlist-hint-spinner"
            />
          )}
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
                {chrome.i18n.getMessage('evm_custom_chains_field_rpc')}
              </span>
              <span className="add-custom-evm-chain-form__rpc-header-right">
                {rpcPanelCollapsed && (
                  <span className="add-custom-evm-chain-form__rpc-collapsed-hint">
                    {chrome.i18n.getMessage(
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
              {chrome.i18n.getMessage('evm_custom_chains_field_rpc')}
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
      <CheckboxComponent
        title="evm_custom_chains_field_testnet"
        checked={testnet}
        onChange={(v) => {
          clearError();
          setTestnet(v);
        }}
        dataTestId="custom-evm-chain-testnet"
      />
      {(isEdit || !addTxTypeHidden) && (
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
        <ButtonComponent
          label="popup_html_button_label_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={onCancel}
          disabled={saving}
        />
        <ButtonComponent
          label={
            submitLabel ??
            (isEdit ? 'evm_custom_chains_update' : 'evm_custom_chains_save')
          }
          onClick={() => submit()}
          disabled={saving}
          dataTestId="custom-evm-chain-submit"
        />
      </div>
    </div>
  );
};

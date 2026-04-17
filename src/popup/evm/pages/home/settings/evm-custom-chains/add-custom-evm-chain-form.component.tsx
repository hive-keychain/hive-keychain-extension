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
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { ChainType, EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
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

interface OwnProps {
  onSuccess: () => void;
  onCancel: () => void;
  /** When set, form loads this chain and saves with `updateCustomChain(originalChainId, chain)`. */
  chainToEdit?: EvmChain;
}

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
  return TX_TYPE_ORDER.includes(v) ? v : EvmTransactionType.EIP_1559;
};

const AddCustomEvmChainFormInner = ({
  onSuccess,
  onCancel,
  chainToEdit,
  setErrorMessage,
}: OwnProps & PropsFromRedux) => {
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
    EvmTransactionType.EIP_1559,
  );
  const [testnet, setTestnet] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!chainToEdit) {
      return;
    }
    setName(chainToEdit.name);
    setChainIdInput(chainToEdit.chainId);
    setSymbol(chainToEdit.mainToken);
    setRpcUrls(
      chainToEdit.rpcs?.length
        ? chainToEdit.rpcs.map((r) => r.url)
        : [''],
    );
    setExplorer(chainToEdit.blockExplorer?.url ?? '');
    setLogo(chainToEdit.logo ?? '');
    setTxType(
      parseTxType(chainToEdit.defaultTransactionType ?? ''),
    );
    setTestnet(!!chainToEdit.testnet);
  }, [chainToEdit]);

  const txTypeOptions: OptionItem[] = TX_TYPE_ORDER.map((value) => ({
    value,
    label: getTxTypeOptionLabel(value),
    key: value,
  }));

  const setRpcAt = (index: number, value: string) => {
    setRpcUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addRpcRow = () => setRpcUrls((prev) => [...prev, '']);

  const removeRpcRow = (index: number) => {
    setRpcUrls((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const submit = async () => {
    if (!name.trim()) {
      setErrorMessage('evm_custom_chains_error_name');
      return;
    }
    if (!symbol.trim()) {
      setErrorMessage('evm_custom_chains_error_symbol');
      return;
    }

    const cleanedRpcs = rpcUrls.map((u) => u.trim()).filter(Boolean);
    if (cleanedRpcs.length === 0) {
      setErrorMessage('evm_custom_chains_error_rpc');
      return;
    }
    const seen = new Set<string>();
    for (const url of cleanedRpcs) {
      if (!isValidRpcUrl(url)) {
        setErrorMessage('evm_custom_chains_error_rpc');
        return;
      }
      const key = url.toLowerCase();
      if (seen.has(key)) {
        setErrorMessage('evm_custom_chains_error_rpc_duplicate');
        return;
      }
      seen.add(key);
    }

    let chainId: string;
    try {
      chainId = normalizeEvmChainIdInput(chainIdInput);
    } catch {
      setErrorMessage('evm_custom_chains_error_chain_id');
      return;
    }

    const chain: EvmChain = {
      type: ChainType.EVM,
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

    setSaving(true);
    try {
      if (isEdit && chainToEdit) {
        await ChainUtils.updateCustomChain(chainToEdit.chainId, chain);
      } else {
        await ChainUtils.addCustomChain(chain);
      }
      await EvmRpcUtils.setActiveRpc(
        { url: cleanedRpcs[0], isDefault: false },
        chain,
      );
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'duplicate_custom_chain') {
        setErrorMessage('evm_custom_chains_error_duplicate');
      } else if (msg === 'chain_exists_in_defaults') {
        setErrorMessage('evm_custom_chains_error_default_exists');
      } else if (msg === 'custom_chain_not_found') {
        setErrorMessage('evm_custom_chains_error_not_found');
      } else {
        setErrorMessage('evm_custom_chains_error_generic');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-custom-evm-chain-form">
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_name"
        value={name}
        onChange={(v) => setName(v)}
      />
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_chain_id"
        value={chainIdInput}
        onChange={(v) => setChainIdInput(v)}
      />
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_symbol"
        value={symbol}
        onChange={(v) => setSymbol(v)}
      />
      <ComplexeCustomSelect
        label="evm_custom_chains_field_default_tx_type"
        options={txTypeOptions}
        selectedItem={{
          label: getTxTypeOptionLabel(txType),
          value: txType,
          key: txType,
        }}
        setSelectedItem={(item) => setTxType(item.value as EvmTransactionType)}
        background="white"
      />
      <div className="add-custom-evm-chain-form__rpc-block">
        <div className="add-custom-evm-chain-form__rpc-label">
          {chrome.i18n.getMessage('evm_custom_chains_field_rpc')}
        </div>
        {rpcUrls.map((rpcUrl, index) => (
          <div
            key={index}
            className="add-custom-evm-chain-form__rpc-row">
            <InputComponent
              type={InputType.TEXT}
              placeholder="evm_custom_chains_field_rpc_placeholder"
              value={rpcUrl}
              onChange={(v) => setRpcAt(index, v)}
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
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_explorer"
        value={explorer}
        onChange={(v) => setExplorer(v)}
      />
      <InputComponent
        type={InputType.TEXT}
        label="evm_custom_chains_field_logo"
        value={logo}
        onChange={(v) => setLogo(v)}
      />
      <CheckboxComponent
        title="evm_custom_chains_field_testnet"
        checked={testnet}
        onChange={(v) => setTestnet(v)}
      />
      <div className="add-custom-evm-chain-form__actions">
        <ButtonComponent
          label="popup_html_button_label_cancel"
          type={ButtonType.ALTERNATIVE}
          onClick={onCancel}
          disabled={saving}
        />
        <ButtonComponent
          label={
            isEdit ? 'evm_custom_chains_update' : 'evm_custom_chains_save'
          }
          onClick={() => submit()}
          disabled={saving}
        />
      </div>
    </div>
  );
};

const connector = connect(null, { setErrorMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddCustomEvmChainForm = connector(AddCustomEvmChainFormInner);

import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { EvmCustomToken } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type EvmCustomAssetMode = 'erc20' | 'nft';

export interface EvmCustomErc20FormData {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
}

interface Props {
  chain: EvmChain;
  mode: EvmCustomAssetMode;
  walletAddress?: string;
  existingAddresses?: string[];
  onClose: () => void;
  onSave?: (form: EvmCustomErc20FormData) => Promise<void> | void;
}

interface Erc20FormState {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
}

interface Erc20FormErrors {
  contractAddress?: string;
  name?: string;
  symbol?: string;
  decimals?: string;
  save?: string;
}

const normalizeAddress = (address: string) => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress.length) {
    return '';
  }
  return ethers.isAddress(trimmedAddress)
    ? ethers.getAddress(trimmedAddress)
    : trimmedAddress;
};

const INITIAL_ERC20_FORM: Erc20FormState = {
  contractAddress: '',
  name: '',
  symbol: '',
  decimals: '',
  logo: '',
};

export const EvmAddCustomAssetPopup = ({
  chain,
  mode,
  walletAddress,
  existingAddresses = [],
  onClose,
  onSave,
}: Props) => {
  const [erc20Form, setErc20Form] = useState<Erc20FormState>(
    INITIAL_ERC20_FORM,
  );
  const [erc20Errors, setErc20Errors] = useState<Erc20FormErrors>({});
  const [savedCustomTokens, setSavedCustomTokens] = useState<EvmCustomToken[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'erc20' || !walletAddress) {
      setSavedCustomTokens([]);
      return;
    }

    let mounted = true;

    const loadCustomTokens = async () => {
      const customTokens = await EvmTokensUtils.getCustomTokens(
        chain,
        walletAddress,
      );
      if (mounted) {
        setSavedCustomTokens(customTokens);
      }
    };

    void loadCustomTokens();

    return () => {
      mounted = false;
    };
  }, [chain, mode, walletAddress]);

  const normalizedExistingAddresses = useMemo(() => {
    return new Set(
      [...existingAddresses, ...savedCustomTokens.map((token) => token.address)]
        .map(normalizeAddress)
        .filter(Boolean)
        .map((address) => address.toLowerCase()),
    );
  }, [existingAddresses, savedCustomTokens]);

  const setErc20Field = (field: keyof Erc20FormState, value: string) => {
    setErc20Form((current) => ({
      ...current,
      [field]: value,
    }));

    setErc20Errors((current) => ({
      ...current,
      [field]: undefined,
      save: undefined,
    }));
  };

  const validateErc20Form = () => {
    const errors: Erc20FormErrors = {};

    const normalizedAddress = normalizeAddress(erc20Form.contractAddress);

    if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
      errors.contractAddress = 'Enter a valid contract address.';
    } else if (
      normalizedExistingAddresses.has(normalizedAddress.toLowerCase())
    ) {
      errors.contractAddress = 'This contract address is already added.';
    }

    if (!erc20Form.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!erc20Form.symbol.trim()) {
      errors.symbol = 'Symbol is required.';
    }

    if (!erc20Form.decimals.trim()) {
      errors.decimals = 'Decimals are required.';
    } else if (!/^\d+$/.test(erc20Form.decimals.trim())) {
      errors.decimals = 'Decimals must be a whole number.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      normalizedAddress,
    };
  };

  const handleSaveErc20 = async () => {
    if (!onSave) {
      return;
    }

    const { errors, isValid, normalizedAddress } = validateErc20Form();
    if (!isValid) {
      setErc20Errors(errors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        contractAddress: normalizedAddress,
        name: erc20Form.name.trim(),
        symbol: erc20Form.symbol.trim(),
        decimals: Number(erc20Form.decimals.trim()),
        logo: erc20Form.logo.trim(),
      });
    } catch (error) {
      if (isMountedRef.current) {
        setErc20Errors((current) => ({
          ...current,
          save: 'Unable to save this token right now.',
        }));
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const renderErc20Form = () => (
    <>
      <div className="popup-title">Add Custom Token</div>
      <div className="popup-caption">
        Enter the ERC20 contract details manually for {chain.name}.
      </div>

      <div className="custom-asset-form">
        <div className="field">
          <InputComponent
            label="Contract address"
            skipLabelTranslation
            value={erc20Form.contractAddress}
            type={InputType.TEXT}
            onChange={(value) => setErc20Field('contractAddress', value)}
            dataTestId="custom-asset-contract-address"
            classname="custom-asset-input"
          />
          {erc20Errors.contractAddress && (
            <div className="error-message">{erc20Errors.contractAddress}</div>
          )}
        </div>

        <div className="field">
          <InputComponent
            label="Name"
            skipLabelTranslation
            value={erc20Form.name}
            type={InputType.TEXT}
            onChange={(value) => setErc20Field('name', value)}
            dataTestId="custom-asset-name"
            classname="custom-asset-input"
          />
          {erc20Errors.name && (
            <div className="error-message">{erc20Errors.name}</div>
          )}
        </div>

        <div className="field">
          <InputComponent
            label="Symbol"
            skipLabelTranslation
            value={erc20Form.symbol}
            type={InputType.TEXT}
            onChange={(value) => setErc20Field('symbol', value)}
            dataTestId="custom-asset-symbol"
            classname="custom-asset-input"
          />
          {erc20Errors.symbol && (
            <div className="error-message">{erc20Errors.symbol}</div>
          )}
        </div>

        <div className="field">
          <InputComponent
            label="Decimals"
            skipLabelTranslation
            value={erc20Form.decimals}
            type={InputType.NUMBER}
            min={0}
            step={1}
            onChange={(value) => setErc20Field('decimals', value)}
            dataTestId="custom-asset-decimals"
            classname="custom-asset-input"
          />
          {erc20Errors.decimals && (
            <div className="error-message">{erc20Errors.decimals}</div>
          )}
        </div>

        <div className="field">
          <InputComponent
            label="Logo URL (optional)"
            skipLabelTranslation
            value={erc20Form.logo}
            type={InputType.TEXT}
            onChange={(value) => setErc20Field('logo', value)}
            dataTestId="custom-asset-logo"
            classname="custom-asset-input"
          />
        </div>
      </div>

      {erc20Errors.save && <div className="error-message">{erc20Errors.save}</div>}

      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          onClick={onClose}
          label="popup_html_button_label_cancel"
        />
        <ButtonComponent
          onClick={() => void handleSaveErc20()}
          label="popup_html_operation_button_save"
          dataTestId="custom-asset-save"
          disabled={isSaving}
        />
      </div>
    </>
  );

  const renderNftPlaceholder = () => (
    <>
      <div className="popup-title">Add Custom NFT</div>
      <div className="popup-caption">
        Manual NFT entry will use this shared popup later.
      </div>
      <div className="popup-note">
        NFT manual add is not implemented yet in this pass.
      </div>
      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          onClick={onClose}
          label="popup_html_button_label_cancel"
        />
      </div>
    </>
  );

  return (
    <PopupContainer
      className="evm-add-custom-asset-popup"
      dataTestId="custom-asset-popup"
      onClickOutside={onClose}>
      {mode === 'erc20' ? renderErc20Form() : renderNftPlaceholder()}
    </PopupContainer>
  );
};

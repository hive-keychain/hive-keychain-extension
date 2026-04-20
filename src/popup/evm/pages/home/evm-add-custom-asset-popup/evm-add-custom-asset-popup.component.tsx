import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import {
  EvmCustomNft,
  EvmCustomToken,
} from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
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

export interface EvmCustomNftFormData {
  contractAddress: string;
  type: EVMSmartContractType.ERC721 | EVMSmartContractType.ERC1155;
  tokenIds: string[];
  /** Optional display name for this collection in the wallet. */
  collectionName?: string;
}

interface Props {
  chain: EvmChain;
  mode: EvmCustomAssetMode;
  walletAddress?: string;
  existingAddresses?: string[];
  /** When set, the form is pre-filled and the contract address cannot be changed. */
  tokenToEdit?: EvmCustomToken | EvmCustomNft | null;
  onClose: () => void;
  onSave?:
    | ((
        form: EvmCustomErc20FormData | EvmCustomNftFormData,
      ) => Promise<void> | void)
    | undefined;
}

interface Erc20FormState {
  contractAddress: string;
  symbol: string;
  logo: string;
}

interface Erc20FormErrors {
  contractAddress?: string;
  symbol?: string;
  save?: string;
}

interface NftFormState {
  contractAddress: string;
  collectionName: string;
  tokenIds: string;
}

interface NftFormErrors {
  contractAddress?: string;
  tokenIds?: string;
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

const isValidTokenId = (value: string) =>
  /^(0x[0-9a-fA-F]+|[0-9]+)$/.test(value.trim());

const normalizeTokenId = (value: string) => {
  try {
    return BigInt(value.trim()).toString(10);
  } catch {
    return value.trim();
  }
};

const parseTokenIdsInput = (value: string) =>
  value
    .split(/[\s,]+/)
    .map((tokenId) => tokenId.trim())
    .filter(Boolean);

const formatTokenIds = (tokenIds: string[]) => tokenIds.join(', ');

const getNftTypeMessage = (type?: EVMSmartContractType) => {
  switch (type) {
    case EVMSmartContractType.ERC1155:
      return 'ERC1155';
    case EVMSmartContractType.ERC721:
      return 'ERC721';
    default:
      return '';
  }
};

const INITIAL_ERC20_FORM: Erc20FormState = {
  contractAddress: '',
  symbol: '',
  logo: '',
};

const INITIAL_NFT_FORM: NftFormState = {
  contractAddress: '',
  collectionName: '',
  tokenIds: '',
};

export const EvmAddCustomAssetPopup = ({
  chain,
  mode,
  walletAddress,
  existingAddresses = [],
  tokenToEdit = null,
  onClose,
  onSave,
}: Props) => {
  const [erc20Form, setErc20Form] = useState<Erc20FormState>(
    INITIAL_ERC20_FORM,
  );
  const [nftForm, setNftForm] = useState<NftFormState>(INITIAL_NFT_FORM);
  const [erc20Errors, setErc20Errors] = useState<Erc20FormErrors>({});
  const [nftErrors, setNftErrors] = useState<NftFormErrors>({});
  const [savedCustomTokens, setSavedCustomTokens] = useState<EvmCustomToken[]>(
    [],
  );
  const [savedCustomNfts, setSavedCustomNfts] = useState<EvmCustomNft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      setSavedCustomTokens([]);
      setSavedCustomNfts([]);
      return;
    }

    let mounted = true;

    const loadCustomAssets = async () => {
      const [customTokens, customNfts] = await Promise.all([
        EvmTokensUtils.getCustomTokens(chain, walletAddress),
        EvmTokensUtils.getCustomNfts(chain, walletAddress),
      ]);

      if (!mounted) {
        return;
      }

      setSavedCustomTokens(customTokens);
      setSavedCustomNfts(customNfts);
    };

    void loadCustomAssets();

    return () => {
      mounted = false;
    };
  }, [chain, walletAddress]);

  useEffect(() => {
    if (mode !== 'erc20') {
      return;
    }
    if (
      tokenToEdit &&
      'metadata' in tokenToEdit &&
      tokenToEdit.type === EVMSmartContractType.ERC20
    ) {
      const meta =
        tokenToEdit.metadata?.type === EVMSmartContractType.ERC20
          ? tokenToEdit.metadata
          : undefined;
      setErc20Form({
        contractAddress: tokenToEdit.address,
        symbol: meta?.symbol ?? '',
        logo: meta?.logo ?? '',
      });
    } else {
      setErc20Form(INITIAL_ERC20_FORM);
    }
    setErc20Errors({});
  }, [mode, tokenToEdit]);

  useEffect(() => {
    if (mode !== 'nft') {
      return;
    }
    if (tokenToEdit && 'tokenIds' in tokenToEdit) {
      setNftForm({
        contractAddress: tokenToEdit.address,
        collectionName: tokenToEdit.collectionName ?? '',
        tokenIds: formatTokenIds(tokenToEdit.tokenIds),
      });
    } else {
      setNftForm(INITIAL_NFT_FORM);
    }
    setNftErrors({});
  }, [mode, tokenToEdit]);

  const currentEditAddress = useMemo(() => {
    if (!tokenToEdit) {
      return '';
    }
    return normalizeAddress(tokenToEdit.address);
  }, [tokenToEdit]);

  const normalizedExistingAddresses = useMemo(() => {
    const savedAddresses =
      mode === 'erc20'
        ? savedCustomTokens.map((token) => token.address)
        : savedCustomNfts.map((nft) => nft.address);

    const set = new Set(
      [...existingAddresses, ...savedAddresses]
        .map(normalizeAddress)
        .filter(Boolean)
        .map((address) => address.toLowerCase()),
    );

    if (currentEditAddress) {
      set.delete(currentEditAddress.toLowerCase());
    }

    return set;
  }, [
    currentEditAddress,
    existingAddresses,
    mode,
    savedCustomNfts,
    savedCustomTokens,
  ]);

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

  const setNftField = (field: keyof NftFormState, value: string) => {
    setNftForm((current) => ({
      ...current,
      [field]: value,
    }));

    setNftErrors((current) => ({
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

    if (!erc20Form.symbol.trim()) {
      errors.symbol = 'Symbol is required.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      normalizedAddress,
    };
  };

  const validateNftForm = () => {
    const errors: NftFormErrors = {};
    const normalizedAddress = normalizeAddress(nftForm.contractAddress);
    const rawTokenIds = parseTokenIdsInput(nftForm.tokenIds);
    const invalidTokenIds = rawTokenIds.filter((tokenId) => !isValidTokenId(tokenId));
    const normalizedTokenIds = Array.from(
      new Set(rawTokenIds.map(normalizeTokenId).filter(Boolean)),
    );

    if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
      errors.contractAddress = 'Enter a valid contract address.';
    } else if (
      normalizedExistingAddresses.has(normalizedAddress.toLowerCase())
    ) {
      errors.contractAddress = 'This contract address is already added.';
    }

    if (!rawTokenIds.length) {
      errors.tokenIds = 'Enter at least one token ID.';
    } else if (invalidTokenIds.length) {
      errors.tokenIds =
        'Token IDs must be decimal numbers or 0x-prefixed hex values.';
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      normalizedAddress,
      normalizedTokenIds,
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
      const { name, decimals } =
        await EvmTokensUtils.fetchErc20NameAndDecimalsFromChain(
          chain,
          normalizedAddress,
        );
      try {
        await onSave({
          contractAddress: normalizedAddress,
          name,
          symbol: erc20Form.symbol.trim(),
          decimals,
          logo: erc20Form.logo.trim(),
        } as EvmCustomErc20FormData);
      } catch {
        if (isMountedRef.current) {
          setErc20Errors((current) => ({
            ...current,
            save: 'Unable to save this token right now.',
          }));
        }
      }
    } catch {
      if (isMountedRef.current) {
        setErc20Errors((current) => ({
          ...current,
          save:
            'Could not read token name and decimals from the chain. Check the address and that it is a standard ERC20 contract.',
        }));
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handleSaveNft = async () => {
    if (!onSave || !walletAddress) {
      return;
    }

    const { errors, isValid, normalizedAddress, normalizedTokenIds } =
      validateNftForm();
    if (!isValid) {
      setNftErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const type = await EvmTokensUtils.detectCustomNftType(
        chain,
        walletAddress,
        normalizedAddress,
        normalizedTokenIds,
      );
      const ownedTokenIds = await EvmTokensUtils.getOwnedCustomNftTokenIds(
        chain,
        walletAddress,
        normalizedAddress,
        type,
        normalizedTokenIds,
      );

      if (ownedTokenIds.length !== normalizedTokenIds.length) {
        if (isMountedRef.current) {
          setNftErrors((current) => ({
            ...current,
            tokenIds: 'One or more token IDs are not owned by this wallet.',
          }));
        }
        return;
      }

      const trimmedCollectionName = nftForm.collectionName.trim();

      try {
        await onSave({
          contractAddress: normalizedAddress,
          type,
          tokenIds: normalizedTokenIds,
          ...(trimmedCollectionName
            ? { collectionName: trimmedCollectionName }
            : {}),
        } as EvmCustomNftFormData);
      } catch {
        if (isMountedRef.current) {
          setNftErrors((current) => ({
            ...current,
            save: 'Unable to save this NFT right now.',
          }));
        }
      }
    } catch {
      if (isMountedRef.current) {
        setNftErrors((current) => ({
          ...current,
          save:
            'Could not detect a supported NFT contract at this address. Only ERC721 and ERC1155 contracts are supported.',
        }));
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const isEditing = Boolean(tokenToEdit);
  const editedNftType =
    tokenToEdit && 'tokenIds' in tokenToEdit ? tokenToEdit.type : undefined;

  const renderErc20Form = () => (
    <>
      <div className="popup-title">
        {isEditing
          ? chrome.i18n.getMessage('evm_custom_tokens_modal_title_edit')
          : chrome.i18n.getMessage('evm_add_custom_token_popup_title')}
      </div>
      <div className="popup-caption">
        {isEditing
          ? chrome.i18n.getMessage('evm_custom_tokens_modal_caption_edit')
          : chrome.i18n.getMessage('evm_add_custom_token_popup_caption')}
      </div>

      <div className="custom-asset-form">
        <div className="field">
          <InputComponent
            label="Contract address"
            skipLabelTranslation
            value={erc20Form.contractAddress}
            type={InputType.TEXT}
            readOnly={isEditing}
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

  const renderNftForm = () => (
    <>
      <div className="popup-title">
        {isEditing
          ? chrome.i18n.getMessage('evm_custom_nfts_modal_title_edit')
          : chrome.i18n.getMessage('evm_add_custom_nft_popup_title')}
      </div>
      <div className="popup-caption">
        {isEditing
          ? chrome.i18n.getMessage('evm_custom_nfts_modal_caption_edit')
          : chrome.i18n.getMessage('evm_add_custom_nft_popup_caption')}
      </div>

      <div className="custom-asset-form">
        <div className="field">
          <InputComponent
            label="evm_smart_contract_address"
            value={nftForm.contractAddress}
            type={InputType.TEXT}
            readOnly={isEditing}
            onChange={(value) => setNftField('contractAddress', value)}
            dataTestId="custom-asset-contract-address"
            classname="custom-asset-input"
          />
          {nftErrors.contractAddress && (
            <div className="error-message">{nftErrors.contractAddress}</div>
          )}
        </div>

        <div className="field">
          <InputComponent
            label="evm_custom_nfts_field_collection_name"
            value={nftForm.collectionName}
            type={InputType.TEXT}
            onChange={(value) => setNftField('collectionName', value)}
            dataTestId="custom-asset-collection-name"
            classname="custom-asset-input"
          />
        </div>

        <div className="field">
          <TextAreaComponent
            label="evm_custom_nfts_field_token_ids"
            value={nftForm.tokenIds}
            rows={4}
            onChange={(value) => setNftField('tokenIds', value)}
            dataTestId="custom-asset-token-ids"
            classname="custom-asset-input"
          />
          {nftErrors.tokenIds && (
            <div className="error-message">{nftErrors.tokenIds}</div>
          )}
        </div>

        <div className="popup-note">
          {chrome.i18n.getMessage(
            isEditing && editedNftType
              ? 'evm_custom_nfts_type_detected'
              : 'evm_custom_nfts_type_auto_detected',
            isEditing && editedNftType
              ? [getNftTypeMessage(editedNftType)]
              : undefined,
          )}
        </div>
      </div>

      {nftErrors.save && <div className="error-message">{nftErrors.save}</div>}

      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          onClick={onClose}
          label="popup_html_button_label_cancel"
        />
        <ButtonComponent
          onClick={() => void handleSaveNft()}
          label="popup_html_operation_button_save"
          dataTestId="custom-asset-save"
          disabled={isSaving}
        />
      </div>
    </>
  );

  return (
    <PopupContainer
      className="evm-add-custom-asset-popup"
      dataTestId="custom-asset-popup"
      onClickOutside={onClose}>
      {mode === 'erc20' ? renderErc20Form() : renderNftForm()}
    </PopupContainer>
  );
};

import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { TextAreaComponent } from '@common-ui/text-area/textarea.component';
import { EvmCustomErc20Form } from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-custom-erc20-form.component';
import { EvmKnownTokenList } from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-known-token-list.component';
import {
  EvmCustomNft,
  EvmCustomToken,
} from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
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
  name: string;
  symbol: string;
  /** Raw input for the decimals field (validated on save). */
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
  name: '',
  symbol: '',
  decimals: '',
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
  const [erc20Form, setErc20Form] =
    useState<Erc20FormState>(INITIAL_ERC20_FORM);
  const [nftForm, setNftForm] = useState<NftFormState>(INITIAL_NFT_FORM);
  const [erc20Errors, setErc20Errors] = useState<Erc20FormErrors>({});
  const [nftErrors, setNftErrors] = useState<NftFormErrors>({});
  const [savedCustomTokens, setSavedCustomTokens] = useState<EvmCustomToken[]>(
    [],
  );
  const [savedCustomNfts, setSavedCustomNfts] = useState<EvmCustomNft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isResolvingContract, setIsResolvingContract] = useState(false);
  const [showManualErc20Form, setShowManualErc20Form] = useState(false);
  const isMountedRef = useRef(true);
  const erc20FormRef = useRef(erc20Form);
  const normalizedExistingErc20Ref = useRef(
    new Set<string>(),
  );
  const contractBlurGenerationRef = useRef(0);

  erc20FormRef.current = erc20Form;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!walletAddress || mode !== 'nft') {
      setSavedCustomTokens([]);
      setSavedCustomNfts([]);
      return;
    }

    let mounted = true;

    const loadCustomAssets = async () => {
      const customNfts = await EvmTokensUtils.getCustomNfts(
        chain,
        walletAddress,
      );

      if (!mounted) {
        return;
      }

      setSavedCustomNfts(customNfts);
    };

    void loadCustomAssets();

    return () => {
      mounted = false;
    };
  }, [chain, mode, walletAddress]);

  useEffect(() => {
    setShowManualErc20Form(false);
  }, [tokenToEdit]);

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
        name: meta?.name ?? '',
        symbol: meta?.symbol ?? '',
        decimals:
          meta?.decimals !== undefined ? String(meta.decimals) : '',
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

  if (mode === 'erc20') {
    normalizedExistingErc20Ref.current = normalizedExistingAddresses;
  }

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

  const setErc20ContractAddress = (value: string) => {
    if (isEditing) {
      setErc20Field('contractAddress', value);
      return;
    }
    setErc20Form((current) => ({
      ...current,
      contractAddress: value,
      name: '',
      decimals: '',
    }));
    setErc20Errors((current) => ({
      ...current,
      contractAddress: undefined,
      save: undefined,
    }));
  };

  const handleErc20ContractBlur = () => {
    void (async () => {
      if (isEditing) {
        return;
      }

      const trimmed = erc20FormRef.current.contractAddress.trim();

      setErc20Errors((current) => ({
        ...current,
        contractAddress: undefined,
        save: undefined,
      }));

      if (!trimmed.length) {
        return;
      }

      const normalizedAddress = normalizeAddress(trimmed);

      if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
        if (isMountedRef.current) {
          setErc20Errors((current) => ({
            ...current,
            contractAddress: I18nUtils.getMessage(
              'evm_add_custom_asset_error_contract_address_invalid',
            ),
          }));
        }
        return;
      }

      if (
        normalizedExistingErc20Ref.current.has(normalizedAddress.toLowerCase())
      ) {
        if (isMountedRef.current) {
          setErc20Errors((current) => ({
            ...current,
            contractAddress: I18nUtils.getMessage(
              'evm_add_custom_asset_error_contract_address_duplicate',
            ),
          }));
        }
        return;
      }

      contractBlurGenerationRef.current += 1;
      const runId = contractBlurGenerationRef.current;

      setIsResolvingContract(true);
      try {
        const { name, decimals } =
          await EvmTokensUtils.fetchErc20NameAndDecimalsFromChain(
            chain,
            normalizedAddress,
          );
        if (
          !isMountedRef.current ||
          runId !== contractBlurGenerationRef.current
        ) {
          return;
        }
        setErc20Form((current) => ({
          ...current,
          contractAddress: normalizedAddress,
          ...(name.trim().length ? { name: name.trim() } : {}),
          decimals: String(decimals),
        }));
      } catch {
        if (
          isMountedRef.current &&
          runId === contractBlurGenerationRef.current
        ) {
          setErc20Errors((current) => ({
            ...current,
            contractAddress: I18nUtils.getMessage(
              'evm_add_custom_token_error_fetch_erc20_metadata',
            ),
          }));
        }
      } finally {
        if (
          isMountedRef.current &&
          runId === contractBlurGenerationRef.current
        ) {
          setIsResolvingContract(false);
        }
      }
    })();
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
      errors.contractAddress = I18nUtils.getMessage(
        'evm_add_custom_asset_error_contract_address_invalid',
      );
    } else if (
      normalizedExistingAddresses.has(normalizedAddress.toLowerCase())
    ) {
      errors.contractAddress = I18nUtils.getMessage(
        'evm_add_custom_asset_error_contract_address_duplicate',
      );
    }

    if (!erc20Form.symbol.trim()) {
      errors.symbol = I18nUtils.getMessage(
        'evm_add_custom_token_error_symbol_required',
      );
    }

    if (!erc20Form.name.trim()) {
      errors.name = I18nUtils.getMessage(
        'evm_add_custom_token_error_name_required',
      );
    }

    const decimalsTrimmed = erc20Form.decimals.trim();
    const decimalsParsed = Number.parseInt(decimalsTrimmed, 10);
    if (
      !decimalsTrimmed.length ||
      !Number.isInteger(decimalsParsed) ||
      decimalsParsed < 0 ||
      decimalsParsed > 255
    ) {
      errors.decimals = I18nUtils.getMessage(
        'evm_add_custom_token_error_decimals_invalid',
      );
    }

    return {
      errors,
      isValid: Object.keys(errors).length === 0,
      normalizedAddress,
      decimalsParsed: errors.decimals ? NaN : decimalsParsed,
    };
  };

  const validateNftForm = () => {
    const errors: NftFormErrors = {};
    const normalizedAddress = normalizeAddress(nftForm.contractAddress);
    const rawTokenIds = parseTokenIdsInput(nftForm.tokenIds);
    const invalidTokenIds = rawTokenIds.filter(
      (tokenId) => !isValidTokenId(tokenId),
    );
    const normalizedTokenIds = Array.from(
      new Set(rawTokenIds.map(normalizeTokenId).filter(Boolean)),
    );

    if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
      errors.contractAddress = I18nUtils.getMessage(
        'evm_add_custom_asset_error_contract_address_invalid',
      );
    } else if (
      normalizedExistingAddresses.has(normalizedAddress.toLowerCase())
    ) {
      errors.contractAddress = I18nUtils.getMessage(
        'evm_add_custom_asset_error_contract_address_duplicate',
      );
    }

    if (!rawTokenIds.length) {
      errors.tokenIds = I18nUtils.getMessage(
        'evm_add_custom_nft_error_token_ids_required',
      );
    } else if (invalidTokenIds.length) {
      errors.tokenIds = I18nUtils.getMessage(
        'evm_add_custom_nft_error_token_ids_format',
      );
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

    const { errors, isValid, normalizedAddress, decimalsParsed } =
      validateErc20Form();
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
        decimals: decimalsParsed,
        logo: erc20Form.logo.trim(),
      } as EvmCustomErc20FormData);
    } catch {
      if (isMountedRef.current) {
        setErc20Errors((current) => ({
          ...current,
          save: I18nUtils.getMessage(
            'evm_add_custom_token_error_save_failed',
          ),
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
            tokenIds: I18nUtils.getMessage(
              'evm_add_custom_nft_error_token_ids_not_owned',
            ),
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
            save: I18nUtils.getMessage(
              'evm_add_custom_nft_error_save_failed',
            ),
          }));
        }
      }
    } catch {
      if (isMountedRef.current) {
        setNftErrors((current) => ({
          ...current,
          save: I18nUtils.getMessage(
            'evm_add_custom_nft_error_unsupported_contract',
          ),
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

  const handleKnownTokenSave = async (form: EvmCustomErc20FormData) => {
    await onSave?.(form);
  };

  const renderErc20Browse = () => (
    <>
      <div className="popup-title">
        {I18nUtils.getMessage('evm_add_custom_token_popup_title')}
      </div>
      <EvmKnownTokenList
        chain={chain}
        existingAddresses={existingAddresses}
        onSave={handleKnownTokenSave}
      />
      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          onClick={onClose}
          label="popup_html_button_label_cancel"
        />
        <ButtonComponent
          type={ButtonType.IMPORTANT}
          label="evm_add_custom_token_manually"
          dataTestId="btn-add-custom-token-manually"
          onClick={() => setShowManualErc20Form(true)}
        />
      </div>
    </>
  );

  const renderErc20Form = () => (
    <EvmCustomErc20Form
      chain={chain}
      walletAddress={walletAddress}
      existingAddresses={existingAddresses}
      tokenToEdit={
        tokenToEdit &&
        'metadata' in tokenToEdit &&
        tokenToEdit.type === EVMSmartContractType.ERC20
          ? tokenToEdit
          : null
      }
      title={
        isEditing
          ? I18nUtils.getMessage('evm_custom_tokens_modal_title_edit')
          : I18nUtils.getMessage('evm_add_custom_token_popup_title')
      }
      caption={
        isEditing
          ? I18nUtils.getMessage('evm_custom_tokens_modal_caption_edit')
          : undefined
      }
      onClose={
        isEditing ? onClose : () => setShowManualErc20Form(false)
      }
      onSave={onSave as (form: EvmCustomErc20FormData) => Promise<void> | void}
    />
  );

  const renderErc20Content = () => {
    if (isEditing || showManualErc20Form) {
      return renderErc20Form();
    }
    return renderErc20Browse();
  };

  const renderNftForm = () => (
    <>
      <div className="popup-title">
        {isEditing
          ? I18nUtils.getMessage('evm_custom_nfts_modal_title_edit')
          : I18nUtils.getMessage('evm_add_custom_nft_popup_title')}
      </div>
      <div className="popup-caption">
        {isEditing
          ? I18nUtils.getMessage('evm_custom_nfts_modal_caption_edit')
          : I18nUtils.getMessage('evm_add_custom_nft_popup_caption')}
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
          {I18nUtils.getMessage(
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
      className={`evm-add-custom-asset-popup${
        mode === 'erc20' && !isEditing && !showManualErc20Form
          ? ' evm-add-custom-asset-popup--browse'
          : ''
      }`}
      dataTestId="custom-asset-popup"
      onClickOutside={onClose}>
      {mode === 'erc20' ? renderErc20Content() : renderNftForm()}
    </PopupContainer>
  );
};

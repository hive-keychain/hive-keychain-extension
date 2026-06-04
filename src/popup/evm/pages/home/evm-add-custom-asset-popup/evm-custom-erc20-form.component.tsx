import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { EvmCustomToken } from '@popup/evm/interfaces/evm-custom-tokens.interface';
import { EVMSmartContractType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { I18nUtils } from 'src/utils/i18n.utils';
export interface EvmCustomErc20FormData {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
}

export interface EvmCustomErc20InitialForm {
  contractAddress?: string;
  name?: string;
  symbol?: string;
  decimals?: number | string;
  logo?: string;
}

export interface EvmCustomErc20FormRef {
  submit: () => Promise<boolean>;
}

interface Props {
  chain: EvmChain;
  walletAddress?: string;
  existingAddresses?: string[];
  /** When set, the form is pre-filled and the contract address cannot be changed. */
  tokenToEdit?: EvmCustomToken | null;
  initialForm?: EvmCustomErc20InitialForm;
  autoResolveContract?: boolean;
  title?: string;
  caption?: string;
  onClose?: () => void;
  onSave?: (form: EvmCustomErc20FormData) => Promise<void> | void;
  renderFooter?: boolean;
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

const INITIAL_ERC20_FORM: Erc20FormState = {
  contractAddress: '',
  name: '',
  symbol: '',
  decimals: '',
  logo: '',
};

const normalizeAddress = (address: string) => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress.length) {
    return '';
  }
  return ethers.isAddress(trimmedAddress)
    ? ethers.getAddress(trimmedAddress)
    : trimmedAddress;
};

const buildInitialForm = (
  tokenToEdit?: EvmCustomToken | null,
  initialForm?: EvmCustomErc20InitialForm,
) => {
  if (
    tokenToEdit &&
    tokenToEdit.type === EVMSmartContractType.ERC20
  ) {
    const meta =
      tokenToEdit.metadata?.type === EVMSmartContractType.ERC20
        ? tokenToEdit.metadata
        : undefined;
    return {
      contractAddress: tokenToEdit.address,
      name: meta?.name ?? '',
      symbol: meta?.symbol ?? '',
      decimals:
        meta?.decimals !== undefined ? String(meta.decimals) : '',
      logo: meta?.logo ?? '',
    };
  }

  return {
    contractAddress: initialForm?.contractAddress ?? '',
    name: initialForm?.name ?? '',
    symbol: initialForm?.symbol ?? '',
    decimals:
      initialForm?.decimals !== undefined
        ? String(initialForm.decimals)
        : '',
    logo: initialForm?.logo ?? '',
  };
};

export const EvmCustomErc20Form = forwardRef<
  EvmCustomErc20FormRef,
  Props
>(
  (
    {
      chain,
      walletAddress,
      existingAddresses = [],
      tokenToEdit = null,
      initialForm,
      autoResolveContract = false,
      title,
      caption,
      onClose,
      onSave,
      renderFooter = true,
    },
    ref,
  ) => {
    const [erc20Form, setErc20Form] = useState<Erc20FormState>(
      buildInitialForm(tokenToEdit, initialForm),
    );
    const [erc20Errors, setErc20Errors] = useState<Erc20FormErrors>({});
    const [savedCustomTokens, setSavedCustomTokens] = useState<
      EvmCustomToken[]
    >([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isResolvingContract, setIsResolvingContract] = useState(false);
    const isMountedRef = useRef(true);
    const erc20FormRef = useRef(erc20Form);
    const normalizedExistingErc20Ref = useRef(new Set<string>());
    const contractBlurGenerationRef = useRef(0);
    const autoResolvedAddressRef = useRef<string | null>(null);
    const isEditing = Boolean(tokenToEdit);

    erc20FormRef.current = erc20Form;

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      setErc20Form(buildInitialForm(tokenToEdit, initialForm));
      setErc20Errors({});
      autoResolvedAddressRef.current = null;
    }, [initialForm, tokenToEdit]);

    useEffect(() => {
      if (!walletAddress) {
        setSavedCustomTokens([]);
        return;
      }

      let mounted = true;

      const loadCustomTokens = async () => {
        const customTokens = await EvmTokensUtils.getCustomTokens(
          chain,
          walletAddress,
        );

        if (!mounted) {
          return;
        }

        setSavedCustomTokens(customTokens);
      };

      void loadCustomTokens();

      return () => {
        mounted = false;
      };
    }, [chain, walletAddress]);

    const currentEditAddress = useMemo(() => {
      if (!tokenToEdit) {
        return '';
      }
      return normalizeAddress(tokenToEdit.address);
    }, [tokenToEdit]);

    const normalizedExistingAddresses = useMemo(() => {
      const set = new Set(
        [...existingAddresses, ...savedCustomTokens.map((token) => token.address)]
          .map(normalizeAddress)
          .filter(Boolean)
          .map((address) => address.toLowerCase()),
      );

      if (currentEditAddress) {
        set.delete(currentEditAddress.toLowerCase());
      }

      return set;
    }, [currentEditAddress, existingAddresses, savedCustomTokens]);

    normalizedExistingErc20Ref.current = normalizedExistingAddresses;

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
      autoResolvedAddressRef.current = null;
    };

    const resolveContractMetadata = async () => {
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
    };

    useEffect(() => {
      const normalizedAddress = normalizeAddress(erc20Form.contractAddress);
      if (
        !autoResolveContract ||
        isEditing ||
        !normalizedAddress ||
        !ethers.isAddress(normalizedAddress) ||
        autoResolvedAddressRef.current === normalizedAddress.toLowerCase()
      ) {
        return;
      }

      autoResolvedAddressRef.current = normalizedAddress.toLowerCase();
      void resolveContractMetadata();
    }, [
      autoResolveContract,
      erc20Form.contractAddress,
      isEditing,
      normalizedExistingAddresses,
    ]);

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

    const handleSaveErc20 = async () => {
      if (!onSave) {
        return false;
      }

      const { errors, isValid, normalizedAddress, decimalsParsed } =
        validateErc20Form();
      if (!isValid) {
        setErc20Errors(errors);
        return false;
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
        return true;
      } catch {
        if (isMountedRef.current) {
          setErc20Errors((current) => ({
            ...current,
            save: I18nUtils.getMessage(
              'evm_add_custom_token_error_save_failed',
            ),
          }));
        }
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      submit: handleSaveErc20,
    }));

    return (
      <>
        {title && <div className="popup-title">{title}</div>}
        {caption && <div className="popup-caption">{caption}</div>}

        <div className="custom-asset-form">
          <div className="field">
            <InputComponent
              label="Contract address"
              skipLabelTranslation
              value={erc20Form.contractAddress}
              type={InputType.TEXT}
              readOnly={isEditing}
              disabled={isResolvingContract}
              onChange={(value) => setErc20ContractAddress(value)}
              onBlur={() => void resolveContractMetadata()}
              dataTestId="custom-asset-contract-address"
              classname="custom-asset-input"
            />
            {erc20Errors.contractAddress && (
              <div className="error-message">
                {erc20Errors.contractAddress}
              </div>
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
              type={InputType.TEXT}
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

        {erc20Errors.save && (
          <div className="error-message">{erc20Errors.save}</div>
        )}

        {renderFooter && (
          <div className="popup-footer">
            <ButtonComponent
              type={ButtonType.ALTERNATIVE}
              onClick={() => onClose?.()}
              label="popup_html_button_label_cancel"
            />
            <ButtonComponent
              onClick={() => void handleSaveErc20()}
              label="popup_html_operation_button_save"
              dataTestId="custom-asset-save"
              disabled={isSaving || isResolvingContract}
            />
          </div>
        )}
      </>
    );
  },
);

EvmCustomErc20Form.displayName = 'EvmCustomErc20Form';

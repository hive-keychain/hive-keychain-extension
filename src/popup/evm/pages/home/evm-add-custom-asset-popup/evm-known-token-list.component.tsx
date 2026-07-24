import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { TokenExtended } from '@lifi/types';
import { EvmCustomErc20FormData } from '@popup/evm/pages/home/evm-add-custom-asset-popup/evm-custom-erc20-form.component';
import { EvmTokenListItemComponent } from '@popup/evm/pages/home/evm-token-list-item/evm-token-list-item.component';
import { LiFiUtils } from '@popup/evm/utils/lifi.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

import { I18nUtils } from 'src/utils/i18n.utils';

interface Props {
  chain: EvmChain;
  existingAddresses?: string[];
  onSave?: (form: EvmCustomErc20FormData) => Promise<void> | void;
}

const KNOWN_TOKENS_PAGE_SIZE = 25;

const normalizeAddress = (address: string) => {
  const trimmedAddress = address.trim();
  if (!trimmedAddress.length) {
    return '';
  }
  return ethers.isAddress(trimmedAddress)
    ? ethers.getAddress(trimmedAddress)
    : trimmedAddress;
};

export const EvmKnownTokenList = ({
  chain,
  existingAddresses = [],
  onSave,
}: Props) => {
  const cachedTokens = LiFiUtils.getCachedKnownTokensForChain(chain.chainId);
  const [tokens, setTokens] = useState<TokenExtended[]>(cachedTokens ?? []);
  const [query, setQuery] = useState('');
  const [visibleTokenCount, setVisibleTokenCount] = useState(
    KNOWN_TOKENS_PAGE_SIZE,
  );
  const [isLoading, setIsLoading] = useState(!cachedTokens);
  const [savingAddress, setSavingAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const cachedKnownTokens = LiFiUtils.getCachedKnownTokensForChain(
      chain.chainId,
    );

    if (cachedKnownTokens) {
      setTokens(cachedKnownTokens);
      setIsLoading(false);
      setError(null);
      return;
    }

    const loadKnownTokens = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const knownTokens = await LiFiUtils.getKnownTokensForChain(
          chain.chainId,
        );

        if (!mounted) {
          return;
        }

        setTokens(knownTokens);
      } catch {
        if (mounted) {
          setError(
            I18nUtils.getMessage('evm_known_tokens_error_loading'),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadKnownTokens();

    return () => {
      mounted = false;
    };
  }, [chain.chainId]);

  const normalizedExistingAddresses = useMemo(
    () =>
      new Set(
        existingAddresses
          .map(normalizeAddress)
          .filter(Boolean)
          .map((address) => address.toLowerCase()),
      ),
    [existingAddresses],
  );

  const filteredTokens = useMemo(
    () => {
      const queryFilteredTokens = LiFiUtils.filterKnownTokensByQuery(
        tokens,
        query,
      );

      const existingAddressFilteredTokens = queryFilteredTokens.filter((token) => {
        const normalizedAddress = normalizeAddress(token.address);
        return (
          !!normalizedAddress &&
          !normalizedExistingAddresses.has(normalizedAddress.toLowerCase())
        );
      });

      return existingAddressFilteredTokens;
    },
    [normalizedExistingAddresses, query, tokens],
  );

  const visibleTokens = useMemo(
    () => filteredTokens.slice(0, visibleTokenCount),
    [filteredTokens, visibleTokenCount],
  );

  useEffect(() => {
    setVisibleTokenCount(KNOWN_TOKENS_PAGE_SIZE);
  }, [query, tokens]);

  const loadMoreKnownTokens = () => {
    setVisibleTokenCount((current) =>
      Math.min(current + KNOWN_TOKENS_PAGE_SIZE, filteredTokens.length),
    );
  };

  const handleTokenListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    const hasReachedBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 24;

    if (!hasReachedBottom || visibleTokenCount >= filteredTokens.length) {
      return;
    }

    loadMoreKnownTokens();
  };

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleTokenCount >= filteredTokens.length) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreKnownTokens();
      }
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [filteredTokens.length, visibleTokenCount]);

  const saveKnownToken = async (token: TokenExtended) => {
    if (!onSave) {
      return;
    }

    const normalizedAddress = normalizeAddress(token.address);
    if (!normalizedAddress || !ethers.isAddress(normalizedAddress)) {
      setError(
        I18nUtils.getMessage(
          'evm_add_custom_asset_error_contract_address_invalid',
        ),
      );
      return;
    }

    setSavingAddress(normalizedAddress);
    setError(null);

    try {
      await onSave({
        contractAddress: normalizedAddress,
        name: token.name?.trim() ?? '',
        symbol: token.symbol?.trim() ?? '',
        decimals: token.decimals,
        logo: token.logoURI?.trim() ?? '',
      });
    } catch {
      if (isMountedRef.current) {
        setError(
          I18nUtils.getMessage('evm_add_custom_token_error_save_failed'),
        );
      }
    } finally {
      if (isMountedRef.current) {
        setSavingAddress(null);
      }
    }
  };

  const renderKnownToken = (token: TokenExtended) => {
    const normalizedAddress = normalizeAddress(token.address);
    const isSaving = savingAddress === normalizedAddress;
    const isActivateDisabled = !onSave || isSaving;
    const activateKnownToken = () => {
      if (isActivateDisabled) {
        return;
      }
      void saveKnownToken(token);
    };

    return (
      <EvmTokenListItemComponent
        key={`${token.chainId}-${token.address}`}
        address={token.address}
        logo={token.logoURI ?? ''}
        name={token.name ?? ''}
        symbol={token.symbol ?? ''}
        dataTestId={`known-token-item-${token.address}`}
        onActivate={activateKnownToken}
        isActivateDisabled={isActivateDisabled}
        action={
          <button
            type="button"
            className="known-token-add-button"
            aria-label={I18nUtils.getMessage('evm_known_tokens_add')}
            data-testid={`known-token-add-${token.address}`}
            onClick={(event) => {
              event.stopPropagation();
              activateKnownToken();
            }}
            disabled={isActivateDisabled}>
            <SVGIcon icon={SVGIcons.SELECT_ADD} />
          </button>
        }
      />
    );
  };

  return (
    <div className="known-token-list">
      <InputComponent
        label="evm_known_tokens_search_label"
        placeholder="evm_known_tokens_search_placeholder"
        value={query}
        type={InputType.TEXT}
        onChange={setQuery}
        dataTestId="known-token-search"
        classname="custom-asset-input"
      />

      {isLoading && (
        <div className="popup-note">
          {I18nUtils.getMessage('evm_known_tokens_loading')}
        </div>
      )}

      {!isLoading && error && <div className="error-message">{error}</div>}

      {!isLoading && !error && filteredTokens.length === 0 && (
        <div className="popup-note">
          {I18nUtils.getMessage('evm_known_tokens_empty')}
        </div>
      )}

      {!isLoading && !error && filteredTokens.length > 0 && (
        <div
          className="known-token-items"
          data-testid="known-token-items"
          onScroll={handleTokenListScroll}>
          {visibleTokens.map(renderKnownToken)}
          {visibleTokenCount < filteredTokens.length && (
            <div
              className="known-token-load-more"
              data-testid="known-token-load-more"
              ref={loadMoreRef}
            />
          )}
        </div>
      )}
    </div>
  );
};

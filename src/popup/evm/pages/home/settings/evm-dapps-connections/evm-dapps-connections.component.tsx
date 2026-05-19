import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { emitAccountsChangedIfNeeded } from '@background/evm/evm-provider-state.utils';
import { Card } from '@common-ui/card/card.component';
import { EvmWalletPermissions } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { Chain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { DappStatusComponent } from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  getHostnameFromUrl,
  getOriginFromUrl,
} from 'src/utils/browser-origin.utils';
import {
  normalizeEvmAccounts,
  normalizeEvmChainId,
} from 'src/utils/evm-provider-value.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { EvmDappUtils } from 'src/popup/evm/utils/evm-dapp.utils';

export type EvmDappConnectionAccount = {
  address: string;
  account?: EvmAccount;
};

export type EvmDappConnectionChain = {
  chainId: string;
  chain?: Chain;
};

export type EvmDappConnection = {
  subdomain: string;
  sourceKeys: string[];
  accounts: EvmDappConnectionAccount[];
  chains: EvmDappConnectionChain[];
};

type UpdatedEvmDappConnectionPermissions = {
  walletPermissions: EvmWalletPermissions;
  affectedOrigins: {
    origin: string;
    prevAccounts: string[];
    nextAccounts: string[];
  }[];
};

type OriginChainWhitelist = Record<string, string[]>;
type EvmDappConnectionModalType = 'addresses' | 'chains';

const getSubdomainFromPermissionKey = (permissionKey: string) => {
  return getHostnameFromUrl(permissionKey) ?? permissionKey;
};

const parseEvmDappsLogoMap = (raw: unknown): Record<string, string> => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {};
  }
  return raw as Record<string, string>;
};

export const parseEvmOriginChainWhitelist = (
  raw: unknown,
): OriginChainWhitelist => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {};
  }

  const whitelist: OriginChainWhitelist = {};
  for (const [origin, chainIds] of Object.entries(
    raw as Record<string, unknown>,
  )) {
    if (!Array.isArray(chainIds)) continue;

    const normalizedChainIds = chainIds
      .map((chainId) => normalizeEvmChainId(chainId))
      .filter((chainId): chainId is string => !!chainId);

    if (normalizedChainIds.length) {
      whitelist[origin] = [...new Set(normalizedChainIds)];
    }
  }

  return whitelist;
};

const parseEvmChains = (raw: unknown): Chain[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (chain): chain is Chain =>
      !!chain &&
      typeof chain === 'object' &&
      typeof (chain as Chain).chainId === 'string' &&
      typeof (chain as Chain).name === 'string',
  );
};

export const removeEvmDappConnectionAccounts = (
  walletPermissions: EvmWalletPermissions | undefined,
  subdomain: string,
  address?: string,
): UpdatedEvmDappConnectionPermissions => {
  const updatedWalletPermissions: EvmWalletPermissions = {
    ...(walletPermissions ?? {}),
  };
  const normalizedAddress = normalizeEvmAccounts(address ? [address] : [])[0];
  const affectedOrigins: UpdatedEvmDappConnectionPermissions['affectedOrigins'] =
    [];

  for (const [permissionKey, permissions] of Object.entries(
    updatedWalletPermissions,
  )) {
    if (getSubdomainFromPermissionKey(permissionKey) !== subdomain) {
      continue;
    }

    const prevAccounts = normalizeEvmAccounts(
      permissions?.[EvmRequestPermission.ETH_ACCOUNTS],
    );
    if (!prevAccounts.length) {
      continue;
    }

    const nextAccounts = normalizedAddress
      ? prevAccounts.filter((account) => account !== normalizedAddress)
      : [];
    const updatedPermissions = { ...permissions };

    if (nextAccounts.length) {
      updatedPermissions[EvmRequestPermission.ETH_ACCOUNTS] = nextAccounts;
    } else {
      delete updatedPermissions[EvmRequestPermission.ETH_ACCOUNTS];
    }

    updatedWalletPermissions[permissionKey] = updatedPermissions;

    const origin = getOriginFromUrl(permissionKey);
    if (origin) {
      affectedOrigins.push({ origin, prevAccounts, nextAccounts });
    }
  }

  return { walletPermissions: updatedWalletPermissions, affectedOrigins };
};

export const getEvmDappConnections = (
  walletPermissions: EvmWalletPermissions | undefined,
  localAccounts: EvmAccount[],
  originChainWhitelist: OriginChainWhitelist = {},
  chains: Chain[] = [],
): EvmDappConnection[] => {
  if (!walletPermissions || typeof walletPermissions !== 'object') return [];

  const accountByAddress = new Map(
    localAccounts.map((account) => [
      account.wallet.address.toLowerCase(),
      account,
    ]),
  );
  const addressesBySubdomain = new Map<string, Set<string>>();
  const sourceKeysBySubdomain = new Map<string, Set<string>>();
  const chainIdsBySubdomain = new Map<string, Set<string>>();
  const chainById = new Map(
    chains.map((chain) => [chain.chainId.toLowerCase(), chain]),
  );

  for (const [permissionKey, permissions] of Object.entries(
    walletPermissions,
  )) {
    const subdomain = getSubdomainFromPermissionKey(permissionKey);
    const connectedAddresses = normalizeEvmAccounts(
      permissions?.[EvmRequestPermission.ETH_ACCOUNTS],
    );

    if (!connectedAddresses.length) {
      continue;
    }

    if (!addressesBySubdomain.has(subdomain)) {
      addressesBySubdomain.set(subdomain, new Set<string>());
    }
    if (!sourceKeysBySubdomain.has(subdomain)) {
      sourceKeysBySubdomain.set(subdomain, new Set<string>());
    }

    const savedAddresses = addressesBySubdomain.get(subdomain)!;
    for (const address of connectedAddresses) {
      savedAddresses.add(address);
    }
    sourceKeysBySubdomain.get(subdomain)!.add(permissionKey);
  }

  for (const [origin, chainIds] of Object.entries(originChainWhitelist)) {
    const subdomain = getSubdomainFromPermissionKey(origin);
    if (!addressesBySubdomain.has(subdomain)) {
      continue;
    }

    if (!chainIdsBySubdomain.has(subdomain)) {
      chainIdsBySubdomain.set(subdomain, new Set<string>());
    }

    const savedChainIds = chainIdsBySubdomain.get(subdomain)!;
    for (const chainId of chainIds) {
      const normalizedChainId = normalizeEvmChainId(chainId);
      if (normalizedChainId) savedChainIds.add(normalizedChainId);
    }
  }

  return [...addressesBySubdomain.entries()]
    .map(([subdomain, connectedAddresses]) => ({
      subdomain,
      sourceKeys: [...(sourceKeysBySubdomain.get(subdomain) ?? [])],
      accounts: [...connectedAddresses].map((address) => ({
        address,
        account: accountByAddress.get(address),
      })),
      chains: [...(chainIdsBySubdomain.get(subdomain) ?? [])].map(
        (chainId) => ({
          chainId,
          chain: chainById.get(chainId),
        }),
      ),
    }))
    .filter((connection) => connection.accounts.length > 0)
    .sort((left, right) =>
      left.subdomain.localeCompare(right.subdomain, undefined, {
        sensitivity: 'base',
      }),
    );
};

export const removeEvmDappConnectionChains = (
  originChainWhitelist: OriginChainWhitelist | undefined,
  subdomain: string,
  chainId?: string,
): OriginChainWhitelist => {
  const updatedWhitelist: OriginChainWhitelist = {
    ...(originChainWhitelist ?? {}),
  };
  const normalizedChainId = normalizeEvmChainId(chainId);

  for (const [origin, chainIds] of Object.entries(updatedWhitelist)) {
    if (getSubdomainFromPermissionKey(origin) !== subdomain) {
      continue;
    }

    const nextChainIds = normalizedChainId
      ? chainIds.filter(
          (allowedChainId) => allowedChainId !== normalizedChainId,
        )
      : [];

    if (nextChainIds.length) {
      updatedWhitelist[origin] = nextChainIds;
    } else {
      delete updatedWhitelist[origin];
    }
  }

  return updatedWhitelist;
};

const EvmDappsConnections = ({
  accounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [connections, setConnections] = useState<EvmDappConnection[]>([]);
  const [dappLogos, setDappLogos] = useState<Record<string, string>>({});
  const [expandedSubdomain, setExpandedSubdomain] = useState<string>();
  const [selectedConnection, setSelectedConnection] =
    useState<EvmDappConnection>();
  const [selectedModalType, setSelectedModalType] =
    useState<EvmDappConnectionModalType>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_menu_dapps_connections',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, [setTitleContainerProperties]);

  useEffect(() => {
    initConnections();
  }, [accounts]);

  const initConnections = async () => {
    const storage = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
      LocalStorageKeyEnum.EVM_DAPPS_LOGO,
      LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
      LocalStorageKeyEnum.DEFAULT_CHAINS,
      LocalStorageKeyEnum.CUSTOM_CHAINS,
    ]);
    const walletPermissions =
      storage[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS];
    setDappLogos(
      parseEvmDappsLogoMap(storage[LocalStorageKeyEnum.EVM_DAPPS_LOGO]),
    );
    const originChainWhitelist = parseEvmOriginChainWhitelist(
      storage[LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST],
    );
    const chains = [
      ...parseEvmChains(storage[LocalStorageKeyEnum.DEFAULT_CHAINS]),
      ...parseEvmChains(storage[LocalStorageKeyEnum.CUSTOM_CHAINS]),
    ];

    const nextConnections = getEvmDappConnections(
      walletPermissions,
      accounts,
      originChainWhitelist,
      chains,
    );
    setConnections(nextConnections);
    setSelectedConnection((currentConnection) => {
      if (!currentConnection) return undefined;
      return nextConnections.find(
        (connection) => connection.subdomain === currentConnection.subdomain,
      );
    });
  };

  const updateConnectionsForSelectedSubdomain = async (address?: string) => {
    if (!selectedConnection) return;

    const walletPermissions = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
    );
    const { walletPermissions: updatedWalletPermissions, affectedOrigins } =
      removeEvmDappConnectionAccounts(
        walletPermissions,
        selectedConnection.subdomain,
        address,
      );

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
      updatedWalletPermissions,
    );
    await Promise.all(
      affectedOrigins.map(({ origin, prevAccounts, nextAccounts }) =>
        emitAccountsChangedIfNeeded(origin, prevAccounts, nextAccounts),
      ),
    );

    await initConnections();
  };

  const updateChainsForSelectedSubdomain = async (chainId?: string) => {
    if (!selectedConnection) return;

    const originChainWhitelist = parseEvmOriginChainWhitelist(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
      ),
    );
    const updatedWhitelist = removeEvmDappConnectionChains(
      originChainWhitelist,
      selectedConnection.subdomain,
      chainId,
    );

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.EVM_ORIGIN_CHAIN_WHITELIST,
      updatedWhitelist,
    );

    await initConnections();
  };

  const closePopup = () => {
    setSelectedConnection(undefined);
    setSelectedModalType(undefined);
  };

  const openPopup = (
    connection: EvmDappConnection,
    modalType: EvmDappConnectionModalType,
  ) => {
    setSelectedConnection(connection);
    setSelectedModalType(modalType);
  };

  return (
    <div
      className="evm-dapps-connections-page"
      data-testid="evm-dapps-connections-page">
      <Card className="evm-dapps-connections-card">
        {connections.length > 0 ? (
          <div className="evm-dapps-connections-list">
            {connections.map((connection) => (
              <div
                className="evm-dapps-connections-item"
                data-testid="evm-dapps-connection"
                key={connection.subdomain}
                role="button"
                tabIndex={0}
                onClick={() =>
                  setExpandedSubdomain((currentSubdomain) =>
                    currentSubdomain === connection.subdomain
                      ? undefined
                      : connection.subdomain,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  setExpandedSubdomain((currentSubdomain) =>
                    currentSubdomain === connection.subdomain
                      ? undefined
                      : connection.subdomain,
                  );
                }}>
                <div className="evm-dapps-connections-item-main">
                  <img
                    className="evm-dapps-connections-favicon"
                    data-testid="evm-dapps-connection-favicon"
                    src={EvmDappUtils.getEvmDappConnectionIconUrl(
                      connection.subdomain,
                      dappLogos,
                    )}
                    alt=""
                  />
                  <div
                    className="evm-dapps-connections-subdomain"
                    data-testid="evm-dapps-connection-subdomain">
                    {connection.subdomain}
                  </div>
                </div>
                {expandedSubdomain === connection.subdomain && (
                  <div className="evm-dapps-connections-actions">
                    <ButtonComponent
                      type={ButtonType.ALTERNATIVE}
                      height="small"
                      dataTestId="evm-dapps-open-addresses"
                      label="evm_dapps_connections_addresses_option"
                      onClick={(event) => {
                        event.stopPropagation();
                        openPopup(connection, 'addresses');
                      }}
                    />
                    <ButtonComponent
                      type={ButtonType.ALTERNATIVE}
                      height="small"
                      dataTestId="evm-dapps-open-chains"
                      label="evm_dapps_connections_chains_option"
                      onClick={(event) => {
                        event.stopPropagation();
                        openPopup(connection, 'chains');
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="evm-dapps-connections-empty"
            data-testid="evm-dapps-connections-empty">
            {chrome.i18n.getMessage('evm_dapps_connections_empty')}
          </div>
        )}
      </Card>
      {selectedConnection && selectedModalType && (
        <PopupContainer
          className="dapp-status-details"
          onClickOutside={closePopup}>
          <div className="dapp-status-details-wrapper">
            <div className="popup-title">
              <img
                className="evm-dapps-connections-favicon"
                alt=""
                src={EvmDappUtils.getEvmDappConnectionIconUrl(
                  selectedConnection.subdomain,
                  dappLogos,
                )}
              />
              <div className="domain">{selectedConnection.subdomain}</div>
              <SVGIcon icon={SVGIcons.TOP_BAR_CLOSE_BTN} onClick={closePopup} />
            </div>
            {selectedModalType === 'addresses' ? (
              <>
                <div className="caption">
                  {chrome.i18n.getMessage('popup_html_evm_dapp_status_caption')}
                </div>
                <div className="accounts-section">
                  <div className="account-section-title">
                    {chrome.i18n.getMessage(
                      'popup_html_evm_dapp_status_connected_accounts',
                    )}
                  </div>
                  {selectedConnection.accounts.map(({ address, account }) => (
                    <div
                      className="account-section-item"
                      data-testid="evm-dapps-modal-connected-account"
                      key={address}>
                      {account ? (
                        <EvmAccountDisplayComponent
                          account={account}
                          fullName
                        />
                      ) : (
                        <div
                          className="evm-dapps-connections-stale-account"
                          data-testid="evm-dapps-stale-account">
                          <DappStatusComponent address={address} />
                          <div className="evm-dapps-connections-stale-account-info">
                            <div className="evm-dapps-connections-stale-account-name">
                              {chrome.i18n.getMessage(
                                'evm_dapps_connections_unknown_account',
                              )}
                            </div>
                            <div className="evm-dapps-connections-stale-account-address">
                              {EvmFormatUtils.formatAddress(address)}
                            </div>
                          </div>
                        </div>
                      )}
                      <SVGIcon
                        icon={SVGIcons.GLOBAL_ERROR}
                        className="account-section-icon"
                        onClick={() =>
                          updateConnectionsForSelectedSubdomain(address)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="dapp-status-details-footer">
                  <ButtonComponent
                    type={ButtonType.IMPORTANT}
                    height="small"
                    label="popup_html_evm_dapp_status_disconnect_all"
                    onClick={() => updateConnectionsForSelectedSubdomain()}
                    dataTestId="evm-dapps-disconnect-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="caption">
                  {chrome.i18n.getMessage(
                    'evm_dapps_connections_chains_caption',
                  )}
                </div>
                <div className="accounts-section">
                  <div className="account-section-title">
                    {chrome.i18n.getMessage(
                      'evm_dapps_connections_allowed_chains',
                    )}
                  </div>
                  {selectedConnection.chains.length > 0 ? (
                    selectedConnection.chains.map(({ chainId, chain }) => (
                      <div
                        className="account-section-item"
                        data-testid="evm-dapps-modal-connected-chain"
                        key={chainId}>
                        <div className="evm-dapps-connections-chain">
                          <ChainLogo
                            className="evm-dapps-connections-favicon"
                            chainName={chain?.name ?? chainId}
                            logoUri={chain?.logo}
                          />
                          <div className="evm-dapps-connections-chain-info">
                            <div className="evm-dapps-connections-chain-name">
                              {chain?.name ??
                                chrome.i18n.getMessage(
                                  'evm_dapps_connections_unknown_chain',
                                )}
                            </div>
                            <div className="evm-dapps-connections-chain-id">
                              {chainId}
                            </div>
                          </div>
                        </div>
                        <SVGIcon
                          icon={SVGIcons.GLOBAL_ERROR}
                          className="account-section-icon"
                          onClick={() =>
                            updateChainsForSelectedSubdomain(chainId)
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      className="evm-dapps-connections-empty"
                      data-testid="evm-dapps-no-chains">
                      {chrome.i18n.getMessage(
                        'evm_dapps_connections_no_chains',
                      )}
                    </div>
                  )}
                </div>
                {selectedConnection.chains.length > 0 && (
                  <div className="dapp-status-details-footer">
                    <ButtonComponent
                      type={ButtonType.IMPORTANT}
                      height="small"
                      label="evm_dapps_connections_remove_all_chains"
                      onClick={() => updateChainsForSelectedSubdomain()}
                      dataTestId="evm-dapps-remove-all-chains"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </PopupContainer>
      )}
    </div>
  );
};

const connector = connect(
  (state: RootState) => ({
    accounts: state.evm.accounts,
  }),
  {
    setTitleContainerProperties,
  },
);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmDappsConnectionsComponent = connector(EvmDappsConnections);

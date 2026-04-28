import { Card } from '@common-ui/card/card.component';
import { emitAccountsChangedIfNeeded } from '@background/evm/evm-provider-state.utils';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmWalletPermissions } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { DappStatusComponent } from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import {
  getHostnameFromUrl,
  getOriginFromUrl,
} from 'src/utils/browser-origin.utils';
import { normalizeEvmAccounts } from 'src/utils/evm-provider-value.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

export type EvmDappConnectionAccount = {
  address: string;
  account?: EvmAccount;
};

export type EvmDappConnection = {
  subdomain: string;
  sourceKeys: string[];
  accounts: EvmDappConnectionAccount[];
};

type UpdatedEvmDappConnectionPermissions = {
  walletPermissions: EvmWalletPermissions;
  affectedOrigins: {
    origin: string;
    prevAccounts: string[];
    nextAccounts: string[];
  }[];
};

const getSubdomainFromPermissionKey = (permissionKey: string) => {
  return getHostnameFromUrl(permissionKey) ?? permissionKey;
};

export const getEvmDappFaviconUrl = (subdomain: string) => {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    subdomain,
  )}&sz=256`;
};

const parseEvmDappsLogoMap = (raw: unknown): Record<string, string> => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {};
  }
  return raw as Record<string, string>;
};

/** Prefer logo stored at connect time (`EVM_DAPPS_LOGO`), else Google favicon URL. */
export const getEvmDappConnectionIconUrl = (
  subdomain: string,
  savedLogos?: Record<string, string> | null,
) => {
  const saved = savedLogos?.[subdomain]?.trim();
  if (saved) {
    return saved;
  }
  return getEvmDappFaviconUrl(subdomain);
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

  return [...addressesBySubdomain.entries()]
    .map(([subdomain, connectedAddresses]) => ({
      subdomain,
      sourceKeys: [...(sourceKeysBySubdomain.get(subdomain) ?? [])],
      accounts: [...connectedAddresses].map((address) => ({
        address,
        account: accountByAddress.get(address),
      })),
    }))
    .filter((connection) => connection.accounts.length > 0)
    .sort((left, right) =>
      left.subdomain.localeCompare(right.subdomain, undefined, {
        sensitivity: 'base',
      }),
    );
};

const EvmDappsConnections = ({
  accounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [connections, setConnections] = useState<EvmDappConnection[]>([]);
  const [dappLogos, setDappLogos] = useState<Record<string, string>>({});
  const [selectedConnection, setSelectedConnection] =
    useState<EvmDappConnection>();

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
    ]);
    const walletPermissions =
      storage[LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS];
    setDappLogos(parseEvmDappsLogoMap(storage[LocalStorageKeyEnum.EVM_DAPPS_LOGO]));

    const nextConnections = getEvmDappConnections(walletPermissions, accounts);
    setConnections(nextConnections);
    setSelectedConnection((currentConnection) => {
      if (!currentConnection) return undefined;
      return nextConnections.find(
        (connection) =>
          connection.subdomain === currentConnection.subdomain,
      );
    });
  };

  const updateConnectionsForSelectedSubdomain = async (address?: string) => {
    if (!selectedConnection) return;

    const walletPermissions =
      await LocalStorageUtils.getValueFromLocalStorage(
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

    const nextConnections = getEvmDappConnections(
      updatedWalletPermissions,
      accounts,
    );
    setConnections(nextConnections);
    setSelectedConnection(
      nextConnections.find(
        (connection) =>
          connection.subdomain === selectedConnection.subdomain,
      ),
    );
  };

  return (
    <div
      className="evm-dapps-connections-page"
      data-testid="evm-dapps-connections-page">
      <Card className="evm-dapps-connections-card">
        {connections.length > 0 ? (
          <div className="evm-dapps-connections-list">
            {connections.map((connection) => (
              <button
                type="button"
                className="evm-dapps-connections-item"
                data-testid="evm-dapps-connection"
                key={connection.subdomain}
                onClick={() => setSelectedConnection(connection)}>
                <img
                  className="evm-dapps-connections-favicon"
                  data-testid="evm-dapps-connection-favicon"
                  src={getEvmDappConnectionIconUrl(connection.subdomain, dappLogos)}
                  alt=""
                />
                <div
                  className="evm-dapps-connections-subdomain"
                  data-testid="evm-dapps-connection-subdomain">
                  {connection.subdomain}
                </div>
              </button>
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
      {selectedConnection && (
        <PopupContainer
          className="dapp-status-details"
          onClickOutside={() => setSelectedConnection(undefined)}>
          <div className="dapp-status-details-wrapper">
            <div className="popup-title">
              <img
                className="evm-dapps-connections-favicon"
                alt=""
                src={getEvmDappConnectionIconUrl(
                  selectedConnection.subdomain,
                  dappLogos,
                )}
              />
              <div className="domain">{selectedConnection.subdomain}</div>
              <SVGIcon
                icon={SVGIcons.TOP_BAR_CLOSE_BTN}
                onClick={() => setSelectedConnection(undefined)}
              />
            </div>
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
                    <EvmAccountDisplayComponent account={account} fullName />
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
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              height="tall"
              label="popup_html_evm_dapp_status_disconnect_all"
              onClick={() => updateConnectionsForSelectedSubdomain()}
              dataTestId="evm-dapps-disconnect-all"
            />
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

import {
  NoConfirm,
  NoConfirmWebsite,
  NoConfirmWebsiteOperation,
} from '@interfaces/no-confirm.interface';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Card } from 'src/common-ui/card/card.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export type HiveAccountDappConnection = {
  domain: string;
  operations: string[];
};

type HiveAccountOption = OptionItem & {
  value: string;
};

const getReadableOperation = (operation: string) =>
  I18nUtils.getMessage(
    `popup_${operation
      .split(/(?=[A-Z])/)
      .join('_')
      .toLowerCase()}`,
  ) || operation;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasWhitelistedOperation = (operations: NoConfirmWebsiteOperation) => {
  return Object.values(operations).some((isWhitelisted) => isWhitelisted);
};

const cloneNoConfirm = (noConfirm: NoConfirm | undefined): NoConfirm => {
  if (!isRecord(noConfirm)) {
    return {};
  }

  const clonedNoConfirm: NoConfirm = {};

  for (const [username, websites] of Object.entries(noConfirm)) {
    if (!isRecord(websites)) {
      continue;
    }

    const clonedWebsites: NoConfirmWebsite = {};

    for (const [domain, operations] of Object.entries(websites)) {
      if (!isRecord(operations)) {
        continue;
      }

      clonedWebsites[domain] = { ...operations } as NoConfirmWebsiteOperation;
    }

    if (Object.keys(clonedWebsites).length) {
      clonedNoConfirm[username] = clonedWebsites;
    }
  }

  return clonedNoConfirm;
};

export const getHiveDappFaviconUrl = (domain: string) => {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    domain,
  )}&sz=256`;
};

export const getHiveAccountDappConnections = (
  noConfirm: NoConfirm | undefined,
  accountName?: string,
): HiveAccountDappConnection[] => {
  if (!accountName || !isRecord(noConfirm?.[accountName])) {
    return [];
  }

  return Object.entries(noConfirm[accountName])
    .map(([domain, operations]) => ({
      domain,
      operations: isRecord(operations)
        ? Object.entries(operations)
            .filter(([, isWhitelisted]) => isWhitelisted === true)
            .map(([operation]) => operation)
            .sort((left, right) => left.localeCompare(right))
        : [],
    }))
    .filter((connection) => connection.operations.length > 0)
    .sort((left, right) =>
      left.domain.localeCompare(right.domain, undefined, {
        sensitivity: 'base',
      }),
    );
};

export const removeHiveAccountDappOperation = (
  noConfirm: NoConfirm | undefined,
  accountName: string | undefined,
  domain: string,
  operation: string,
): NoConfirm => {
  const nextNoConfirm = cloneNoConfirm(noConfirm);
  if (!accountName || !nextNoConfirm[accountName]?.[domain]) {
    return nextNoConfirm;
  }

  delete nextNoConfirm[accountName][domain][operation];

  if (!hasWhitelistedOperation(nextNoConfirm[accountName][domain])) {
    delete nextNoConfirm[accountName][domain];
  }
  if (!Object.keys(nextNoConfirm[accountName]).length) {
    delete nextNoConfirm[accountName];
  }

  return nextNoConfirm;
};

export const removeHiveAccountDappPermissions = (
  noConfirm: NoConfirm | undefined,
  accountName: string | undefined,
  domain: string,
): NoConfirm => {
  const nextNoConfirm = cloneNoConfirm(noConfirm);
  if (!accountName || !nextNoConfirm[accountName]?.[domain]) {
    return nextNoConfirm;
  }

  delete nextNoConfirm[accountName][domain];

  if (!Object.keys(nextNoConfirm[accountName]).length) {
    delete nextNoConfirm[accountName];
  }

  return nextNoConfirm;
};

const SettingsHiveDappsPage = ({
  accounts,
  activeAccountName,
}: PropsFromRedux) => {
  const [selectedAccountName, setSelectedAccountName] =
    useState(activeAccountName ?? accounts[0]?.name);
  const [noConfirm, setNoConfirm] = useState<NoConfirm>({});

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!selectedAccountName && activeAccountName) {
      setSelectedAccountName(activeAccountName);
    }
  }, [activeAccountName, selectedAccountName]);

  useEffect(() => {
    if (
      selectedAccountName &&
      accountOptions.some(
        (accountOption) => accountOption.value === selectedAccountName,
      )
    ) {
      return;
    }

    setSelectedAccountName(activeAccountName ?? accounts[0]?.name);
  }, [accounts, activeAccountName, selectedAccountName]);

  const init = async () => {
    setNoConfirm(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.NO_CONFIRM,
      )) ?? {},
    );
  };

  const saveNoConfirm = async (nextNoConfirm: NoConfirm) => {
    setNoConfirm(nextNoConfirm);
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
      nextNoConfirm,
    );
  };

  const removeOperation = async (domain: string, operation: string) => {
    await saveNoConfirm(
      removeHiveAccountDappOperation(
        noConfirm,
        selectedAccountName,
        domain,
        operation,
      ),
    );
  };

  const removeDomainPermissions = async (domain: string) => {
    await saveNoConfirm(
      removeHiveAccountDappPermissions(noConfirm, selectedAccountName, domain),
    );
  };

  const connections = getHiveAccountDappConnections(
    noConfirm,
    selectedAccountName,
  );
  const removeAllLabel = I18nUtils.getMessage(
    'hive_dapps_connections_remove_all',
  );

  return (
    <div className="settings-hive-dapps-page">
      {selectedAccountOption && (
        <div className="settings-hive-account-select-panel">
          <ComplexeCustomSelect
            options={accountOptions}
            selectedItem={selectedAccountOption}
            setSelectedItem={(option) => setSelectedAccountName(option.value)}
            background="white"
          />
        </div>
      )}
      <Card className="settings-hive-dapps-card">
        {connections.length > 0 ? (
          <div className="settings-hive-dapps-list">
            {connections.map((connection) => (
              <div
                className="settings-hive-dapps-site"
                data-testid="hive-dapps-connection"
                key={connection.domain}>
                <div className="settings-hive-dapps-site-header">
                  <div className="settings-hive-dapps-site-identity">
                    <img
                      className="settings-hive-dapps-favicon"
                      data-testid="hive-dapps-connection-favicon"
                      src={getHiveDappFaviconUrl(connection.domain)}
                      alt=""
                    />
                    <div
                      className="settings-hive-dapps-site-title"
                      data-testid="hive-dapps-connection-domain">
                      {connection.domain}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="settings-hive-dapps-remove-domain"
                    data-testid="hive-dapps-remove-domain"
                    title={removeAllLabel}
                    aria-label={removeAllLabel}
                    onClick={() =>
                      removeDomainPermissions(connection.domain)
                    }>
                    <SVGIcon icon={SVGIcons.GLOBAL_DELETE} />
                  </button>
                </div>
                <div className="settings-hive-dapps-permissions">
                  <div className="settings-hive-dapps-tags">
                    {connection.operations.map((operation) => (
                      <button
                        key={`${connection.domain}-${operation}`}
                        type="button"
                        className="settings-hive-dapps-tag"
                        data-testid="hive-whitelisted-operation-tag"
                        onClick={() =>
                          removeOperation(connection.domain, operation)
                        }>
                        <span>{getReadableOperation(operation)}</span>
                        <SVGIcon icon={SVGIcons.GLOBAL_DELETE} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="settings-hive-dapps-empty"
            data-testid="hive-dapps-connections-empty">
            {I18nUtils.getMessage('popup_html_no_pref')}
          </div>
        )}
      </Card>
    </div>
  );
};

const connector = connect((state: RootState) => ({
  accounts: state.hive.accounts,
  activeAccountName: state.hive.activeAccount.name,
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsHiveDappsPageComponent = connector(SettingsHiveDappsPage);

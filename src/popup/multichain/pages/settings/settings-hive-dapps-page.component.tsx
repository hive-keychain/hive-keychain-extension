import { NoConfirm, NoConfirmWebsite } from '@interfaces/no-confirm.interface';
import { SelectAccountSectionComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section.component';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { removeFromWhitelist } from 'src/utils/preferences.utils';

const getReadableOperation = (operation: string) =>
  chrome.i18n.getMessage(
    `popup_${operation
      .split(/(?=[A-Z])/)
      .join('_')
      .toLowerCase()}`,
  ) || operation;

const SettingsHiveDappsPage = ({ activeAccount }: PropsFromRedux) => {
  const [noConfirm, setNoConfirm] = useState<NoConfirm>({});
  const [websites, setWebsites] = useState<NoConfirmWebsite>({});

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setWebsites(noConfirm[activeAccount.name!] ?? {});
  }, [activeAccount, noConfirm]);

  const init = async () => {
    setNoConfirm(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.NO_CONFIRM,
      )) ?? {},
    );
  };

  const removeOperation = (website: string, operation: string) => {
    const nextNoConfirm = removeFromWhitelist(
      { ...noConfirm },
      activeAccount.name!,
      website,
      operation,
    );
    setNoConfirm(nextNoConfirm);
  };

  return (
    <div className="settings-hive-dapps-page">
      <SelectAccountSectionComponent fullSize background="white" />
      {Object.keys(websites).length > 0 ? (
        <div className="settings-hive-dapps-list">
          {Object.entries(websites).map(([website, operations]) => (
            <div className="settings-hive-dapps-site" key={website}>
              <div className="settings-hive-dapps-site-title">{website}</div>
              <div className="settings-hive-dapps-tags">
                {Object.keys(operations).map((operation) => (
                  <button
                    key={`${website}-${operation}`}
                    type="button"
                    className="settings-hive-dapps-tag"
                    data-testid="hive-whitelisted-operation-tag"
                    onClick={() => removeOperation(website, operation)}>
                    <span>{getReadableOperation(operation)}</span>
                    <SVGIcon icon={SVGIcons.GLOBAL_ERROR} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="settings-empty-state">
          {chrome.i18n.getMessage('popup_html_no_pref')}
        </div>
      )}
    </div>
  );
};

const connector = connect((state: RootState) => ({
  activeAccount: state.hive.activeAccount,
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const SettingsHiveDappsPageComponent = connector(SettingsHiveDappsPage);

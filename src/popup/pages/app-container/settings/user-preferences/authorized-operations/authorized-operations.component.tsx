import { NoConfirm, NoConfirmWebsite } from '@interfaces/no-confirm.interface';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './authorized-operations.component.scss';

const AuthorizedOperations = ({ activeAccount }: PropsFromRedux) => {
  const [noConfirm, setNoConfirm] = useState({} as NoConfirm);
  const [websites, setWebsites] = useState({} as NoConfirmWebsite);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (noConfirm) {
      setWebsites(noConfirm[activeAccount.name!]);
    }
  }, [activeAccount, noConfirm]);

  const init = async () => {
    let res = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    setNoConfirm(res);
  };

  const handleEraseButtonClick = (website: string, operation: string) => {
    const oldWebsites = websites;
    oldWebsites[website][operation] = false;
    setNoConfirm({ ...noConfirm, [activeAccount.name!]: oldWebsites });

    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
      noConfirm,
    );
  };

  return (
    <div className="authorized-operations-page">
      <PageTitleComponent
        title="popup_html_authorized_operations"
        isBackButtonEnabled={true}
      />

      <div
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_pref_info'),
        }}></div>

      <SelectAccountSectionComponent></SelectAccountSectionComponent>

      {websites && Object.keys(websites).length > 0 && (
        <div className="preferences">
          {Object.keys(websites).map((website) => (
            <div className="website" key={website}>
              <div className="name">
                {chrome.i18n.getMessage('popup_website')}: {website}
              </div>
              {Object.keys(websites[website]).map((operation) => {
                return (
                  websites[website][operation] && (
                    <div className="operation" key={operation}>
                      <div className="operation-name">{operation}</div>
                      <img
                        className="operation-action"
                        src="/assets/images/delete.png"
                        onClick={() =>
                          handleEraseButtonClick(website, operation)
                        }
                      />
                    </div>
                  )
                );
              })}
            </div>
          ))}
        </div>
      )}
      {websites && Object.keys(websites).length === 0 && (
        <div>{chrome.i18n.getMessage('popup_html_no_pref')}</div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AuthorizedOperationsComponent = connector(AuthorizedOperations);

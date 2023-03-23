import { NoConfirm, NoConfirmWebsite } from '@interfaces/no-confirm.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { removeFromWhitelist } from 'src/utils/preferences.utils';
import './authorized-operations.component.scss';

const AuthorizedOperations = ({
  activeAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [noConfirm, setNoConfirm] = useState({} as NoConfirm);
  const [websites, setWebsites] = useState({} as NoConfirmWebsite);
  const [filterWebSites, setFilterWebSites] = useState<NoConfirm>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_operations',
      isBackButtonEnabled: true,
    });
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
    console.log({ res }); //TODO to remove
  };

  const handleEraseButtonClick = (website: string, operation: string) => {
    const newList = removeFromWhitelist(
      { ...noConfirm },
      activeAccount.name!,
      website,
      operation,
    );
    setNoConfirm(newList);
  };

  const handleOnChangeFilter = (value: string) => {
    console.log({ value, websites });
    const websitesCopy = { ...websites };
    for (const website of Object.entries(websitesCopy)) {
      console.log({ website });
    }
  };

  return (
    <div
      aria-label="authorized-operations-page"
      className="authorized-operations-page">
      <div
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_pref_info'),
        }}></div>

      <SelectAccountSectionComponent></SelectAccountSectionComponent>

      {/* //TODO decide if move to a component or make a ui_common that can be re-used */}
      {/* //filter */}
      <div className="search-panel">
        <InputComponent
          ariaLabel="input-filter-box"
          type={InputType.TEXT}
          placeholder="popup_html_search"
          value={filterWebSites}
          onChange={(value) => handleOnChangeFilter(value)}
        />
        <div
          aria-label="clear-filters"
          className={'filter-button'}
          onClick={() => {}}>
          {chrome.i18n.getMessage(`popup_html_clear_filters`)}
        </div>
      </div>
      {/* //end filter */}

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
                    <div
                      aria-label={'whitelisted-operation-item'}
                      className="operation"
                      key={operation}>
                      <div className="operation-name">
                        {chrome.i18n.getMessage(
                          `popup_${operation
                            .split(/(?=[A-Z])/)
                            .join('_')
                            .toLowerCase()}`,
                        )}
                      </div>
                      <Icon
                        ariaLabel={`icon-delete-authorized-${operation}-${website}`}
                        onClick={() =>
                          handleEraseButtonClick(website, operation)
                        }
                        name={Icons.DELETE}
                        type={IconType.OUTLINED}
                        additionalClassName="operation-action"></Icon>
                    </div>
                  )
                );
              })}
            </div>
          ))}
        </div>
      )}
      {(websites && Object.keys(websites).length === 0) ||
        (!websites && (
          <div className="no_pref">
            {chrome.i18n.getMessage('popup_html_no_pref')}
          </div>
        ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AuthorizedOperationsComponent = connector(AuthorizedOperations);

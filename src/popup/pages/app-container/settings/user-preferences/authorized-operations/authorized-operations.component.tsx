import { NoConfirm, NoConfirmWebsite } from '@interfaces/no-confirm.interface';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
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
  const [filterWebSites, setFilterWebSites] = useState<NoConfirmWebsite>(
    {} as NoConfirmWebsite,
  );
  const [filterValue, setFilterValue] = useState('');

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
      setFilterWebSites(noConfirm[activeAccount.name!]);
    }
  }, [activeAccount, noConfirm]);

  useEffect(() => {
    handleOnChangeFilter(filterValue);
  }, [filterValue]);

  const init = async () => {
    let res = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    setNoConfirm(res);
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

  const handleOnChangeFilter = (valueToFilter: string) => {
    const filtered: NoConfirmWebsite = {};
    const lowerCaseValueToFilter = valueToFilter.toLowerCase();
    for (const [key, value] of Object.entries(websites)) {
      if (
        key.toLowerCase().includes(lowerCaseValueToFilter) ||
        Object.entries(value).find((operation) => {
          const readableOperation = chrome.i18n.getMessage(
            `popup_${operation[0]
              .split(/(?=[A-Z])/)
              .join('_')
              .toLowerCase()}`,
          );
          if (
            operation[0].toLowerCase().includes(lowerCaseValueToFilter) ||
            readableOperation.toLowerCase().includes(lowerCaseValueToFilter)
          )
            return true;
        })
      )
        filtered[key] = value;
    }
    setFilterWebSites(filtered);
  };

  return (
    <div
      aria-label={`${Screen.SETTINGS_AUTHORIZED_OPERATIONS}-page`}
      className="authorized-operations-page">
      <div
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_pref_info'),
        }}></div>

      <SelectAccountSectionComponent></SelectAccountSectionComponent>

      {websites && Object.keys(websites).length > 0 && (
        <div className="search-panel">
          <InputComponent
            ariaLabel="input-filter-box"
            type={InputType.TEXT}
            placeholder="popup_html_search"
            value={filterValue}
            onChange={(value) => setFilterValue(value)}
          />
          <div
            aria-label="clear-filters"
            className={'filter-button'}
            onClick={() => setFilterValue('')}>
            {chrome.i18n.getMessage(`popup_html_clear_filters`)}
          </div>
        </div>
      )}

      {filterWebSites && Object.keys(filterWebSites).length > 0 && (
        <div className="preferences">
          {Object.keys(filterWebSites).map((website) => (
            <div className="website" key={website}>
              <div className="name">
                {chrome.i18n.getMessage('popup_website')}: {website}
              </div>
              {Object.keys(filterWebSites[website]).map((operation) => {
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
      {(filterWebSites && Object.keys(filterWebSites).length === 0) ||
        (!filterWebSites && (
          <div className="no_pref">
            {chrome.i18n.getMessage('popup_html_no_pref')}
          </div>
        ))}

      {filterValue.trim().length > 0 &&
        Object.keys(filterWebSites).length === 0 && (
          <div className="no_pref">
            {chrome.i18n.getMessage('popup_html_nothing_found_using_filter')}
          </div>
        )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AuthorizedOperationsComponent = connector(AuthorizedOperations);

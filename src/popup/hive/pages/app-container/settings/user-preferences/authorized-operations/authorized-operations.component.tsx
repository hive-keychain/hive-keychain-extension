import { NoConfirm, NoConfirmWebsite } from '@interfaces/no-confirm.interface';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SelectAccountSectionComponent } from 'src/common-ui/select-account-section/select-account-section.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { removeFromWhitelist } from 'src/utils/preferences.utils';

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
    for (const [website, operations] of Object.entries(websites)) {
      if (website.toLowerCase().includes(lowerCaseValueToFilter)) {
        filtered[website] = operations;
      } else {
        const op = Object.entries(operations).find((operation) => {
          const readableOperation = chrome.i18n.getMessage(
            `popup_${operation[0]
              .split(/(?=[A-Z])/)
              .join('_')
              .toLowerCase()}`,
          );
          if (
            operation[0].toLowerCase().includes(lowerCaseValueToFilter) ||
            readableOperation.toLowerCase().includes(lowerCaseValueToFilter)
          ) {
            return true;
          }
        });
        if (op) {
          filtered[website] = { [op[0]]: op[1] };
        }
      }
    }
    setFilterWebSites(filtered);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_AUTHORIZED_OPERATIONS}-page`}
      className="authorized-operations-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_pref_info')}
      </div>

      <SelectAccountSectionComponent
        fullSize
        background="white"></SelectAccountSectionComponent>

      {websites && Object.keys(websites).length > 0 && (
        <InputComponent
          dataTestId="input-filter-box"
          type={InputType.TEXT}
          placeholder="popup_html_search"
          logo={SVGIcons.INPUT_SEARCH}
          logoPosition="right"
          value={filterValue}
          onChange={(value) => setFilterValue(value)}
        />
      )}

      {filterWebSites && Object.keys(filterWebSites).length > 0 && (
        <div className="preferences">
          {Object.keys(filterWebSites).map((website) =>
            Object.keys(filterWebSites[website]).map((operation) => {
              return (
                websites[website][operation] && (
                  <div
                    data-testid={'whitelisted-operation-item'}
                    className="operation"
                    key={operation}>
                    <div className="left-panel">
                      <div className="website">{website}</div>
                      <div className="operation-name">
                        {chrome.i18n.getMessage(
                          `popup_${operation
                            .split(/(?=[A-Z])/)
                            .join('_')
                            .toLowerCase()}`,
                        )}
                      </div>
                    </div>
                    <SVGIcon
                      dataTestId={`icon-delete-authorized-${operation}-${website}`}
                      onClick={() => handleEraseButtonClick(website, operation)}
                      icon={SVGIcons.GLOBAL_DELETE}
                      className="operation-action"></SVGIcon>
                  </div>
                )
              );
            }),
          )}
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

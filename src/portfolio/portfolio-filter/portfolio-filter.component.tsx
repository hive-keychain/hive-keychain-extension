import type { ExtendedAccount } from '@hiveio/dhive';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { UserPortfolio } from 'src/portfolio/portfolio.interface';
import LocalStorageUtils from 'src/utils/localStorage.utils';

interface Props {
  extendedAccountsList: ExtendedAccount[];
  data: UserPortfolio[];
  setFilteredPortfolioData: (filteredList: UserPortfolio[]) => void;
}

const PortfolioFilter = ({
  data,
  setFilteredPortfolioData,
  extendedAccountsList,
}: Props) => {
  const [filterValue, setFilterValue] = useState('');
  const [currentFilterList, setCurrentFilterList] = useState<string[]>([]);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    initFilter();
  }, []);

  useEffect(() => {
    const currentPortfolioUserDataList = [...data];
    if (currentFilterList.length === 0) {
      setFilteredPortfolioData(data);
    } else {
      const filteredList = currentPortfolioUserDataList.filter((item) =>
        currentFilterList.includes(item.account),
      );
      setFilteredPortfolioData(filteredList);
    }
  }, [currentFilterList]);

  const initFilter = async () => {
    const filters = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.PORTFOLIO_FILTER,
    );
    setCurrentFilterList(filters ? filters : []);
  };

  const handleAddAccountToFilter = (account: string) => {
    if (!currentFilterList.includes(account)) {
      const newFilter = [...currentFilterList, account];
      setCurrentFilterList(newFilter);
      setFilterValue('');
      saveFilterToLocalStorage(newFilter);
    }
  };

  const handleRemoveAccountFromFilter = (account: string) => {
    if (currentFilterList.includes(account)) {
      let tempCurrentFilterList = [...currentFilterList];
      tempCurrentFilterList = tempCurrentFilterList.filter(
        (filter) => filter !== account,
      );
      setCurrentFilterList(tempCurrentFilterList);

      saveFilterToLocalStorage(tempCurrentFilterList);
    }
  };

  const clearFilter = () => {
    setCurrentFilterList([]);
    saveFilterToLocalStorage([]);
  };

  const saveFilterToLocalStorage = (filters: string[]) => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.PORTFOLIO_FILTER,
      filters,
    );
  };
  if (data.length === 1) return null;
  return (
    <div className="filter-panel">
      <div className={`filter-box-container ${focus ? 'is-focused' : ''}`}>
        {currentFilterList.length > 0 &&
          currentFilterList.map((filterItem) => {
            return (
              <div key={`current-filter-${filterItem}`} className="filter-item">
                <div className="filter-item-value">{filterItem}</div>
                <SVGIcon
                  dataTestId="input-clear"
                  icon={SVGIcons.INPUT_CLEAR}
                  className={`erase-chip-icon`}
                  onClick={() => handleRemoveAccountFromFilter(filterItem)}
                />
              </div>
            );
          })}
        <input
          placeholder={chrome.i18n.getMessage('portfolio_filter_placeholder')}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-input"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddAccountToFilter(filterValue);
            }
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 250)}
        />

        {focus &&
          filterValue.trim().length > 0 &&
          extendedAccountsList.filter((acc) => acc.name.includes(filterValue))
            .length > 0 && (
            <div className="filter-box">
              {extendedAccountsList
                .filter((acc) => acc.name.includes(filterValue))
                .map((filteredAcc) => {
                  return (
                    <div
                      className="avatar-username-container cursor-pointer"
                      key={`avatar-username-filter-box-${filteredAcc.name}`}
                      onClick={() =>
                        handleAddAccountToFilter(filteredAcc.name)
                      }>
                      <PreloadedImage
                        className="user-picture"
                        src={`https://images.hive.blog/u/${filteredAcc.name}/avatar`}
                        alt={'/assets/images/accounts.png'}
                        placeholder={'/assets/images/accounts.png'}
                      />
                      <div className="account-name">{filteredAcc.name}</div>
                    </div>
                  );
                })}
            </div>
          )}
      </div>
      {currentFilterList.length > 0 && (
        <ButtonComponent
          additionalClass="clear-filter-button"
          label="portfolio_clear_filter_link"
          onClick={() => clearFilter()}
          height="small"
        />
      )}
    </div>
  );
};

export const PortfolioFilterComponent = PortfolioFilter;

import { ExtendedAccount } from '@hiveio/dhive';
import React, { useEffect, useState } from 'react';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { PortfolioUserData } from 'src/portfolio/portfolio.interface';

interface Props {
  extendedAccountsList: ExtendedAccount[];
  portfolioUserDataList: PortfolioUserData[];
  setFilteredPortfolioUserDataList: (filteredList: PortfolioUserData[]) => void;
  isReadyToShow: boolean | null | undefined;
}

const PortfolioFilterComponent = ({
  portfolioUserDataList,
  setFilteredPortfolioUserDataList,
  isReadyToShow,
  extendedAccountsList,
}: Props) => {
  const [filterValue, setFilterValue] = useState('');
  const [currentFilterList, setCurrentFilterList] = useState<string[]>([]);

  useEffect(() => {
    const currentPortfolioUserDataList = [...portfolioUserDataList];
    if (currentFilterList.length === 0) {
      setFilteredPortfolioUserDataList(portfolioUserDataList);
    } else {
      const filteredList = currentPortfolioUserDataList.filter((item) =>
        currentFilterList.includes(item.account),
      );
      setFilteredPortfolioUserDataList(filteredList);
    }
  }, [currentFilterList]);

  const handleAddAccountToFilter = (account: string) => {
    if (!currentFilterList.includes(account)) {
      setCurrentFilterList((prevList) => [...prevList, account]);
      setFilterValue('');
    }
  };

  const handleRemoveAccountFromFilter = (account: string) => {
    if (currentFilterList.includes(account)) {
      let tempCurrentFilterList = [...currentFilterList];
      tempCurrentFilterList = tempCurrentFilterList.filter(
        (filter) => filter !== account,
      );
      setCurrentFilterList(tempCurrentFilterList);
    }
  };

  return (
    <>
      <div className="filter-box-container">
        <input
          disabled={!isReadyToShow}
          placeholder="Filter account"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="filter-input"
        />
        {currentFilterList.length > 0 && (
          <div className="filter-box-list-container">
            {currentFilterList.map((currentFilter) => {
              return (
                <div
                  key={`current-filter-${currentFilter}`}
                  className="filter-item">
                  <div className="small-text">{currentFilter}</div>
                  <SVGIcon
                    dataTestId="input-clear"
                    icon={SVGIcons.INPUT_CLEAR}
                    className={`input-img erase right`}
                    onClick={() => handleRemoveAccountFromFilter(currentFilter)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {filterValue.trim().length > 0 &&
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
                    onClick={() => handleAddAccountToFilter(filteredAcc.name)}>
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
    </>
  );
};

export default PortfolioFilterComponent;

import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { FavoriteAccountsItemComponent } from '@popup/pages/app-container/settings/user-preferences/favorite-accounts/favorite-accounts-item/favorite-accounts-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import {
  FavoriteAccounts,
  FavoritesAccountLists,
  FavoriteUserUtils,
} from 'src/utils/favorite-user.utils';
import './favorite-accounts.component.scss';
//TODO customise & finish
const FavoriteAccounts = ({
  accounts,
  activeAccount,
  localAccounts,
  loadActiveAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  //   const [claimRewards, setClaimRewards] = useState(false);
  //   const [claimAccounts, setClaimAccounts] = useState(false);
  //   const [claimSavings, setClaimSavings] = useState(false);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );
  //   const claimSavingsErrorMessage =
  //     AutomatedTasksUtils.canClaimSavingsErrorMessage(activeAccount);
  //   const claimAccountErrorMessage =
  //     AutomatedTasksUtils.canClaimAccountErrorMessage(activeAccount);
  //   const claimRewardsErrorMessage =
  //     AutomatedTasksUtils.canClaimRewardsErrorMessage(activeAccount);
  const [favoriteAccountsList, setFavoriteAccountsList] =
    useState<FavoritesAccountLists>({
      favorite_users: [],
      favorite_local_accounts: [],
      favorite_exchanges: [],
    });

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_favorite_accounts',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    init();
    setOptions(
      accounts.map((account: LocalAccount) => {
        return { label: account.name, value: account.name };
      }),
    );

    setSelectedLocalAccount(activeAccount.name!);
  }, [accounts, activeAccount]);

  //   const saveClaims = async (
  //     claimRewards: boolean,
  //     claimAccounts: boolean,
  //     claimSavings: boolean,
  //   ) => {
  //     setClaimAccounts(claimAccounts);
  //     setClaimRewards(claimRewards);
  //     setClaimSavings(claimSavings);

  //     await AutomatedTasksUtils.saveClaims(
  //       claimRewards,
  //       claimAccounts,
  //       claimSavings,
  //       activeAccount.name!,
  //     );
  //   };

  const init = async () => {
    //TODO remove unused
    // const values = await AutomatedTasksUtils.getClaims(activeAccount.name!);
    // setClaimRewards(values[LocalStorageKeyEnum.CLAIM_REWARDS] ?? false);
    // setClaimAccounts(values[LocalStorageKeyEnum.CLAIM_ACCOUNTS] ?? false);
    // setClaimSavings(values[LocalStorageKeyEnum.CLAIM_SAVINGS] ?? false);

    //load actual favorites
    setFavoriteAccountsList(
      await FavoriteUserUtils.getFavoriteList(
        activeAccount.name!,
        localAccounts,
        {
          addExchanges: true,
          addSwaps: true,
        },
      ),
    );
  };

  //TODO remove after finished
  useEffect(() => {
    console.log({ favoriteAccountsList }); //TODO to remove
  }, [favoriteAccountsList]);
  //end to remove

  const handleItemClicked = (accountName: string) => {
    const itemClicked = accounts.find(
      (account: LocalAccount) => account.name === accountName,
    );
    loadActiveAccount(itemClicked!);
  };

  const customLabelRender = (
    selectProps: SelectRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        className="selected-account-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectedLocalAccount}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="selected-account-name">{selectedLocalAccount}</div>
      </div>
    );
  };
  const customItemRender = (
    selectProps: SelectItemRenderer<LocalAccountListItem>,
  ) => {
    return (
      <div
        aria-label={`select-account-item-${selectProps.item.label}`}
        className={`select-account-item ${
          selectedLocalAccount === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <img
          src={`https://images.hive.blog/u/${selectProps.item.label}/avatar`}
          onError={(e: any) => {
            e.target.onError = null;
            e.target.src = '/assets/images/accounts.png';
          }}
        />
        <div className="account-name">{selectProps.item.label}</div>
      </div>
    );
  };

  const deleteFavorite = (category: string, favoriteItem: FavoriteAccounts) => {
    console.log('Should delete: ', { category, favoriteItem }); //TODO to remove
  };

  return (
    <div aria-label="favorite-accounts-page" className="favorite-accounts-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_favorite_accounts_intro')}
      </div>
      <div className="select">
        <Select
          values={[selectedLocalAccount as any]}
          options={options}
          onChange={() => undefined}
          contentRenderer={customLabelRender}
          itemRenderer={customItemRender}
          className="select-account-select"
        />
      </div>
      <div className="favorite-accounts-list">
        <div className="title">FAVORITE USERS:</div>
        {favoriteAccountsList.favorite_users.length > 0 ? (
          favoriteAccountsList.favorite_users.map(
            (favorite) => (
              <FavoriteAccountsItemComponent
                favorite={favorite}
                deleteFavorite={deleteFavorite}
              />
            ),
            // return (
            //   //TODO move to a component
            //   <div className="favorite-accounts-item" key={favorite.account}>
            //     <div className="item">
            //       <span>
            //         {favorite.account}{' '}
            //         {favorite.subLabel
            //           ? `(${favorite.subLabel})`
            //           : `(${favorite.label})`}
            //       </span>
            //       <Icon
            //         onClick={() => deleteFavorite('favorite_users', favorite)}
            //         name={Icons.DELETE}
            //         type={IconType.OUTLINED}
            //         additionalClassName="remove-button"
            //       />
            //     </div>
            //   </div>
            // );
          )
        ) : (
          <div>No favorite users yet.</div>
        )}

        <div className="title">FAVORITE LOCAL ACCOUNTS:</div>
        {favoriteAccountsList.favorite_local_accounts.length > 0 ? (
          favoriteAccountsList.favorite_local_accounts.map(
            (favorite) => (
              <FavoriteAccountsItemComponent
                favorite={favorite}
                deleteFavorite={deleteFavorite}
              />
            ),
            // return (
            //   <div className="favorite-accounts-item" key={favorite.account}>
            //     <div className="item">
            //       <span>
            //         {favorite.account}{' '}
            //         {favorite.subLabel
            //           ? `(${favorite.subLabel})`
            //           : `(${favorite.label})`}
            //       </span>
            //       <Icon
            //         onClick={() => deleteFavorite('favorite_users', favorite)}
            //         name={Icons.DELETE}
            //         type={IconType.OUTLINED}
            //         additionalClassName="remove-button"
            //       />
            //     </div>
            //   </div>
            // );
          )
        ) : (
          <div>No favorite local accounts yet.</div>
        )}

        <div className="title">FAVORITE EXCHANGES:</div>
        {favoriteAccountsList.favorite_local_accounts.length > 0 ? (
          favoriteAccountsList.favorite_exchanges.map(
            (favorite) => (
              <FavoriteAccountsItemComponent
                favorite={favorite}
                deleteFavorite={deleteFavorite}
              />
            ),
            // return (
            //   <div className="favorite-accounts-item" key={favorite.account}>
            //     <div className="item">
            //       <span>
            //         {favorite.account}{' '}
            //         {favorite.subLabel
            //           ? `(${favorite.subLabel})`
            //           : `(${favorite.label})`}
            //       </span>
            //       <Icon
            //         onClick={() => deleteFavorite('favorite_users', favorite)}
            //         name={Icons.DELETE}
            //         type={IconType.OUTLINED}
            //         additionalClassName="remove-button"
            //       />
            //     </div>
            //   </div>
            // );
          )
        ) : (
          <div>No favorite exchanges yet.</div>
        )}

        {/* {Object.entries(favoriteAccountsList).map((category) => {
          return (
            <div>
              <div className="title">
                {category[0].split('_').join(' ').toUpperCase()}:
              </div>
              {category[1].map((favorite: FavoriteAccounts) => {
                return (
                  <div className="favorite-accounts-item">
                    <div className="item">
                      {favorite.account}{' '}
                      {favorite.subLabel
                        ? `(${favorite.subLabel})`
                        : `(${favorite.label})`}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })} */}
      </div>
      {/* <span className="title">Favorite Used store accounts</span>
      <div className="favorite-accounts-list">
        {favoriteAccountsList
          .filter((favItem) => favItem.category === 'localAccounts')
          .map((favoriteItem) => (
            <FavoriteAccountsItemComponent
              key={Math.random().toFixed(5)} //TODO update, for now random
              favorite={favoriteItem}
            />
          ))}
      </div>
      <span className="title">Favorite Used exchanges</span>
      <div className="favorite-accounts-list">
        {favoriteAccountsList
          .filter((favItem) => favItem.category === 'exchanges')
          .map((favoriteItem) => (
            <FavoriteAccountsItemComponent
              key={Math.random().toFixed(5)} //TODO update, for now random
              favorite={favoriteItem}
            />
          ))}
      </div> */}

      {/* //TODO remove unused */}
      {/* <CheckboxComponent
        ariaLabel="checkbox-autoclaim-rewards"
        title="popup_html_enable_autoclaim_rewards"
        checked={claimRewards}
        onChange={(value) => saveClaims(value, claimAccounts, claimSavings)}
        hint="popup_html_enable_autoclaim_rewards_info"
        tooltipMessage={claimRewardsErrorMessage}
        disabled={!!claimRewardsErrorMessage}
      />
      <CheckboxComponent
        ariaLabel="checkbox-autoclaim-accounts"
        title="popup_html_enable_autoclaim_accounts"
        checked={claimAccounts}
        onChange={(value) => saveClaims(claimRewards, value, claimSavings)}
        skipHintTranslation
        hint={chrome.i18n.getMessage(
          'popup_html_enable_autoclaim_accounts_info',
          [Config.claims.freeAccount.MIN_RC_PCT + ''],
        )}
        tooltipMessage={claimAccountErrorMessage}
        disabled={!!claimSavingsErrorMessage}
      />
      <CheckboxComponent
        ariaLabel="checkbox-autoclaim-savings"
        title="popup_html_enable_autoclaim_savings"
        checked={claimSavings}
        onChange={(value) => saveClaims(claimRewards, claimAccounts, value)}
        hint="popup_html_enable_autoclaim_savings_info"
        tooltipMessage={claimSavingsErrorMessage}
        disabled={!!claimSavingsErrorMessage}
      /> */}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts,
    activeAccount: state.activeAccount,
    localAccounts: state.accounts,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FavoriteAccountsComponent = connector(FavoriteAccounts);

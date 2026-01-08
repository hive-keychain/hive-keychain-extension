import { Card } from '@common-ui/card/card.component';
import { EditContactPopupComponent } from '@common-ui/contacts/edit-contact-popup/edit-contact-popup.component';
import { EditContactComponent } from '@common-ui/contacts/edit-contact/edit-contact.component';
import { LabelComponent } from '@common-ui/label/label.component';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { LocalAccountListItem } from '@interfaces/list-item.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@interfaces/screen.interface';
import { SelectAccountSectionComponent } from '@popup/hive/pages/app-container/select-account-section/select-account-section.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { loadActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { v4 } from 'uuid';

const FavoriteAccounts = ({
  accounts,
  activeAccount,
  localAccounts,
  loadActiveAccount,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const defaultOptions: LocalAccountListItem[] = [];
  const [options, setOptions] = useState(defaultOptions);
  const [selectedLocalAccount, setSelectedLocalAccount] = useState(
    accounts[0].name,
  );
  const [favoriteAccountsList, setFavoriteAccountsList] = useState<
    FavoriteAddress[]
  >([]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newFavoriteAddress, setNewFavoriteAddress] = useState<FavoriteAddress>(
    {
      address: '',
      label: '',
      id: v4(),
    },
  );

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

  const init = async () => {
    const favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );

    await FavoriteUserUtils.fixFavoriteList(favoriteUsers);

    const favorites = favoriteUsers[activeAccount.name!].map(
      (favorite: any) => ({
        address: favorite.label,
        label: favorite.subLabel!,
        id: v4(),
      }),
    );

    setFavoriteAccountsList(favorites);
  };

  const handleDeleteFavorite = (favoriteItem: FavoriteAddress) => {
    const newList = favoriteAccountsList.filter(
      (item) => item.id !== favoriteItem.id,
    );
    saveFavoriteList(newList);
  };

  const saveFavoriteList = async (list: FavoriteAddress[]) => {
    const actualFavoriteUsersLists: FavoriteUserItems[] =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.FAVORITE_USERS,
      );
    const updatedFavoriteUserLists = {
      ...actualFavoriteUsersLists,
      [activeAccount.name!]: list.map((item) => {
        return {
          label: item.address,
          subLabel: item.label,
        };
      }),
    };
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
      updatedFavoriteUserLists,
    );
    init();
  };

  const handleEditFavoriteLabel = (favoriteItem: FavoriteAddress) => {
    const newList = [...favoriteAccountsList];
    for (const item of newList) {
      if (item.id === favoriteItem.id) {
        item.label = favoriteItem.label;
        item.address = favoriteItem.address;
      }
    }
    saveFavoriteList(newList);
  };

  const resetNewFavoriteAddress = () => {
    setNewFavoriteAddress({
      address: '',
      label: '',
      id: v4(),
    });
    setIsPopupOpen(false);
  };

  const createNewFavoriteAddress = async (item: FavoriteAddress) => {
    await FavoriteUserUtils.saveFavoriteUser(
      activeAccount,
      item.address,
      item.label,
    );
    resetNewFavoriteAddress();
    init();
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_FAVORITE_ACCOUNTS}-page`}
      className="favorite-accounts-page">
      <Card>
        <div className="intro">
          {chrome.i18n.getMessage('popup_html_favorite_accounts_intro')}
        </div>
      </Card>
      <Card className="favorite-accounts-card">
        <SelectAccountSectionComponent background="white" fullSize />
        <div className="add-contact-link" onClick={() => setIsPopupOpen(true)}>
          {chrome.i18n.getMessage('evm_add_contact_link')}
        </div>

        {favoriteAccountsList && (
          <div className="edit-contacts-panel">
            <LabelComponent value="popup_html_accounts" />
            {favoriteAccountsList.map((favorite) => (
              <EditContactComponent
                key={`${favorite.address}-${favorite.id}`}
                shortAddress={false}
                favoriteAddress={favorite}
                onSaveClicked={(item) => handleEditFavoriteLabel(item)}
                onDeleteClicked={(item) => handleDeleteFavorite(item)}
                chainType={ChainType.HIVE}
              />
            ))}
          </div>
        )}
      </Card>
      {isPopupOpen && (
        <EditContactPopupComponent
          isNew={true}
          favoriteAddress={newFavoriteAddress}
          onSaveClicked={(item) => createNewFavoriteAddress(item)}
          closePopup={() => resetNewFavoriteAddress()}
          chainType={ChainType.HIVE}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.hive.accounts,
    activeAccount: state.hive.activeAccount,
    localAccounts: state.hive.accounts,
  };
};

const connector = connect(mapStateToProps, {
  loadActiveAccount,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const FavoriteAccountsComponent = connector(FavoriteAccounts);

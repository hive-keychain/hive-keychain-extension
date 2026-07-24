import { EditContactPopupComponent } from '@common-ui/contacts/edit-contact-popup/edit-contact-popup.component';
import { AddContactButton } from '@common-ui/contacts/add-contact-button/add-contact-button.component';
import { EditContactComponent } from '@common-ui/contacts/edit-contact/edit-contact.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { LabelComponent } from '@common-ui/label/label.component';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { FavoriteAddress } from '@interfaces/contacts.interface';
import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { Screen } from '@interfaces/screen.interface';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FavoriteUserUtils } from 'src/popup/hive/utils/favorite-user.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { v4 } from 'uuid';

import { I18nUtils } from 'src/utils/i18n.utils';
type HiveAccountOption = OptionItem & {
  value: string;
};

const FavoriteAccounts = ({
  accounts,
  activeAccountName,
  setTitleContainerProperties,
  titleMessageKey = 'popup_html_favorite_accounts',
}: Props) => {
  const [selectedAccountName, setSelectedAccountName] = useState(
    activeAccountName ?? accounts[0]?.name,
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

  const accountOptions: HiveAccountOption[] = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    img: `https://images.hive.blog/u/${account.name}/avatar`,
  }));
  const selectedAccountOption = accountOptions.find(
    (accountOption) => accountOption.value === selectedAccountName,
  );

  useEffect(() => {
    setTitleContainerProperties({
      title: titleMessageKey,
      isBackButtonEnabled: true,
    });
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

  useEffect(() => {
    if (selectedAccountName) {
      loadFavoriteAccounts(selectedAccountName);
    }
  }, [selectedAccountName]);

  const loadFavoriteAccounts = async (accountName: string) => {
    let favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );

    favoriteUsers = await FavoriteUserUtils.fixFavoriteList(favoriteUsers ?? {});

    const favorites = (favoriteUsers[accountName] ?? []).map((favorite: any) => ({
      address: favorite.label,
      label: favorite.subLabel ?? '',
      id: v4(),
    }));

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
      [selectedAccountName!]: list.map((item) => {
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
    loadFavoriteAccounts(selectedAccountName!);
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
      { name: selectedAccountName } as ActiveAccount,
      item.address,
      item.label,
    );
    resetNewFavoriteAddress();
    loadFavoriteAccounts(selectedAccountName!);
  };

  const openAddContactPopup = () => {
    setNewFavoriteAddress({
      address: '',
      label: '',
      id: v4(),
    });
    setIsPopupOpen(true);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_FAVORITE_ACCOUNTS}-page`}
      className="favorite-accounts-page contacts-settings-page">
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

      <div className="addresses-list">
        <div className="contact-category section-card">
          <div className="category-header">
            <LabelComponent
              value="evm_contacts_section"
              className="category-title"
            />
            <AddContactButton onClick={openAddContactPopup} />
          </div>
          {favoriteAccountsList.length > 0 ? (
            <div className="addresses-list-items">
              {favoriteAccountsList.map((favorite) => (
                <EditContactComponent
                  key={`${favorite.address}-${favorite.id}`}
                  shortAddress={false}
                  favoriteAddress={favorite}
                  maxLabelLength={12}
                  onSaveClicked={(item) => handleEditFavoriteLabel(item)}
                  onDeleteClicked={(item) => handleDeleteFavorite(item)}
                  chainType={ChainType.HIVE}
                />
              ))}
            </div>
          ) : (
            <div className="addresses-list-items">
              <div className="empty-address-item">
                {I18nUtils.getMessage(
                  'popup_html_favorite_accounts_no_favorites',
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
    activeAccountName: state.hive.activeAccount.name,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;
interface OwnProps {
  titleMessageKey?: string;
}
type Props = PropsFromRedux & OwnProps;

export const FavoriteAccountsComponent = connector(FavoriteAccounts);

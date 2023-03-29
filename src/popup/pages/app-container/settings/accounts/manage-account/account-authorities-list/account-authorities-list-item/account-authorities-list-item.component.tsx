import { Authority, AuthorityType } from '@hiveio/dhive';
import { removeKey, setAccounts } from '@popup/actions/account.actions';
import { loadActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setInfoMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  goBack,
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Key } from 'src/interfaces/keys.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
//TODO bellow change all classes to its new names
import './account-authorities-list-item.component.scss';
//TODo bellow rename as AuthoritiesListItemProps

export interface KeyListItemProps {
  //New props
  // signing: AuthorityType; //wait until cedric answer, for now commented.
  authority: AuthorityType;
  role: 'active' | 'posting';
  // memo: AuthorityType; //also wait until cedric answer, commented for now
}

const AccountAuthoritiesListItem = ({
  activeAccount,
  accounts,
  authority,
  role,
  setInfoMessage,
  navigateToWithParams,
  removeKey,
  goBack,
  loadActiveAccount,
  addToLoadingList,
  setSuccessMessage,
  setErrorMessage,
  removeFromLoadingList,
  navigateTo,
}: PropsType) => {
  //TODO: what about this empty hook?
  // useEffect(() => {}, [publicKey, privateKey]);

  //TODO move to own components: list, item
  const goTo = (accountName: string) => {
    chrome.tabs.create({ url: `https://hiveblocks.com/@${accountName}` });
  };

  const handleClickOnRemoveAccountAuth = async (
    authorizedAccountName: string,
    weight: number,
  ) => {
    const actualAccountAuths = { ...authority };
    console.log({ actualAccountAuths });
    const updatedAuthority = {
      ...actualAccountAuths,
      account_auths: {
        ...actualAccountAuths.account_auths.filter(
          (authAccount) => authAccount[0] !== authorizedAccountName,
        ),
      },
    } as AuthorityType;
    const newAuthority: Authority = new Authority({ ...updatedAuthority });
    console.log({ newAuthority });
    const copyActiveAccount = { ...activeAccount };
    copyActiveAccount.account[role] = newAuthority;
    //TODO remove this const bellow, just for testing
    const updateAccountParams: {
      username: string;
      active: Authority | undefined;
      posting: Authority | undefined;
      memo: string;
      stringifiedMetadata: string;
      key: Key;
    } = {
      username: copyActiveAccount.name!,
      active: copyActiveAccount.account.active,
      posting: copyActiveAccount.account.posting,
      memo: copyActiveAccount.account.memo_key,
      stringifiedMetadata: copyActiveAccount.account.json_metadata,
      key: activeAccount.keys.active!,
    };
    console.log({ updateAccountParams });
    //END to remove
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_remove_account_authority_message',
        [role, authorizedAccountName],
      ),
      fields: [
        { label: 'popup_html_username', value: `@${authorizedAccountName}` },
        { label: 'popup_html_role', value: `${role}` },
      ],
      title: 'popup_html_remove_account_authority',
      // formParams: getFormParams(), originally being set
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_remove_authorized_account_operation');

        try {
          //Do we need to create a new utils using owner authority or just add the param as option into updateAccount?
          let success = await AccountUtils.updateAccount(
            copyActiveAccount.name!,
            copyActiveAccount.account.active,
            copyActiveAccount.account.posting,
            copyActiveAccount.account.memo_key,
            copyActiveAccount.account.json_metadata,
            activeAccount.keys.active!,
          );
          if (success) {
            navigateTo(Screen.SETTINGS_MANAGE_ACCOUNTS_AUTHORITIES, true);
            setSuccessMessage('popup_html_remove_account_authority_successful');
          } else {
            setErrorMessage('popup_html_remove_account_authority_fail');
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList(
            'html_popup_remove_authorized_account_operation',
          );
        }
      },
    });
  };

  return (
    <div className="account-authorities-list-item">
      <div className="top-panel">
        <div className="key-name">
          {chrome.i18n.getMessage(`popup_html_${role}`)}
        </div>
      </div>
      <div className="keys-panel">
        {authority.account_auths.length === 0 && (
          <div className="account-auths-list">No auths on this key yet!</div>
        )}
        {authority.account_auths.length > 0 && (
          <div className="account-auths-list">
            <div className="titles">
              <div className="title">Username</div>
              <div className="title">Weight</div>
            </div>
            {authority.account_auths.map((accountAuth, index) => {
              return (
                <div
                  className="item"
                  key={`account-auth-item-${accountAuth[0]}-${index}`}>
                  <div className="item-account-name">
                    <div>{accountAuth[0]}</div>
                    <Icon
                      onClick={() => goTo(accountAuth[0])}
                      name={Icons.LINK}
                      type={IconType.OUTLINED}
                      additionalClassName="remove-button"
                    />
                  </div>
                  <div>{accountAuth[1]}</div>
                  <Icon
                    onClick={() =>
                      handleClickOnRemoveAccountAuth(
                        accountAuth[0],
                        accountAuth[1],
                      )
                    }
                    name={Icons.DELETE}
                    type={IconType.OUTLINED}
                    additionalClassName="remove-button"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.accounts as LocalAccount[],
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setInfoMessage,
  setAccounts,
  navigateToWithParams,
  removeKey,
  goBack,
  loadActiveAccount,
  addToLoadingList,
  setSuccessMessage,
  setErrorMessage,
  removeFromLoadingList,
  navigateTo,
});
type PropsType = ConnectedProps<typeof connector> & KeyListItemProps;

export const AccountAuthoritiesListItemComponent = connector(
  AccountAuthoritiesListItem,
);

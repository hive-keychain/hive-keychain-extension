import type { AuthorityType } from '@hiveio/dhive';
import { TransactionOptions } from '@interfaces/keys.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import {
  goBack,
  navigateToWithParams,
} from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ConfirmationPageFieldTag } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';

export interface AuthoritiesListItemProps {
  authority: AuthorityType;
  role: 'active' | 'posting';
}

const AccountAuthoritiesListItem = ({
  activeAccount,
  authority,
  role,
  navigateToWithParams,
  addToLoadingList,
  setSuccessMessage,
  setErrorMessage,
  removeFromLoadingList,
  goBack,
}: PropsType) => {
  const goTo = (accountName: string) => {
    window.open(`https://hive.blog/@${accountName}`);
  };

  const handleClickOnRemoveAccountAuth = async (
    authorizedAccountName: string,
  ) => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      message: chrome.i18n.getMessage(
        'popup_html_confirm_remove_account_authority_message',
        [role, authorizedAccountName],
      ),
      fields: [
        {
          label: 'popup_html_username',
          value: `@${authorizedAccountName}`,
          tag: ConfirmationPageFieldTag.USERNAME,
          iconPosition: 'right',
        },
        {
          label: 'popup_html_role',
          value: chrome.i18n.getMessage(`popup_html_authority_${role}`),
        },
      ],
      title: 'popup_html_remove_account_authority',
      afterConfirmAction: async (options?: TransactionOptions) => {
        addToLoadingList('html_popup_remove_authorized_account_operation');
        try {
          const updatedActiveAccountAuth =
            ActiveAccountUtils.removeAuthorizedAccount(
              activeAccount,
              role,
              authorizedAccountName,
            );
          let success = await AccountUtils.updateAccount(
            updatedActiveAccountAuth.name!,
            updatedActiveAccountAuth.account.active,
            updatedActiveAccountAuth.account.posting,
            updatedActiveAccountAuth.account.memo_key,
            updatedActiveAccountAuth.account.json_metadata,
            updatedActiveAccountAuth.keys.active!,
            options,
          );
          if (success) {
            goBack();
            if (success.isUsingMultisig) {
              setSuccessMessage('multisig_transaction_sent_to_signers');
            } else
              setSuccessMessage(
                'popup_html_remove_account_authority_successful',
              );
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
    } as ConfirmationPageParams);
  };

  return authority.account_auths.length > 0 ? (
    <div className="account-authorities-list-item">
      <div className="top-panel">
        <div className="key-name">
          <div className="name">
            {chrome.i18n.getMessage(`popup_html_authority_${role}`)}
          </div>
        </div>
      </div>
      <div className="keys-panel">
        <div className="account-auths-list">
          {authority.account_auths.map((accountAuth, index) => {
            return (
              <div
                className="item"
                key={`account-auth-item-${accountAuth[0]}-${index}`}>
                <div
                  className="item-account"
                  onClick={() => goTo(accountAuth[0])}>
                  <img
                    className="account-img"
                    src={`https://images.hive.blog/u/${accountAuth[0]}/avatar`}
                    onError={(e: any) => {
                      e.target.onError = null;
                      e.target.src = '/assets/images/accounts.png';
                    }}
                  />
                  <div className="account-name">{accountAuth[0]}</div>
                </div>
                <SVGIcon
                  className="delete-button"
                  icon={SVGIcons.GLOBAL_DELETE}
                  onClick={() => handleClickOnRemoveAccountAuth(accountAuth[0])}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setAccounts,
  navigateToWithParams,
  addToLoadingList,
  setSuccessMessage,
  setErrorMessage,
  removeFromLoadingList,
  goBack,
});
type PropsType = ConnectedProps<typeof connector> & AuthoritiesListItemProps;

export const AccountAuthoritiesListItemComponent = connector(
  AccountAuthoritiesListItem,
);

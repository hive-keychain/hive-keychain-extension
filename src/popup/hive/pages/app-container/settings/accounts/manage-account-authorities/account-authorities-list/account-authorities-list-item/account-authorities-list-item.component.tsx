import type { AuthorityType } from '@hiveio/dhive';
import { TransactionOptions } from '@interfaces/keys.interface';
import { Screen } from '@interfaces/screen.interface';
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
import { ActiveAccount } from '@interfaces/active-account.interface';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ConfirmationPageFieldType } from 'src/common-ui/confirmation-page/confirmation-field.interface';
import { ConfirmationPageParams } from 'src/common-ui/confirmation-page/confirmation-page.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { setAccounts } from 'src/popup/hive/actions/account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';

export interface AuthoritiesListItemProps {
  authority: AuthorityType;
  role: 'active' | 'posting';
  managedAccount: ActiveAccount;
}

const AccountAuthoritiesListItem = ({
  managedAccount,
  authority,
  role,
  navigateToWithParams,
  addToLoadingList,
  setSuccessMessage,
  setErrorMessage,
  removeFromLoadingList,
  goBack,
}: PropsType) => {
  const removeAuthorityLabel = chrome.i18n.getMessage(
    'popup_html_remove_account_authority',
  );

  const goTo = (accountName: string) => {
    window.open(`https://hive.blog/@${accountName}`);
  };

  const handleClickOnRemoveAccountAuth = async (
    authorizedAccountName: string,
  ) => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_remove_account_authority_message',
        [role, authorizedAccountName],
      ),
      fields: [
        {
          label: 'popup_html_username',
          value: `@${authorizedAccountName}`,
          tag: ConfirmationPageFieldType.USERNAME,
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
              managedAccount,
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
    <div className="account-authorities-list-item settings-hive-dapps-site">
      <div className="settings-hive-dapps-site-header">
        <div className="settings-hive-dapps-site-identity">
          <div className="settings-hive-dapps-site-title">
            {chrome.i18n.getMessage(`popup_html_authority_${role}`)}
          </div>
        </div>
      </div>
      <div className="settings-hive-dapps-permissions account-authorities-tags-panel">
        <div className="settings-hive-dapps-tags">
          {authority.account_auths.map((accountAuth, index) => {
            return (
              <div
                className="settings-hive-dapps-tag account-authority-tag"
                key={`account-auth-item-${accountAuth[0]}-${index}`}>
                <button
                  type="button"
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
                </button>
                <button
                  type="button"
                  className="delete-button"
                  title={removeAuthorityLabel}
                  aria-label={removeAuthorityLabel}
                  onClick={() => handleClickOnRemoveAccountAuth(accountAuth[0])}>
                  <SVGIcon icon={SVGIcons.GLOBAL_DELETE} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;
};

const connector = connect(null, {
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

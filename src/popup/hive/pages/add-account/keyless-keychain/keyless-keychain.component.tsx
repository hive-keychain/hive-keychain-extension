import { KeylessKeychainUtils } from '@background/utils/keyless-keychain.utils';
import { NamedKeylessAuthData } from '@interfaces/keyless-keychain.interface';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { ActionCardComponent } from 'src/common-ui/action-card/action-card.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Screen } from 'src/reference-data/screen.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const KeylessKeychain = ({ navigateTo }: PropsFromRedux) => {
  const [sessions, setSessions] = useState<NamedKeylessAuthData[]>([]);
  const handleLeaveKeylessKeychain = async () => {
    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_ENABLED,
      false,
    );
    await LocalStorageUtils.removeFromLocalStorage(
      LocalStorageKeyEnum.KEYLESS_KEYCHAIN_AUTH_DATA_USER_DICT,
    );

    navigateTo(Screen.ACCOUNT_PAGE_INIT_ACCOUNT, true);
  };

  useEffect(() => {
    KeylessKeychainUtils.getKeylessAuthDataUserDictionary().then((res) => {
      if (!res) return;
      const arr: NamedKeylessAuthData[] = [];
      Object.keys(res).map((key) => {
        arr.push(
          ...res[key]
            .map((e) => ({ ...e, username: key }))
            .filter((e) => !!e.expire && e.expire > Date.now() && !!e.token),
        );
      });
      setSessions(arr);
    });
  }, []);

  return (
    <div
      data-testid={`${Screen.ACCOUNT_PAGE_KEYLESS_KEYCHAIN}-page`}
      className="keyless-keychain-page">
      <PageTitleComponent
        title={'popup_html_keyless_keychain'}
        isBackButtonEnabled={false}
        isCloseButtonDisabled={true}></PageTitleComponent>
      <div className="content">
        <div className="caption">
          {chrome.i18n.getMessage('popup_html_keyless_keychain_setup')}
        </div>
      </div>
      {sessions.length && (
        <div className="keyless-sessions">
          <div className="sessions-title">
            {chrome.i18n.getMessage('popup_html_keyless_sessions')}
          </div>
          {sessions.map((session) => (
            <div className="keyless-session">
              <ActionCardComponent
                title={`@${session.username}`}
                subtitle={`${session.appName} - ${
                  session.expire &&
                  `${new Date(session.expire).toLocaleDateString()} ${
                    new Date(session.expire).toLocaleTimeString().split(' ')[0]
                  }`
                }`}
                icon={SVGIcons.GLOBAL_DELETE}
                onClickIcon={() => {
                  KeylessKeychainUtils.removeKeylessAuthData(
                    session.username,
                    session.uuid!,
                  );
                  const newSessions = sessions.filter(
                    (e) =>
                      e.username !== session.username ||
                      e.uuid !== session.uuid,
                  );
                  setSessions(newSessions);
                }}
                key={session.uuid!}
              />
            </div>
          ))}
        </div>
      )}
      <div className="button-container">
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_keyless_keychain_leave_button'}
          onClick={handleLeaveKeylessKeychain}
        />
      </div>
    </div>
  );
};
const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeylessKeychainComponent = connector(KeylessKeychain);

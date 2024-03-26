import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { Keys } from 'src/interfaces/keys.interface';
import { addAccount } from 'src/popup/hive/actions/account.actions';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';

export interface SelectKeysProps {
  keys: Keys;
  username: string;
}

const SelectKeys = ({
  keys,
  username,
  addAccount,
  setErrorMessage,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [importActive, setImportActive] = useState(keys.active ? true : false);
  const [importPosting, setImportPosting] = useState(
    keys.posting ? true : false,
  );
  const [importMemo, setImportMemo] = useState(keys.memo ? true : false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_import_keys',
      isBackButtonEnabled: true,
    });
  });

  const importKeys = (): void => {
    let keysToImport: Keys = {};
    if (importActive) {
      keysToImport.active = keys.active;
      keysToImport.activePubkey = keys.activePubkey;
    }
    if (importPosting) {
      keysToImport.posting = keys.posting;
      keysToImport.postingPubkey = keys.postingPubkey;
    }
    if (importMemo) {
      keysToImport.memo = keys.memo;
      keysToImport.memoPubkey = keys.memoPubkey;
    }

    if (!KeysUtils.hasKeys(keysToImport)) {
      setErrorMessage('popup_accounts_no_key_selected');
    } else {
      addAccount({ name: username, keys: keysToImport });
    }
  };

  return (
    <div
      className="select-keys-page"
      data-testid={`${Screen.ACCOUNT_PAGE_SELECT_KEYS}-page`}>
      <div
        data-testid="select-keys-page-caption"
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_import_success'),
        }}></div>

      <CheckboxPanelComponent
        dataTestId="checkbox-import-posting-key"
        title="popup_html_posting"
        hint="popup_html_posting_info"
        checked={importPosting}
        onChange={setImportPosting}
        disabled={keys.posting ? false : true}
        tooltipMessage={
          keys.posting ? undefined : 'popup_html_public_key_not_matching'
        }
      />
      <CheckboxPanelComponent
        dataTestId="checkbox-import-active-key"
        title="popup_html_active"
        hint="popup_html_active_info"
        checked={importActive}
        onChange={setImportActive}
        disabled={keys.active ? false : true}
        tooltipMessage={
          keys.active ? undefined : 'popup_html_public_key_not_matching'
        }
      />
      <CheckboxPanelComponent
        dataTestId="checkbox-import-memo-key"
        title="popup_html_memo"
        hint="popup_html_memo_info"
        checked={importMemo}
        onChange={setImportMemo}
        disabled={keys.memo ? false : true}
        tooltipMessage={
          keys.memo ? undefined : 'popup_html_public_key_not_matching'
        }
      />
      <div className="fill-space"></div>
      <ButtonComponent
        dataTestId="button-save"
        label="popup_html_save"
        onClick={() => importKeys()}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    keys: state.navigation.stack[0].params.keys,
    username: state.navigation.stack[0].params.username,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  addAccount,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectKeysComponent = connector(SelectKeys);

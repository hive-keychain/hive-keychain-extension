import { KeyType } from '@interfaces/keys.interface';
import { QueryParams } from '@interfaces/query-params.interface';
import { Theme } from '@popup/theme.context';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { ErrorUtils } from 'src/popup/hive/utils/error.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const AddKeyComponent = () => {
  const [username, setUsername] = useState('');
  const [keyType, setKeyType] = useState<KeyType>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  useEffect(() => {
    const queryParamsTable = window.location.search.replace('?', '').split('&');
    const q = {} as QueryParams;
    for (let params of queryParamsTable) {
      const splitParams = params.split('=');
      q[splitParams[0]] = splitParams[1];
    }
    setUsername(q['username'] || '');
    setKeyType(q['keyType'] as KeyType);
  }, []);

  const discoverAccounts = async () => {
    setLoading(true);
    try {
      if (keyType && username && (await LedgerUtils.init(true))) {
        let keysToAdd = await LedgerUtils.getKeyForAccount(keyType, username);
        await AccountUtils.addKeyFromLedger(username, keysToAdd);
        setMessage('add_key_from_ledger_sucessful');
        setDone(true);
      } else {
        Logger.error('Unable to detect Ledger');
      }
      setLoading(false);
    } catch (err: any) {
      Logger.log(err);
      setMessage(ErrorUtils.parseLedger(err).message);
      setLoading(false);
    }
  };

  const closeTab = () => {
    window.close();
  };

  return (
    <div className={`theme ${theme} connect-ledger`}>
      <div className="title-panel">
        <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
        <div className="title">
          {chrome.i18n.getMessage('add_key_from_ledger')}
        </div>
      </div>

      <div className="add-key">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('add_key_from_ledger_caption'),
          }}></div>
        <div>{chrome.i18n.getMessage(message)}</div>
        <div className="fill-space"></div>
        <ButtonComponent
          label={!done ? 'ledger_discover_key' : 'popup_html_close'}
          onClick={!done ? discoverAccounts : closeTab}
        />
      </div>
      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default AddKeyComponent;

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

import { HtmlUtils } from 'src/utils/html.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
interface AddKeyComponentProps {
  embedded?: boolean;
  keyType?: KeyType;
  username?: string;
  onKeyAdded?: () => void | Promise<void>;
  onClose?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

const AddKeyComponent = ({
  embedded = false,
  keyType: keyTypeFromProps,
  username: usernameFromProps,
  onKeyAdded,
  onClose,
  onLoadingChange,
}: AddKeyComponentProps) => {
  const [username, setUsername] = useState(usernameFromProps ?? '');
  const [keyType, setKeyType] = useState<KeyType | undefined>(
    keyTypeFromProps,
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    if (!embedded) {
      init();
    }
  }, [embedded]);

  const init = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  useEffect(() => {
    if (embedded) {
      setUsername(usernameFromProps ?? '');
      setKeyType(keyTypeFromProps);
      return;
    }

    const queryParamsTable = window.location.search.replace('?', '').split('&');
    const q = {} as QueryParams;
    for (let params of queryParamsTable) {
      const splitParams = params.split('=');
      q[splitParams[0]] = splitParams[1];
    }
    setUsername(q['username'] || '');
    setKeyType(q['keyType'] as KeyType);
  }, [embedded, keyTypeFromProps, usernameFromProps]);

  const setLedgerLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    onLoadingChange?.(isLoading);
  };

  const discoverAccounts = async () => {
    setLedgerLoading(true);
    try {
      if (keyType && username && (await LedgerUtils.init(true))) {
        let keysToAdd = await LedgerUtils.getKeyForAccount(keyType, username);
        await AccountUtils.addKeyFromLedger(username, keysToAdd);
        await onKeyAdded?.();
        setMessage('add_key_from_ledger_sucessful');
        setDone(true);
      } else {
        Logger.error('Unable to detect Ledger');
      }
      setLedgerLoading(false);
    } catch (err: any) {
      Logger.log(err);
      setMessage(ErrorUtils.parseLedger(err).message);
      setLedgerLoading(false);
    }
  };

  const closeTab = () => {
    if (onClose) {
      onClose();
      return;
    }
    window.close();
  };

  return (
    <div
      className={`${embedded ? 'embedded-ledger-page ' : `theme ${theme} `}connect-ledger`}>
      {!embedded && (
        <div className="title-panel">
          <SVGIcon icon={SVGIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
          <div className="title">
            {I18nUtils.getMessage('add_key_from_ledger')}
          </div>
        </div>
      )}

      <div className="add-key">
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: HtmlUtils.getSafeI18nHtml('add_key_from_ledger_caption'),
          }}></div>
        <div>{I18nUtils.getMessage(message)}</div>
        <div className="fill-space"></div>
        <ButtonComponent
          label={!done ? 'ledger_discover_key' : 'popup_html_close'}
          onClick={!done ? discoverAccounts : closeTab}
        />
      </div>
      {!embedded && <LoadingComponent hide={!loading} />}
    </div>
  );
};

export default AddKeyComponent;

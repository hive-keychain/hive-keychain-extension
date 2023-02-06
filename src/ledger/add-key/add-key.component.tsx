import { KeyType } from '@interfaces/keys.interface';
import { QueryParams } from '@interfaces/query-params.interface';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import AccountUtils from 'src/utils/account.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import './add-key.component.scss';

const AddKeyComponent = () => {
  const [username, setUsername] = useState('');
  const [keyType, setKeyType] = useState<KeyType>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (keyType && username && (await LedgerUtils.init())) {
        let keysToAdd = await LedgerUtils.getKeyForAccount(keyType, username);
        await AccountUtils.addKeyFromLedger(username, keysToAdd);
        setMessage('add_key_from_ledger_sucessful');
      } else {
        Logger.error('Unable to detect Ledger');
      }
      setLoading(false);
    } catch (err: any) {
      Logger.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="connect-ledger">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
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
          label="ledger_discover_key"
          onClick={discoverAccounts}
        />
      </div>
      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default AddKeyComponent;

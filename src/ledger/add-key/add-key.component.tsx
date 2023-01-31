import { KeyType } from '@interfaces/keys.interface';
import { QueryParams } from '@interfaces/query-params.interface';
import React, { useEffect, useState } from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import AccountUtils from 'src/utils/account.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import './add-key.component.scss';

const AddKeyComponent = () => {
  const [username, setUsername] = useState('');
  const [keyType, setKeyType] = useState<KeyType>();

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
    try {
      if (keyType && username && (await LedgerUtils.init())) {
        let keysToAdd = await LedgerUtils.getKeyForAccount(keyType, username);
        await AccountUtils.addKeyFromLedger(username, keysToAdd);
      } else {
        Logger.error('Unable to detect Ledger');
        return;
      }
    } catch (err: any) {
      Logger.log(err);
    }
  };

  return (
    <div className="connect-ledger">
      <div className="title-panel">
        <img src="/assets/images/iconhive.png" />
        <div className="title">
          {chrome.i18n.getMessage('html_connect_ledger')}
        </div>
      </div>

      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('hello'),
        }}></div>
      <ButtonComponent
        label="detect"
        skipLabelTranslation
        onClick={discoverAccounts}
        fixToBottom
      />
    </div>
  );
};

export default AddKeyComponent;

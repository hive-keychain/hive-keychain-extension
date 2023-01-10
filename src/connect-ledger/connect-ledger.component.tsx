import { KeyType } from '@interfaces/keys.interface';
import { QueryParams } from '@interfaces/query-params.interface';
import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import AccountUtils from 'src/utils/account.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import Logger from 'src/utils/logger.utils';
import './connect-ledger.component.scss';

const ConnectLedger = () => {
  const initializeLedger = async () => {
    const queryParamsTable = window.location.search.replace('?', '').split('&');
    const queryParams = {} as QueryParams;
    for (let params of queryParamsTable) {
      const splitParams = params.split('=');
      queryParams[splitParams[0]] = splitParams[1];
    }
    try {
      if (await LedgerUtils.init()) {
        const keysToAdd = await LedgerUtils.getKeyForAccount(
          queryParams['keyType'] as KeyType,
          queryParams['username'],
        );
        await AccountUtils.addKeyFromLedger(queryParams['username'], keysToAdd);
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
        <ButtonComponent
          label="detect"
          skipLabelTranslation
          onClick={initializeLedger}
        />
        <div className="title">
          {chrome.i18n.getMessage('html_connect_ledger')}
        </div>
      </div>
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('hello'),
        }}></div>
    </div>
  );
};

export default ConnectLedger;

import { KeyType } from '@interfaces/keys.interface';
import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import './connect-ledger.component.scss';

interface QueryParams {
  [key: string]: string;
}

const ConnectLedger = () => {
  const initializeLedger = async () => {
    console.log(window, await chrome.tabs.getCurrent());
    const queryParamsTable = window.location.search.replace('?', '').split('&');
    const queryParams = {} as QueryParams;
    for (let params of queryParamsTable) {
      const splitParams = params.split('=');
      queryParams[splitParams[0]] = splitParams[1];
    }
    console.log(queryParams);
    try {
      if (await LedgerUtils.detect()) {
        console.log(
          await LedgerUtils.getKeyForAccount(
            queryParams['keyType'] as KeyType,
            queryParams['username'],
          ),
        );
      } else {
        return;
      }
    } catch (err: any) {
      console.log(err);
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

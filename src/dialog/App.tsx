import { Theme } from '@popup/theme.context';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import Register from 'src/dialog/hive/register/register';
import SignTransaction from 'src/dialog/hive/sign-transaction/sign-transaction';
import DialogError from 'src/dialog/multichain/error/error';
import RequestConfirmation from 'src/dialog/multichain/request/request-confirmation';
import RequestResponse from 'src/dialog/multichain/request/request-response';
import Unlock from 'src/dialog/multichain/unlock/unlock';
import BrowserUtils from 'src/utils/browser.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
// import './../analytics/analytics/gtag';

const App = () => {
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Theme>();
  useEffect(() => {
    initTheme();
  }, []);

  const initTheme = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  const initGoogleAnalytics = () => {
    // window.dataLayer = window.dataLayer || [];
    // window.gtag = function gtag() {
    //   window.dataLayer.push(arguments); // eslint-disable-line
    // };
    // window.gtag('js', new Date());
    // window.gtag(
    //   'config',
    //   process.env.GOOGLE_ANALYTICS_TAG_ID || 'G-1LRCTFLVBH',
    //   {
    //     page_path: '/popup',
    //   },
    // );
    // window.gtag('set', 'checkProtocolTask', () => {}); // Disables file protocol checking.
    // window.gtag('event', 'navigation', {
    //   page: 'dialog',
    // });
  };

  useEffect(() => {
    initGoogleAnalytics();
    chrome.runtime.onMessage.addListener(async function (
      data,
      sender,
      sendResp,
    ) {
      console.log('data in dialog', { data });
      if (data.command === DialogCommand.READY) {
        return BrowserUtils.sendResponse(true, sendResp);
      } else if (Object.values(DialogCommand).includes(data.command)) {
        setData(data);
      }
    });
  }, []);

  const renderDialogContent = (data: any) => {
    console.log('ici', { data });
    switch (data.command) {
      case DialogCommand.UNLOCK:
      case DialogCommand.UNLOCK_EVM:
        return <Unlock data={data} />;
      case DialogCommand.WRONG_MK:
        return <Unlock data={data} wrongMk index={Math.random()} />;
      case DialogCommand.SEND_DIALOG_ERROR:
        return <DialogError data={data} />;
      case DialogCommand.REGISTER:
        return <Register data={data} />;
      case DialogCommand.SEND_DIALOG_CONFIRM:
      case DialogCommand.SEND_DIALOG_CONFIRM_EVM:
        return <RequestConfirmation data={data} />;
      case DialogCommand.ANSWER_REQUEST:
      case DialogCommand.ANSWER_EVM_REQUEST:
        return <RequestResponse data={data} />;
      case DialogCommand.SIGN_WITH_LEDGER:
        return <SignTransaction data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className={`theme ${theme} dialog`}>{renderDialogContent(data)}</div>
  );
};

export default App;

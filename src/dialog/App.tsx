import { RequestAddEvmChain } from '@dialog/evm/requests/request-add-chain/request-add-chain';
import { FeedbackMessage } from '@dialog/interfaces/messages.interface';
import { DialogConfirmationPage } from '@dialog/multichain/dialog-confirmation-page/dialog-confirmation-page.component';
import { Theme } from '@popup/theme.context';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import Register from 'src/dialog/hive/register/register';
import Unlock from 'src/dialog/multichain/unlock/unlock';
import { RegisterKeylessComponent } from 'src/dialog/pages/register-keyless/register-keyless';
import BrowserUtils from 'src/utils/browser.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
// import './../analytics/analytics/gtag';

const App = () => {
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<Theme>();

  const [feedBackMessage, setFeedBackMessage] =
    useState<FeedbackMessage | null>(null);

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
    chrome.runtime.onMessage.addListener(
      async function (data, sender, sendResp) {
        if (data.command === DialogCommand.READY) {
          return BrowserUtils.sendResponse(true, sendResp);
        } else if (
          data.command === DialogCommand.ANSWER_REQUEST ||
          data.command === DialogCommand.ANSWER_EVM_REQUEST ||
          data.command === DialogCommand.SEND_DIALOG_ERROR
        ) {
          setFeedBackMessage(data);
        } else if (Object.values(DialogCommand).includes(data.command)) {
          setData(data);
        }
      },
    );
  }, []);

  const renderDialogContent = (data: any) => {
    switch (data.command) {
      case DialogCommand.UNLOCK:
      case DialogCommand.UNLOCK_EVM:
        return <Unlock data={data} />;

      case DialogCommand.WRONG_MK:
        return <Unlock data={data} wrongMk index={Math.random()} />;
      case DialogCommand.REGISTER_KEYLESS_KEYCHAIN:
        return <RegisterKeylessComponent data={data} />;
      case DialogCommand.REGISTER:
        return <Register data={data} />;

      case DialogCommand.ADD_ACCOUNT:
      case DialogCommand.ANONYMOUS_KEYLESS_OP:
      case DialogCommand.SIGN_WITH_LEDGER:
      case DialogCommand.SEND_DIALOG_CONFIRM:
      case DialogCommand.SEND_DIALOG_CONFIRM_EVM:
        return (
          <DialogConfirmationPage
            message={data}
            feedBackMessage={feedBackMessage}
            setFeedBackMessage={setFeedBackMessage}
          />
        );
      case DialogCommand.REQUEST_ADD_EVM_CHAIN:
        return (
          <RequestAddEvmChain
            request={data.msg.request}
            requestedChain={data.msg.chain}
            dappInfo={data.msg.dappInfo}
            tab={data.tab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`theme ${theme} dialog`}>{renderDialogContent(data)}</div>
  );
};

export default App;

import { RequestAddEvmChain } from '@dialog/evm/requests/request-add-chain/request-add-chain';
import { RequestAddCustomEvmChain } from '@dialog/evm/requests/request-add-custom-chain/request-add-custom-chain';
import { FeedbackMessage } from '@dialog/interfaces/messages.interface';
import { DialogConfirmationPage } from '@dialog/multichain/dialog-confirmation-page/dialog-confirmation-page.component';
import { DialogError } from '@dialog/multichain/error/error';
import { Theme } from '@popup/theme.context';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useRef, useState } from 'react';
import Register from 'src/dialog/hive/register/register';
import Unlock from 'src/dialog/multichain/unlock/unlock';
import { RegisterKeylessComponent } from 'src/dialog/pages/register-keyless/register-keyless';
import { CopyToastContainer } from 'src/common-ui/toast/copy-toast.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import BrowserUtils from 'src/utils/browser.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
// import './../analytics/analytics/gtag';

const App = () => {
  const [globalData, setGlobalData] = useState<any>(null);
  const [globalError, setGlobalError] = useState<any>(null);
  const globalDataRef = useRef<any>(null);
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
        console.log(data);
        if (data.command === DialogCommand.READY) {
          return BrowserUtils.sendResponse(true, sendResp);
        } else if (
          data.command === DialogCommand.ANSWER_REQUEST ||
          data.command === DialogCommand.ANSWER_EVM_REQUEST ||
          data.command === DialogCommand.SEND_DIALOG_ERROR
        ) {
          if (globalDataRef.current) {
            setFeedBackMessage(data);
          } else if (data.command === DialogCommand.SEND_DIALOG_ERROR) {
            setGlobalError(data);
          }
        } else if (Object.values(DialogCommand).includes(data.command)) {
          setGlobalError(null);
          globalDataRef.current = data;
          setGlobalData(data);
        }
      },
    );
  }, []);

  const closeGlobalError = async () => {
    if (
      globalError?.command === DialogCommand.SEND_DIALOG_ERROR &&
      globalError?.msg?.error === 'no_wallet' &&
      globalError?.msg?.data &&
      globalError?.msg?.request_id !== undefined
    ) {
      await CommunicationUtils.runtimeSendMessage({
        command: BackgroundCommand.REJECT_TRANSACTION,
        value: {
          success: false,
          error: 'user_cancel',
          result: null,
          data: globalError.msg.data,
          message: await chrome.i18n.getMessage(
            'bgd_lifecycle_request_canceled',
          ),
          request_id: globalError.msg.request_id,
          tab: globalError.tab ?? globalError.msg.tab,
        },
      });
    }

    close();
  };

  const renderDialogContent = (data: any) => {
    if (!data?.command) {
      return null;
    }

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
      case DialogCommand.REQUEST_ADD_CUSTOM_EVM_CHAIN:
        return (
          <RequestAddCustomEvmChain
            request={data.msg.request}
            dappInfo={data.msg.dappInfo}
            tab={data.tab}
            requestedChainId={data.msg.requestedChainId}
            initialChain={data.msg.initialChain}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`theme ${theme} dialog`}>
      {renderDialogContent(globalData)}
      {globalError && <DialogError data={globalError} onClose={closeGlobalError} />}
      <CopyToastContainer />
    </div>
  );
};

export default App;

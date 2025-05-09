import {
  BackgroundMessage,
  MultisigDialogMessage,
} from '@background/multichain/background-message.interface';
import {
  MultisigAcceptRejectTxData,
  MultisigData,
  MultisigDisplayMessageData,
  MultisigStep,
  MultisigUnlockData,
} from '@interfaces/multisig.interface';
import { Theme } from '@popup/theme.context';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { MultisigDialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import RequestItem from 'src/dialog/components/request-item/request-item';
import DialogError from 'src/dialog/multichain/error/error';
import { UnlockWalletComponent } from 'src/multisig/unlock-wallet/unlock-wallet.component';
import BrowserUtils from 'src/utils/browser.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';
import './multisig-dialog.scss';

const MultisigDialog = () => {
  const [theme, setTheme] = useState<Theme>();

  const [caption, setCaption] = useState('');
  const [content, setContent] = useState<JSX.Element>();

  const [loading, setLoading] = useState<boolean>(false);
  const [initialMultisigData, setInitialMultisigData] =
    useState<MultisigData>();
  const [multisigData, setMultisigData] = useState<MultisigData>();
  const [isReady, setIsReady] = useState(false);
  const onReceivedDataFromBackground = (
    backgroundMessage: MultisigDialogMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (
      backgroundMessage.command ===
        MultisigDialogCommand.MULTISIG_SEND_DATA_TO_POPUP &&
      (!multisigData ||
        (multisigData.data.signer?.encryptedTransaction ===
          backgroundMessage.value.data.signer?.encryptedTransaction &&
          multisigData.data.signer?.publicKey ===
            backgroundMessage.value.data.signer?.publicKey &&
          backgroundMessage.value.multisigStep ===
            MultisigStep.SIGN_TRANSACTION_FEEDBACK))
    ) {
      const multisigData: MultisigData = backgroundMessage.value;
      setMultisigData(multisigData);
    } else if (
      backgroundMessage.command === MultisigDialogCommand.READY_MULTISIG &&
      !isReady
    ) {
      setIsReady(true);
      return BrowserUtils.sendResponse(true, sendResp);
    }
  };
  useEffect(() => {
    chrome.runtime.onMessage.addListener(onReceivedDataFromBackground);
    return () => {
      chrome.runtime.onMessage.removeListener(onReceivedDataFromBackground);
    };
  }, [isReady, multisigData]);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    processData(multisigData);
  }, [multisigData]);

  const processData = (multisigData?: MultisigData) => {
    if (multisigData) {
      if (!initialMultisigData) {
        setInitialMultisigData(multisigData);
        setContent(renderContent(multisigData));
      } else if (
        initialMultisigData.data.signer?.id === multisigData.data.signer?.id
      ) {
        setContent(renderContent(multisigData));
      }
    }
  };

  const initTheme = async () => {
    const res = await LocalStorageUtils.getMultipleValueFromLocalStorage([
      LocalStorageKeyEnum.ACTIVE_THEME,
    ]);

    setTheme(res.ACTIVE_THEME ?? Theme.LIGHT);
  };

  const handleCloseClick = () => {
    window.close();
  };

  const sendAcceptRejectTransaction = (
    accepted: boolean,
    multisigData: MultisigData,
  ) => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.MULTISIG_ACCEPT_RESPONSE,
      value: { accepted, multisigData },
    } as BackgroundMessage);
    if (!accepted) window.close();
  };

  const renderContent = (multisigData: MultisigData) => {
    switch (multisigData.multisigStep) {
      case MultisigStep.SIGN_TRANSACTION_FEEDBACK: {
        setCaption('');
        const data = multisigData.data as MultisigDisplayMessageData;
        chrome.runtime.onMessage.removeListener(onReceivedDataFromBackground);
        if (data.success)
          setTimeout(() => {
            handleCloseClick();
          }, 3000);
        return (
          <div className="card">
            <SVGIcon
              icon={
                data.success ? SVGIcons.MESSAGE_SUCCESS : SVGIcons.MESSAGE_ERROR
              }></SVGIcon>
            <div className="message">
              {chrome.i18n.getMessage(data.message)}
            </div>
            <div className="fill-space"></div>
            <ButtonComponent
              label="popup_html_close"
              onClick={handleCloseClick}
            />
          </div>
        );
      }
      case MultisigStep.ACCEPT_REJECT_TRANSACTION: {
        setCaption('multisig_dialog_accept_reject_tx_caption');
        const data = multisigData.data as MultisigAcceptRejectTxData;
        return (
          <>
            <div className="fields-container">
              <div className="fields">
                <RequestItem
                  title="multisig_requested_signer_username"
                  content={`@${data.username}`}
                />
                <Separator type={'horizontal'} fullSize />
                <RequestItem
                  title="multisig_requested_signer_public_key"
                  content={`@${data.signer.publicKey}`}
                  xsFont
                />
                <Separator type={'horizontal'} fullSize />
                <RequestItem
                  title="multisig_initiator"
                  content={`@${data.signatureRequest.initiator}`}
                />
                <Separator type={'horizontal'} fullSize />
                <CollaspsibleItem
                  title="dialog_tx"
                  content={JSON.stringify(
                    data.decodedTransaction,
                    undefined,
                    2,
                  )}
                  pre
                />
              </div>
            </div>
            <div className="fill-space"></div>
            <div className="button-panel">
              <ButtonComponent
                type={ButtonType.ALTERNATIVE}
                label="multisig_dialog_reject_tx"
                onClick={() => {
                  sendAcceptRejectTransaction(false, multisigData);
                }}
                height="small"></ButtonComponent>

              <ButtonComponent
                label="multisig_dialog_accept_tx"
                type={ButtonType.IMPORTANT}
                onClick={() => {
                  sendAcceptRejectTransaction(true, multisigData);
                }}
                height="small"></ButtonComponent>
            </div>
            {loading && <LoadingComponent />}
          </>
        );
      }

      case MultisigStep.NOTIFY_TRANSACTION_BROADCASTED: {
        const data = multisigData.data as MultisigDisplayMessageData;
        setCaption('');
        // if (data.success)
        //   setTimeout(() => {
        //     handleCloseClick();
        //   }, 3000);
        return (
          <div className="card">
            <SVGIcon
              icon={
                data.success ? SVGIcons.MESSAGE_SUCCESS : SVGIcons.MESSAGE_ERROR
              }></SVGIcon>
            <div className="message">
              {chrome.i18n.getMessage(data.message)}
            </div>
            <a href={`https://hivehub.dev/tx/${data.txId}`} target="__blank">
              {data.txId}
            </a>
            <div className="fields-container">
              <div className="fields">
                <CollaspsibleItem
                  title="dialog_tx"
                  content={JSON.stringify(data.transaction, undefined, 2)}
                  pre
                />
              </div>
            </div>

            <div className="fill-space"></div>
            <ButtonComponent
              label="popup_html_close"
              onClick={handleCloseClick}
            />
          </div>
        );
      }
      case MultisigStep.NOTIFY_ERROR: {
        const data = multisigData.data as any;

        return (
          <DialogError
            data={{
              msg: { display_msg: chrome.i18n.getMessage(data.message) },
            }}
          />
        );
      }
      case MultisigStep.UNLOCK_WALLET: {
        const data = multisigData.data as MultisigUnlockData;
        return <UnlockWalletComponent data={data} />;
      }
      default:
        Logger.info(`Step: ${multisigData.multisigStep} but nothing matches`);
        return <div></div>;
    }
  };

  return (
    <div className={`theme ${theme} multisig-dialog`}>
      <div className="title-panel">
        <img className="multisig-logo" src="/assets/images/multisig/logo.png" />
        <div className="title">{chrome.i18n.getMessage('multisig')} </div>
      </div>
      {content && (
        <>
          <div
            className="caption"
            dangerouslySetInnerHTML={{
              __html: chrome.i18n.getMessage(caption),
            }}></div>

          {content}
        </>
      )}
    </div>
  );
};

ReactDOM.render(<MultisigDialog />, document.getElementById('root'));

export {};

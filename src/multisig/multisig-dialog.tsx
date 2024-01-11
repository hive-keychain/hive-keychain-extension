import { BackgroundMessage } from '@background/background-message.interface';
import {
  MultisigAcceptRejectTxData,
  MultisigData,
  MultisigDisplayMessageData,
  MultisigStep,
  MultisigUnlockData,
} from '@interfaces/multisig.interface';
import { useThemeContext } from '@popup/theme.context';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { UnlockWalletComponent } from 'src/multisig/unlock-wallet/unlock-wallet.component';
import Logger from 'src/utils/logger.utils';
import './multisig-dialog.scss';

const MultisigDialog = () => {
  const { theme } = useThemeContext();

  const [caption, setCaption] = useState('');
  const [content, setContent] = useState<JSX.Element>();

  const [loading, setLoading] = useState<boolean>(false);

  const onReceivedDataFromBackground = (
    backgroundMessage: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResp: (response?: any) => void,
  ) => {
    if (
      backgroundMessage.command ===
      BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP
    ) {
      console.log(backgroundMessage);
      const multisigData: MultisigData = backgroundMessage.value;
      setContent(renderContent(multisigData));
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onReceivedDataFromBackground);
  }, []);

  const handleCloseClick = () => {
    window.close();
  };

  const sendAcceptRejectTransaction = (accepted: boolean) => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.MULTISIG_ACCEPT_RESPONSE,
      value: accepted,
    } as BackgroundMessage);
    if (!accepted) window.close();
  };

  const renderContent = (multisigData: MultisigData) => {
    console.log(multisigData);
    switch (multisigData.multisigStep) {
      case MultisigStep.SIGN_TRANSACTION_FEEDBACK: {
        setCaption('');
        const data = multisigData.data as MultisigDisplayMessageData;
        chrome.runtime.onMessage.removeListener(onReceivedDataFromBackground);
        return (
          <>
            <div className="message">
              {chrome.i18n.getMessage(data.message)}
            </div>
            <div className="fill-space"></div>
            <ButtonComponent
              label="popup_html_close"
              onClick={handleCloseClick}
            />
          </>
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
                  sendAcceptRejectTransaction(false);
                }}
                height="small"></ButtonComponent>

              <ButtonComponent
                label="multisig_dialog_accept_tx"
                type={ButtonType.IMPORTANT}
                onClick={() => {
                  sendAcceptRejectTransaction(true);
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
        return (
          <>
            <div className="message">
              {chrome.i18n.getMessage(data.message)}
            </div>
            <div className="fill-space"></div>
            <ButtonComponent
              label="popup_html_close"
              onClick={handleCloseClick}
            />
          </>
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
        <div className="title">{chrome.i18n.getMessage('multisig')}</div>
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
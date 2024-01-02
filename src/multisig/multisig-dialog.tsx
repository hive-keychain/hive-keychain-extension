import { BackgroundMessage } from '@background/background-message.interface';
import {
  MultisigAcceptRejectTxData,
  MultisigData,
  MultisigDisplayMessageData,
  MultisigStep,
} from '@interfaces/multisig.interface';
import { useThemeContext } from '@popup/theme.context';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import RequestItem from 'src/dialog/components/request-item/request-item';
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
    console.log(backgroundMessage);
    if (
      backgroundMessage.command ===
      BackgroundCommand.MULTISIG_SEND_DATA_TO_POPUP
    ) {
      console.log(backgroundMessage);
      chrome.runtime.onMessage.removeListener(onReceivedDataFromBackground);
      const multisigData: MultisigData = backgroundMessage.value;
      setContent(renderContent(multisigData));
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onReceivedDataFromBackground);
  }, []);

  const renderContent = (multisigData: MultisigData) => {
    switch (multisigData.multisigStep) {
      case MultisigStep.DISPLAY_MESSAGE: {
        setCaption('');
        const data = multisigData.data as MultisigDisplayMessageData;
        return <div>display message{chrome.i18n.getMessage(data.message)}</div>;
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
        setCaption('multisig_accept_reject_tx_caption');
        chrome.runtime.onMessage.removeListener(onReceivedDataFromBackground);
        return <div>{chrome.i18n.getMessage(data.message)}</div>;
      }
      default:
        Logger.info(`Step: ${multisigData.multisigStep} but nothing matches`);
        return <div></div>;
    }
  };

  const sendAcceptRejectTransaction = (accepted: boolean) => {
    chrome.runtime.sendMessage({
      command: BackgroundCommand.MULTISIG_ACCEPT_RESPONSE,
      value: accepted,
    } as BackgroundMessage);
  };

  return (
    <div className={`theme ${theme} multisig-dialog`}>
      <div className="title-panel">
        <SVGIcon icon={NewIcons.KEYCHAIN_LOGO_ROUND_SMALL} />
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

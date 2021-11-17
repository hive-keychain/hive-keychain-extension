import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import DialogError from 'src/dialog/pages/error';
import Unlock from 'src/dialog/pages/unlock';
import './dialog.scss';

const App = () => {
  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (data, sender, sendResp) {
      setData(data);
    });
  }, []);

  const [data, setData] = useState<any>({});

  const renderDialogContent = () => {
    console.log(data);
    switch (data.command) {
      case DialogCommand.UNLOCK:
      case DialogCommand.WRONG_MK:
        return (
          <Unlock
            data={data}
            wrongMk={data.command === DialogCommand.WRONG_MK}
          />
        );
      case DialogCommand.SEND_DIALOG_ERROR:
        return <DialogError data={data} />;
      default:
        return null;
    }
  };

  return <div className="dialog">{renderDialogContent()}</div>;
};

export default App;

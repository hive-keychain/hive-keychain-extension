import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import Unlock from 'src/dialog/pages/Unlock';
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
        return <Unlock data={data} />;
      default:
        return null;
    }
  };

  return <div className="dialog">{renderDialogContent()}</div>;
};

export default App;

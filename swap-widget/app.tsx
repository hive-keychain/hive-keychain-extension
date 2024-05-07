import { SwapTokenUtils } from '@extension/utils/swap-token.utils';
import React, { useEffect } from 'react';
function App() {
  useEffect(() => {
    SwapTokenUtils.getServerStatus().then((res) => {
      console.log({ res });
    });
  }, []);

  return <div>{'react setup from scratch without cra testing ts'}</div>;
}
export default App;

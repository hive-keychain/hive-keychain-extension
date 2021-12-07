import { KeychainRequest } from '@interfaces/keychain.interface';
import { useEffect, useState } from 'react';

export const useAnonymousRequest = (
  data: KeychainRequest,
  accounts?: string[],
) => {
  const [username, setUsername] = useState('');
  useEffect(() => {
    if (data.username) setUsername(data.username);
    else {
      data.username = accounts![0];
      setUsername(accounts![0]);
    }
  }, [accounts, data.username]);

  const anonymousProps = {
    accounts,
    username,
    setUsername: (us: string) => {
      data.username = us;
      setUsername(us);
    },
  };

  return anonymousProps;
};

import { VscStatus } from '@interfaces/vsc.interface';
import Config from 'src/config';

const checkStatus = (id: string): Promise<VscStatus> => {
  const query = `{
    findTransaction(
      filterOptions: {byId:"${id}-0"}
    ) {
      txs {
        status,id
      }
    }
  }`;
  return fetch(Config.vsc.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  })
    .then((res) => res.json())
    .then((res) => res?.data?.findTransaction?.txs?.[0]?.status);
};

export const VscUtils = {
  checkStatus,
};

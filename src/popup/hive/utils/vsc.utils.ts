import { VscStatus } from '@interfaces/vsc.interface';
import Config from 'src/config';

const waitForStatus = async (id: string): Promise<VscStatus> => {
  const MAX_ITERATIONS = 20;
  const WAIT_TIME = 500;
  let iterations = 0;
  let status: VscStatus = VscStatus.UNCONFIRMED;

  while (iterations < MAX_ITERATIONS) {
    status = await checkStatus(id);
    if (status === VscStatus.CONFIRMED) return status;
    iterations++;
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }
  return status;
};

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
  waitForStatus,
};

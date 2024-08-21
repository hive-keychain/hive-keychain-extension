import {
  VscHistoryResponse,
  VscHistoryType,
  VscStatus,
} from '@interfaces/vsc.interface';
import Config from 'src/config';

const waitForStatus = async (
  id: string,
  type: VscHistoryType,
): Promise<VscStatus> => {
  const MAX_ITERATIONS = 20;
  const WAIT_TIME = 500;
  let iterations = 0;
  let status: VscStatus = VscStatus.UNCONFIRMED;

  while (iterations < MAX_ITERATIONS) {
    status = await checkStatus(id, type);
    if (status === VscStatus.INCLUDED) return status;
    iterations++;
    await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
  }
  return status;
};

const checkStatus = (id: string, type: VscHistoryType): Promise<VscStatus> => {
  let query;
  if (type === VscHistoryType.CONTRACT_CALL) {
    query = `{
    findTransaction(
      filterOptions: {byId:"${id}-0"}
    ) {
      txs {
        status,id
      }
    }
  }`;
  } else if (type === VscHistoryType.TRANSFER) {
    query = `{
    
  }`;
  }

  return fetchQuery(query).then(
    (res) => res?.data?.findTransaction?.txs?.[0]?.status,
  );
};

const fetchQuery = (query: any) => {
  return fetch(Config.vsc.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  }).then((res) => res.json());
};

const fetchHistory = async (username: string): Promise<VscHistoryResponse> => {
  const query = `{
  findLedgerTXs(
    filterOptions: {byToFrom: "hive:${username}"}
  ) {
    txs {
      amount
      block_height
      from
      id
      memo
      owner
      t
      tk
      status
    }
  }
  findTransaction(filterOptions: {byAccount: "${username}"}) {
    txs {
      status
      id
      anchored_height
      first_seen
      data {
        action
        contract_id
        op
        payload
      }
      required_auths{value}
    }
}}
`;
  return (await fetchQuery(query)).data;
};

const getOrganizedHistory = async (username: string) => {
  const history = await fetchHistory(username);
  const organizedHistory = [
    ...history.findLedgerTXs.txs.map((e) => {
      e.type = VscHistoryType.TRANSFER;
      return e;
    }),
    ...history.findTransaction.txs.map((e) => {
      e.type = VscHistoryType.CONTRACT_CALL;
      return e;
    }),
  ].sort((a, b) => {
    let aHeight: number, bHeight: number;
    if (a.type === VscHistoryType.TRANSFER) aHeight = a.block_height;
    else if (a.type === VscHistoryType.CONTRACT_CALL)
      aHeight = a.anchored_height;
    if (b.type === VscHistoryType.TRANSFER) bHeight = b.block_height;
    else if (b.type === VscHistoryType.CONTRACT_CALL)
      bHeight = b.anchored_height;
    return bHeight! - aHeight!;
  });
  return organizedHistory;
};

export const VscUtils = {
  checkStatus,
  waitForStatus,
  getOrganizedHistory,
};

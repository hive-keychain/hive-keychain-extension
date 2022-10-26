import { AuthorityType, Operation } from '@hiveio/dhive';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';

const array = [
  {
    '0': 'transfer',
    '1': {
      from: mk.user.one,
      to: 'aggroed',
      amount: '1.000 HIVE',
      memo: 'transfer to aggroed',
    },
  },
  {
    '0': 'update_proposal_votes',
    '1': {
      voter: mk.user.one,
      proposal_ids: [1, 2],
      approve: true,
      extensions: [],
    },
  },
  {
    '0': 'create_proposal',
    '1': {
      creator: mk.user.one,
      receiver: 'keychain',
      start_date: '12/12/2022',
      end_date: '12/12/2023',
      daily_pay: '200.000 HBD',
      subject: 'subject',
      permlink: 'https://permlink.com',
      extensions: [],
    },
  },
  {
    '0': 'remove_proposal',
    '1': {
      proposal_owner: 'keychain',
      proposal_ids: [1, 2],
      extensions: [],
    },
  },
  {
    '0': 'account_update2',
    '1': {
      account: mk.user.one,
      owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      } as AuthorityType,
      memo_key: userData.one.encryptKeys.memo,
      json_metadata: '',
      posting_json_metadata: '',
      extensions: [],
    },
  },
  {
    '0': 'account_update',
    '1': {
      account: mk.user.one,
      owner: {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      } as AuthorityType,
      memo_key: userData.one.encryptKeys.memo,
      json_metadata: '',
    },
  },
  {
    '0': 'recurrent_transfer',
    '1': {
      account: mk.user.one,
      to: 'arcange',
      amount: '10000.000 HIVE',
      memo: 'transfering payment',
      recurrence: 2,
      executions: 2,
      extensions: [],
    },
  },
  {
    '0': 'custom_json',
    '1': {
      required_auths: [userData.one.encryptKeys.owner],
      required_posting_auths: [mk.user.one],
      id: '1',
      json: '{"token":"SPS","qty":0,"app":"splinterlands/0.7.139","n":"0MtjYZ1uI4"}',
    },
  },
] as Operation[];

export default { array };

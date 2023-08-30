import { Keys } from '@interfaces/keys.interface';
require('dotenv').config();

const one = {
  username: process.env._TEST_USERNAME || 'error, please check',
  encryptKeys: {
    owner: process.env._TEST_OWNER_PUB || 'error, please check',
    active: process.env._TEST_ACTIVE_PUB || 'error, please check',
    posting: process.env._TEST_POSTING_PUB || 'error, please check',
    memo: process.env._TEST_MEMO_PUB || 'error, please check',
    randomString53: 'Kzi5gocL1KZlnsryMRIbfdmXgz2lLmiaosQDELp3GM2jU9sFYguxv',
  },
  nonEncryptKeys: {
    master: process.env._TEST_MASTER || 'error, please check',
    owner: process.env._TEST_OWNER || 'error, please check',
    active: process.env._TEST_ACTIVE || 'error, please check',
    posting: process.env._TEST_POSTING || 'error, please check',
    memo: process.env._TEST_MEMO || 'error, please check',
    fakeKey: '5Jq1oDi61PWMq7DNeJWQUVZV3v85QVFMN9ro3Dnmi1DySjgU1v9',
    randomStringKey51: 'MknOPyeXr5CGsCgvDewdny55MREtDpAjhkT9OsPPLCujYD82Urk',
  },
};

const two = {
  username: 'workerjab2',
  keys: {
    posting: process.env._TEST_USER2_POSTING || 'error, please check',
    postingPubkey: process.env._TEST_USER2_POSTING_PUB || 'error, please check',
  } as Keys,
};

export default { one, two };

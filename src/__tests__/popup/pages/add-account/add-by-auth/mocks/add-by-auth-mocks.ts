import { Authority } from '@hiveio/dhive';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mockPreset from 'src/__tests__/utils-for-testing/preset/mock-preset';

const reMockWith = (prop: string, data: [string, number][]) => {
  let obj = {};
  switch (prop) {
    case 'active':
      obj = {
        active: {
          ...accounts.extended.posting,
          account_auths: data,
        } as Authority,
      };
      break;
    case 'posting':
      obj = {
        posting: {
          ...accounts.extended.posting,
          account_auths: data,
        } as Authority,
      };
      break;
  }
  mockPreset.setOrDefault({
    app: {
      getAccount: [
        {
          ...accounts.extended,
          ...obj,
        },
      ],
    },
  });
};

export default { reMockWith };

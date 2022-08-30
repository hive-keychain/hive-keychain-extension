import mk from 'src/__tests__/utils-for-testing/data/mk';
import { PropsRequestUsername } from 'src/__tests__/utils-for-testing/types/props-types';

export default {
  props: {
    accounts: [mk.user.one, mk.user.two],
    username: mk.user.one,
    setUsername: jest.fn(),
  } as PropsRequestUsername,
};

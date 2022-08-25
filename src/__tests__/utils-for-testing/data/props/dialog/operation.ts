import postMocks from 'src/__tests__/background/requests/operations/ops/mocks/post-mocks';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import { PropsOperation } from 'src/__tests__/utils-for-testing/interfaces/test-objects';

export default {
  props: {
    title: 'title',
    children: [],
    onConfirm: jest.fn(),
    data: postMocks.constants.data,
    domain: 'domain',
    tab: 0,
    canWhitelist: false,
    header: 'description',
    checkboxLabelOverride: 'overrride',
    accounts: [mk.user.one, mk.user.two],
    username: mk.user.one,
    setUsername: jest.fn(),
    redHeader: true,
  } as PropsOperation,
};

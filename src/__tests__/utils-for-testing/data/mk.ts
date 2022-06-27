import userData from 'src/__tests__/utils-for-testing/data/user-data';

const empty = '' as string;

const user = {
  one: userData.one.username,
  two: userData.two.username,
};

export default { empty, user };

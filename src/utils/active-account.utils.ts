import { ActiveAccount } from 'src/interfaces/active-account.interface';

const isEmpty = (activeAccount: ActiveAccount) => {
  return Object.keys(activeAccount.account).length === 0;
};

const ActiveAccountUtils = {
  isEmpty,
};

export default ActiveAccountUtils;

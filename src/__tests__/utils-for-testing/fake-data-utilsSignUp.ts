import { Rpc } from '@interfaces/rpc.interface';
import userEvent from '@testing-library/user-event';

const rpc = { uri: 'https://hived.privex.io/', testnet: false } as Rpc;
const signUpComponentAL = 'signup-page';
const inputComponentAL = 'password-input';
const inputConfirmationComponentAL = 'password-input-confirmation';
const signUpButtonAL = 'signup-button';
const erroMessages = {
  noMatch: 'Your passwords do not match!',
  invalid:
    'Your password must be at least 8 characters long and include a lowercase letter, an uppercase letter and a digit or be at least 16 characters long without restriction.',
};
const addAccountMainComponentAL = 'addaccount-page';
const userEventCustom = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
});

const utilsSignUp = {
  rpc,
  signUpComponentAL,
  inputComponentAL,
  inputConfirmationComponentAL,
  signUpButtonAL,
  erroMessages,
  addAccountMainComponentAL,
  userEventCustom,
};

export default utilsSignUp;

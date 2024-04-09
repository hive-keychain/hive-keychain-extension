import { createContext, useContext } from 'react';
import Logger from 'src/utils/logger.utils';

export enum SignUpScreen {
  SIGN_UP = 'SIGN_UP',
  CHAIN_SELECTOR = 'CHAIN_SELECTOR',
}

export type SignUpContextType = {
  screen: SignUpScreen;
  setScreen: (screen: SignUpScreen) => void;
};

export const SignUpContext = createContext<SignUpContextType>({
  screen: SignUpScreen.SIGN_UP,
  setScreen: (screen) => Logger.log('no chain provider'),
});
export const useSignUpContext = () => useContext(SignUpContext);

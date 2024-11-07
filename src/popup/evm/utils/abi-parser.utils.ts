import { EVMTokenType } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';

export enum EvmInputDisplayType {
  ADDRESS = 'address',
  BALANCE = 'balance',
  NUMBER = 'number',
  STRING = 'string',
}

const getDisplayInputType = (
  abi: any,
  methodName: string,
  inputType: string,
  name: string,
): EvmInputDisplayType => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  console.log({ methodName, inputType });
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          if (name === 'amount') {
            return EvmInputDisplayType.BALANCE;
          }
          return inputType as EvmInputDisplayType;
        }
      }
      break;
    }
    case EVMTokenType.ERC_721: {
      break;
    }
    default: {
    }
  }
  return EvmInputDisplayType.STRING;
};

const shouldDisplayBalanceChange = (abi: any, methodName: string) => {
  const tokenType = EvmTokensUtils.getTokenType(abi);
  switch (tokenType) {
    case EVMTokenType.ERC20: {
      switch (methodName) {
        case 'transfer': {
          return true;
        }
      }
      break;
    }
    case EVMTokenType.ERC_721: {
      return false;
    }
    default: {
      return false;
    }
  }
  return false;
};

export const AbiParserUtils = {
  getDisplayInputType,
  shouldDisplayBalanceChange,
};

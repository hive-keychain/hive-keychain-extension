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

export const AbiParserUtils = { getDisplayInputType };

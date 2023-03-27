import { KeychainError } from 'src/keychain-error';
import { ErrorUtils } from 'src/utils/error.utils';
import errorUtilsMocks from 'src/__tests__/utils/mocks/error.utils-mocks';

describe('error.utils.ts tests:\n', () => {
  const { blockchainErrorData, hiveEngineErrorData } = errorUtilsMocks;
  describe('parse cases:/n', () => {
    it('Must return error if no context on stack', () => {
      expect(
        ErrorUtils.parse({ data: { stack: [{ format: 'format' }] } }),
      ).toEqual(new KeychainError('error_while_broadcasting'));
    });

    it('Must return error if statusText', () => {
      expect(
        ErrorUtils.parse({ statusText: 'CONDITIONS_OF_USE_NOT_SATISFIED' }),
      ).toEqual(new KeychainError('error_while_broadcasting'));
    });

    it('Must return KeychainError on each Blockchain error case', () => {
      for (let i = 0; i < blockchainErrorData.length; i++) {
        const element = blockchainErrorData[i];
        expect(ErrorUtils.parse(element.error)).toEqual(element.expectError);
      }
    });
  });

  describe('parseHiveEngine cases:\n', () => {
    it('Must return KeychainError on each Blockchain error case', () => {
      for (let i = 0; i < hiveEngineErrorData.length; i++) {
        const element = hiveEngineErrorData[i];
        expect(
          ErrorUtils.parseHiveEngine(element.error, element.payload),
        ).toEqual(element.expectError);
      }
    });
  });
});

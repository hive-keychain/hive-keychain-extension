import { toOverWriteFuntions } from 'src/__tests__/utils-for-testing/data/constants';
import { OverwriteMock } from 'src/__tests__/utils-for-testing/enums/enums';
import { MocksOverwrite } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

export const overWriteMocks = (toOverWrite: MocksOverwrite) => {
  const OW = OverwriteMock.SET_AS_NOT_IMPLEMENTED;
  const cloneObj = JSON.parse(JSON.stringify(toOverWrite));
  Object.keys(cloneObj).forEach((componentName) => {
    if (Object.keys(cloneObj[componentName]).length > 0) {
      Object.keys(cloneObj[componentName]).forEach((mockName) => {
        const value = cloneObj[componentName][mockName];
        if (value === OW) {
          toOverWriteFuntions[mockName]();
        }
      });
    }
  });
};

import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

export default {
  get: (key: string, extra?: any) =>
    mocksImplementation.i18nGetMessageCustom(key, extra),
};

import Logger from '../../utils/logger.utils';

//NOTE: currently disabled using skip.

test.skip('info should return an specific format from input and n number of times', () => {
  const logSpyInfo = jest.spyOn(console, 'log');

  Logger.info('test');

  expect(logSpyInfo).toBeCalledTimes(1);
  expect.stringContaining('color');
  expect.stringContaining('test');

  logSpyInfo.mockClear();
});

test.skip('warn must return orange color in console.log', () => {
  let logWarnSpy = jest.spyOn(console, 'log');
  const testPhrase = 'testing this warn';
  const color_expected = 'color: orange';
  Logger.warn(testPhrase);

  expect(logWarnSpy).toBeCalledTimes(1);
  expect.stringContaining(color_expected);

  logWarnSpy.mockClear();

  //a second assertions on the same test
  const testPhrase2 = 'testing this warn';
  Logger.warn(testPhrase2);
  expect(logWarnSpy).toBeCalledTimes(1);
  expect.stringContaining(testPhrase2);

  logWarnSpy.mockClear();
  logWarnSpy.mockReset();
});

test.skip('error must return color:red, be called 1 time only and contain calling phrase', () => {
  const logErrorSpy = jest.spyOn(console, 'log');
  const testPhrase = 'amazing error';
  Logger.error(testPhrase);

  expect(logErrorSpy).toBeCalledTimes(1);
  expect.stringContaining('color: red');
  expect.stringContaining(testPhrase);

  logErrorSpy.mockClear();
  logErrorSpy.mockReset();
});

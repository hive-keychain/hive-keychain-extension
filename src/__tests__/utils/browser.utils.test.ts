import BrowserUtils from 'src/utils/browser.utils';
const env = process.env;

describe('sendResponse tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  test('While mocking the env variable IS_FIREFOX it must return resolvedMessage', async () => {
    process.env = {
      ...env,
      IS_FIREFOX: 'true',
    };
    const resolvedMessage = 'It is been returned';
    const consoleLogA = (a?: any) => console.log(`Passed: ${a}`);
    const result = await BrowserUtils.sendResponse(
      resolvedMessage,
      consoleLogA,
    );
    expect(result).not.toBeUndefined();
    expect(result).toBe('It is been returned');
    process.env = env;
  });
  test('While not mocking env variables, it should execute the consoleLogA function and return undefined', () => {
    const resolvedMessage = 'It is been returned';
    const consoleLogA = (a?: any) => console.log(`${a} by console.log`);
    console.log = jest.fn();
    const result = BrowserUtils.sendResponse(resolvedMessage, consoleLogA);
    expect(result).toBeUndefined();
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(resolvedMessage + ' by console.log');
  });
});

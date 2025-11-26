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
  test('While not mocking env variables, it should execute the consoleLogA function and return undefined', async () => {
    const resolvedMessage = 'It is been returned';
    const consoleLogA = (a?: any) => console.log(`${a} by console.log`);
    console.log = jest.fn();
    // Mock chrome.windows.getCurrent to return a window object
    chrome.windows.getCurrent = jest.fn().mockResolvedValue({ id: 1 } as chrome.windows.Window);
    chrome.windows.update = jest.fn().mockResolvedValue(undefined);
    const result = await BrowserUtils.sendResponse(resolvedMessage, consoleLogA);
    expect(result).toBeUndefined();
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toBeCalledWith(resolvedMessage + ' by console.log');
    expect(chrome.windows.getCurrent).toHaveBeenCalled();
    expect(chrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
  });
});

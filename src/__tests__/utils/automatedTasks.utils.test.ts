import AutomatedTasksUtils from 'src/utils/automatedTasks.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
//jest extra configurations
jest.setTimeout(20000);

//chrome
const chrome = require('chrome-mock');
global.chrome = chrome;
//end Chrome

//cleaning mocks
afterEach(() => {
  jest.clearAllMocks();
});

describe('getClaims tests', () => {
  //mocking getMultipleValueFromLocalStorage,
  const username = 'theghost1980';
  test('When passed a username, and no claims or rewards({}) found, must return {"claimAccounts": false, "claimRewards": false}', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({});
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: false };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, and claims and rewards undefined(see bellow) found, must return {claimAccounts: false, claimRewards: false}', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: undefined,
        claimRewards: undefined,
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: false };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, and claims and rewards null(see bellow) found, must return {claimAccounts: false, claimRewards: false}', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: null,
        claimRewards: null,
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: false };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, and claims present, must return valid object as { claimAccounts: false, claimRewards: true }', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: {
          theghost1980: false,
        },
        claimRewards: {
          theghost1980: true,
        },
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: true };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, rewards null and claims found, must return valid object as { claimAccounts: true, claimRewards: false }', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: {
          theghost1980: true,
        },
        claimRewards: null,
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: true, claimRewards: false };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, rewards undefined and claims found, must return valid object as { claimAccounts: true, claimRewards: false }', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: {
          theghost1980: true,
        },
        claimRewards: undefined,
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: true, claimRewards: false };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, reward found and claim as null, must return valid object as { claimAccounts: false, claimRewards: true }', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: null,
        claimRewards: {
          theghost1980: true,
        },
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: true };
    expect(result).toEqual(expectedResults);
  });
  test('When passed a username, reward found and claim as undefined, must return valid object as { claimAccounts: false, claimRewards: true }', async () => {
    //mocking storaged claims values
    LocalStorageUtils.getMultipleValueFromLocalStorage = jest
      .fn()
      .mockResolvedValue({
        claimAccounts: undefined,
        claimRewards: {
          theghost1980: true,
        },
      });
    const result = await AutomatedTasksUtils.getClaims(username);
    const expectedResults = { claimAccounts: false, claimRewards: true };
    expect(result).toEqual(expectedResults);
  });
});

describe('saveClaims tests', () => {
  let spyLocalStorageUtilsSaveValue: jest.SpyInstance;
  let spyChromeRuntimeSendMessage: jest.SpyInstance;
  beforeEach(() => {
    //spy on LocalStorageUtils.saveValueInLocalStorage
    spyLocalStorageUtilsSaveValue = jest.spyOn(
      LocalStorageUtils,
      'saveValueInLocalStorage',
    );
    //spy on chrome.runtime.sendMessage
    spyChromeRuntimeSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  let expectedSendMessageObj = {
    command: 'updateClaims',
    value: {
      claimAccounts: {
        workerjab1: false,
      },
      claimRewards: {
        workerjab1: false,
      },
    },
  };
  const username: string = 'workerjab1';
  test('Passing username, and false(claimRewards, claimAccount) must return undefined and follow/pass the steps bellow', async () => {
    //expected steps:
    // 1. getAllClaimRewards will return undefined as no mocking values on this test.
    // 2. Call LocalStorageUtils.saveValueInLocalStorage 2 times.
    // 3. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimRewards', { workerjab1: false }
    // 4. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimAccounts', { workerjab1: false }
    // 5. Call chrome.runtime.sendMessage with the expected Object bellow.
    // 6. saveClaims must return undefined as returning no value.

    //expected
    expectedSendMessageObj.value.claimAccounts.workerjab1 = false;
    expectedSendMessageObj.value.claimRewards.workerjab1 = false;

    const result = await AutomatedTasksUtils.saveClaims(false, false, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith(expectedSendMessageObj);
    expect(result).toBeUndefined();
  });
  test.skip('When passed empty username, it returns empty key object with assigned value. Skipped as validation needed.', async () => {
    //Note; even when is very unlikely that an empty string will be passed as username, it could happen.
    //so for now this a possible case to study if needed a validation, for now skipped.

    //expected
    expectedSendMessageObj.value.claimAccounts.workerjab1 = false;
    expectedSendMessageObj.value.claimRewards.workerjab1 = false;

    const result = await AutomatedTasksUtils.saveClaims(false, false, '');
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      '': false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      '': false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith(expectedSendMessageObj);
    expect(result).toBeUndefined();
  });
  test('Passing (username, claimRewards = false, claimAccount = true) must return undefined and follow/pass the steps bellow', async () => {
    //expected steps:
    // 1. getAllClaimRewards will return undefined as no mocking values on this test.
    // 2. Call LocalStorageUtils.saveValueInLocalStorage 2 times.
    // 3. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimRewards', { workerjab1: false }
    // 4. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimAccounts', { workerjab1: true }
    // 5. Call chrome.runtime.sendMessage with the expected Object bellow.
    // 6. saveClaims must return undefined as returning no value.

    //expected
    expectedSendMessageObj.value.claimAccounts.workerjab1 = true;
    expectedSendMessageObj.value.claimRewards.workerjab1 = false;

    const result = await AutomatedTasksUtils.saveClaims(false, true, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: true,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith(expectedSendMessageObj);
    expect(result).toBeUndefined();
  });
  test('Passing (username, claimRewards = true, claimAccount = true) must return undefined and follow/pass the steps bellow', async () => {
    //expected steps:
    // 1. getAllClaimRewards will return undefined as no mocking values on this test.
    // 2. Call LocalStorageUtils.saveValueInLocalStorage 2 times.
    // 3. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimRewards', { workerjab1: true }
    // 4. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimAccounts', { workerjab1: true }
    // 5. Call chrome.runtime.sendMessage with the expected Object bellow.
    // 6. saveClaims must return undefined as returning no value.

    //expected
    expectedSendMessageObj.value.claimAccounts.workerjab1 = true;
    expectedSendMessageObj.value.claimRewards.workerjab1 = true;

    const result = await AutomatedTasksUtils.saveClaims(true, true, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: true,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: true,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith(expectedSendMessageObj);
    expect(result).toBeUndefined();
  });
  test('Passing (username, claimRewards = true, claimAccount = false) must return undefined and follow/pass the steps bellow', async () => {
    //expected steps:
    // 1. getAllClaimRewards will return undefined as no mocking values on this test.
    // 2. Call LocalStorageUtils.saveValueInLocalStorage 2 times.
    // 3. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimRewards', { workerjab1: true }
    // 4. Call LocalStorageUtils.saveValueInLocalStorage with parameters: 'claimAccounts', { workerjab1: false }
    // 5. Call chrome.runtime.sendMessage with the expected Object bellow.
    // 6. saveClaims must return undefined as returning no value.

    //expected
    expectedSendMessageObj.value.claimAccounts.workerjab1 = false;
    expectedSendMessageObj.value.claimRewards.workerjab1 = true;

    const result = await AutomatedTasksUtils.saveClaims(true, false, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: true,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith(expectedSendMessageObj);
    expect(result).toBeUndefined();
  });
  //mocking getAllClaimRewards, getAllClaimAccounts
  test('When mocking an existent claimAccount stored and Passing (claimRewards = true, claimAccount = false, username) must return undefined and add claimed reward value, to the username within existing obj', async () => {
    AutomatedTasksUtils.getAllClaimAccounts = jest.fn().mockResolvedValueOnce({
      quentin: true,
      aggroed: false,
    });
    AutomatedTasksUtils.getAllClaimRewards = jest
      .fn()
      .mockResolvedValueOnce(undefined);

    const result = await AutomatedTasksUtils.saveClaims(false, true, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: true,
      quentin: true,
      aggroed: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: {
          aggroed: false,
          quentin: true,
          workerjab1: true,
        },
        claimRewards: {
          workerjab1: false,
        },
      },
    });
    expect(result).toBeUndefined();
  });

  test('When mocking an existent claimAccount stored and Passing (claimRewards = false, claimAccount = false, username) must return undefined and add claimed reward value, to the username within existing obj', async () => {
    AutomatedTasksUtils.getAllClaimAccounts = jest.fn().mockResolvedValueOnce({
      workerjab1: true,
      quentin: true,
      aggroed: false,
    });
    AutomatedTasksUtils.getAllClaimRewards = jest
      .fn()
      .mockResolvedValueOnce(undefined);

    const result = await AutomatedTasksUtils.saveClaims(false, false, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: false,
      quentin: true,
      aggroed: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: {
          aggroed: false,
          quentin: true,
          workerjab1: false,
        },
        claimRewards: {
          workerjab1: false,
        },
      },
    });
    expect(result).toBeUndefined();
  });
  test('When mocking an existent claimRewards stored and Passing (claimRewards = true, claimAccount = false, username) must return undefined and add claimed account value, to the username within existing obj', async () => {
    AutomatedTasksUtils.getAllClaimAccounts = jest
      .fn()
      .mockResolvedValueOnce(undefined);
    AutomatedTasksUtils.getAllClaimRewards = jest.fn().mockResolvedValueOnce({
      aggroed: false,
      quentin: true,
    });

    const result = await AutomatedTasksUtils.saveClaims(true, false, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: true,
      aggroed: false,
      quentin: true,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: {
          workerjab1: false,
        },
        claimRewards: {
          workerjab1: true,
          aggroed: false,
          quentin: true,
        },
      },
    });
    expect(result).toBeUndefined();
  });
  test('When mocking an existent (claimRewards,claimAccounts) stored and Passing (claimRewards = true, claimAccount = true, username) must return undefined and add claimed account and reward values, to the username within existing obj', async () => {
    AutomatedTasksUtils.getAllClaimAccounts = jest.fn().mockResolvedValueOnce({
      aggroed: false,
      quentin: false,
    });
    AutomatedTasksUtils.getAllClaimRewards = jest.fn().mockResolvedValueOnce({
      aggroed: false,
      quentin: false,
    });

    const result = await AutomatedTasksUtils.saveClaims(true, true, username);
    expect(spyLocalStorageUtilsSaveValue).toHaveBeenCalledTimes(2);
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimRewards', {
      workerjab1: true,
      aggroed: false,
      quentin: false,
    });
    expect(spyLocalStorageUtilsSaveValue).toBeCalledWith('claimAccounts', {
      workerjab1: true,
      aggroed: false,
      quentin: false,
    });
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: {
          workerjab1: true,
          aggroed: false,
          quentin: false,
        },
        claimRewards: {
          workerjab1: true,
          aggroed: false,
          quentin: false,
        },
      },
    });
    expect(result).toBeUndefined();
  });
});

describe('initBackgroundClaims tests', () => {
  //let spyLocalStorageUtilsSaveValue: jest.SpyInstance;
  let spyChromeRuntimeSendMessage: jest.SpyInstance;
  let spyOnGetAllClaimRewards: jest.SpyInstance;
  let spyOnGetAllClaimAccounts: jest.SpyInstance;
  beforeEach(() => {
    spyChromeRuntimeSendMessage = jest.spyOn(chrome.runtime, 'sendMessage');
    spyOnGetAllClaimAccounts = jest.spyOn(
      AutomatedTasksUtils,
      'getAllClaimAccounts',
    );
    spyOnGetAllClaimRewards = jest.spyOn(
      AutomatedTasksUtils,
      'getAllClaimRewards',
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  //without mocking, will read undefined from getAllClaimRewards and getAllClaimAccounts
  test('On execution will call chrome.runtime.sendMessage after reading claim values and set values as undefined', async () => {
    const result = await AutomatedTasksUtils.initBackgroundClaims();
    expect(spyOnGetAllClaimAccounts).toBeCalledTimes(1);
    expect(spyOnGetAllClaimRewards).toBeCalledTimes(1);
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: undefined,
        claimRewards: undefined,
      },
    });
    expect(result).toBeUndefined();
  });
  //mocking stored values
  test('On execution will call chrome.runtime.sendMessage after reading claim values and set values as mocked', async () => {
    const mockClaimAccountsObj = {
      workerjab1: true,
      aggroed: true,
      quentin: true,
    };
    const mockClaimRewardsObj = {
      workerjab1: false,
      aggroed: false,
      quentin: false,
    };
    AutomatedTasksUtils.getAllClaimAccounts = jest
      .fn()
      .mockResolvedValueOnce(mockClaimAccountsObj);
    AutomatedTasksUtils.getAllClaimRewards = jest
      .fn()
      .mockResolvedValueOnce(mockClaimRewardsObj);
    const result = await AutomatedTasksUtils.initBackgroundClaims();
    expect(spyChromeRuntimeSendMessage).toBeCalledWith({
      command: 'updateClaims',
      value: {
        claimAccounts: mockClaimAccountsObj,
        claimRewards: mockClaimRewardsObj,
      },
    });
    expect(result).toBeUndefined();
  });
});

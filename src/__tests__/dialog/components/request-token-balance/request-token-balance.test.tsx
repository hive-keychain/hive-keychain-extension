import { render } from '@testing-library/react';
import React from 'react';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import requestTokenBalance from 'src/__tests__/utils-for-testing/data/props/dialog/request-token-balance';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
describe('request-token-balance tests:\n', () => {
  const { methods, mocks } = appMocks;
  const { props } = requestTokenBalance;
  methods.config();
  it.skip('Must show ---', async () => {
    //TODO: mock this function and keep testing.
    HiveEngineUtils.getUserBalance = jest.fn().mockResolvedValue(['eoooo']);
    render(<RequestTokenBalance {...props} />);
    await assertion.awaitFindText('yolo');
  });
});

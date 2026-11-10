import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RCDelegations } from 'src/popup/hive/pages/app-container/home/rc-delegations/rc-delegations.component';

const mockSetValue = jest.fn();

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (handler: unknown) => handler,
    setValue: mockSetValue,
    watch: jest.fn(() => ''),
  }),
}));

jest.mock(
  'src/common-ui/_containers/form-container/form-container.component',
  () => ({
    FormContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }),
);

jest.mock('src/common-ui/input/form-input.component', () => ({
  FormInputComponent: () => null,
}));

jest.mock('src/common-ui/button/operation-button.component', () => ({
  OperationButtonComponent: () => null,
}));

jest.mock(
  'src/popup/hive/pages/app-container/home/resources-section/resource-item/resource-item.component',
  () => ({
    ResourceItemComponent: () => null,
  }),
);

jest.mock('src/popup/hive/utils/rc-delegations.utils', () => ({
  RcDelegationsUtils: {
    getAllOutgoingDelegations: jest.fn(() => new Promise(() => undefined)),
    rcToGigaRc: jest.fn(() => ''),
    rcToHp: jest.fn(() => ''),
    hpToGigaRc: jest.fn((value: string) => `converted-${value}`),
  },
}));

describe('RCDelegations accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets preset values with Enter and Space', async () => {
    const user = userEvent.setup();
    const props = {
      activeAccount: {
        name: 'alice',
        keys: {},
        rc: {
          received_delegated_rc: 0,
          delegated_rc: 0,
          max_rc: 0,
          percentage: 100,
        },
      },
      currencyLabels: { hp: 'HP' },
      properties: {},
      setTitleContainerProperties: jest.fn(),
      setSuccessMessage: jest.fn(),
      setErrorMessage: jest.fn(),
      addToLoadingList: jest.fn(),
      removeFromLoadingList: jest.fn(),
      navigateToWithParams: jest.fn(),
      navigateTo: jest.fn(),
    } as unknown as React.ComponentProps<typeof RCDelegations>;
    render(<RCDelegations {...props} />);

    const tenHpButton = screen.getByRole('button', { name: '10 HP' });
    tenHpButton.focus();
    await user.keyboard('{Enter}');
    expect(mockSetValue).toHaveBeenCalledWith('gigaRcValue', 'converted-10');
    expect(mockSetValue).toHaveBeenCalledWith('hpValue', '10.000');

    const fiftyHpButton = screen.getByRole('button', { name: '50 HP' });
    fiftyHpButton.focus();
    await user.keyboard(' ');
    expect(mockSetValue).toHaveBeenCalledWith('gigaRcValue', 'converted-50');
    expect(mockSetValue).toHaveBeenCalledWith('hpValue', '50.000');
  });
});

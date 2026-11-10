import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  EvmTransactionWarningLevel,
  EvmTransactionWarningType,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmMultipleWarningsPopup } from 'src/dialog/evm/requests/transaction-warnings/warning-multiple-popup.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { I18nUtils } from 'src/utils/i18n.utils';

jest.mock('src/common-ui/popup-container/popup-container.component', () => ({
  PopupContainer: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
}));
jest.mock('src/common-ui/svg-icon/svg-icon.component', () => ({
  SVGIcon: () => null,
}));
jest.mock('src/common-ui/evm/evm-risk-warning/evm-risk-warning-row.component', () => ({
  EvmRiskWarningRow: ({ warning }: { warning: { message: string } }) => (
    <div>{warning.message}</div>
  ),
}));
jest.mock('src/common-ui/checkbox/checkbox-panel/checkbox-panel.component', () => ({
  BackgroundType: { TRANSPARENT: 'transparent' },
  CheckboxPanelComponent: ({ checked, onChange, title }: any) => (
    <label>
      {title}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  ),
}));
jest.mock('src/common-ui/input/input.component', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <input value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));
jest.mock('src/common-ui/button/button.component', () => ({
  __esModule: true,
  ButtonType: { ALTERNATIVE: 'alternative', IMPORTANT: 'important' },
  default: ({ label, disabled, onClick }: any) => (
    <button disabled={disabled} onClick={onClick}>
      {label}
    </button>
  ),
}));

const createHook = (
  message: string,
  level: EvmTransactionWarningLevel,
  type = EvmTransactionWarningType.BASE,
) => {
  const warning = { message, level, type, ignored: false };
  const field = { name: 'evm_operation_to', warnings: [warning] };
  return {
    getAllNotIgnoredWarnings: () => [warning],
    getFieldsForWarningsPopup: () => [field],
    whitelistLabels: {},
    setWhitelistLabelForWarning: jest.fn(),
    closePopup: jest.fn(),
    ignorePopupWarnings: jest.fn().mockResolvedValue(undefined),
  } as unknown as useTransactionHook;
};

it('reviews warnings from every call in one modal and acknowledges them together', async () => {
  jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key) => key);
  const first = createHook('first warning', EvmTransactionWarningLevel.HIGH);
  const second = createHook(
    'second warning',
    EvmTransactionWarningLevel.MEDIUM,
    EvmTransactionWarningType.WHITELIST_ADDRESS,
  );
  const onClose = jest.fn();
  render(
    <EvmMultipleWarningsPopup
      warningHooks={[first, second]}
      onClose={onClose}
    />,
  );
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('first warning')).toBeInTheDocument();
  expect(screen.getByText('second warning')).toBeInTheDocument();
  expect(screen.getAllByText('evm_batch_call')).toHaveLength(2);
  expect(screen.getByText('evm_send_transaction_ignore_warning')).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Trusted' } });
  expect(second.setWhitelistLabelForWarning).toHaveBeenCalledWith(
    'evm_operation_to',
    0,
    'Trusted',
  );
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByText('evm_send_transaction_ignore_warning'));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(first.ignorePopupWarnings).toHaveBeenCalledTimes(1);
  expect(second.ignorePopupWarnings).toHaveBeenCalledTimes(1);
});

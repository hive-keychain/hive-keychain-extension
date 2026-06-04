import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';
import Decimal from 'decimal.js';
import { SVGIcons } from 'src/common-ui/icons.enum';

import { I18nUtils } from 'src/utils/i18n.utils';
describe('GasFeePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  it('reports native token metadata failures through the existing error callback', async () => {
    const setErrorMessage = jest.fn();
    const onInitialEstimationComplete = jest.fn();
    const expectedError = {
      message: 'popup_html_evm_service_unavailable',
      params: [],
    };

    jest
      .spyOn(EvmTokensUtils, 'getMainTokenInfo')
      .mockRejectedValue(new Error('light node unavailable'));
    jest.spyOn(GasFeeUtils, 'estimate');
    jest.spyOn(EthersUtils, 'getErrorMessage').mockReturnValue(expectedError);

    render(
      <GasFeePanel
        chain={
          {
            chainId: '1',
            defaultTransactionType: EvmTransactionType.EIP_1559,
            mainToken: 'ETH',
            name: 'Ethereum',
          } as any
        }
        fromAddress="0x00000000000000000000000000000000000000aa"
        onInitialEstimationComplete={onInitialEstimationComplete}
        onSelectFee={jest.fn()}
        selectedFee={undefined}
        setErrorMessage={setErrorMessage}
        transactionData={{
          data: '0x',
          from: '0x00000000000000000000000000000000000000aa',
          to: '0x00000000000000000000000000000000000000bb',
          type: EvmTransactionType.EIP_1559,
          value: '0x0',
        }}
        transactionType={EvmTransactionType.EIP_1559}
      />,
    );

    await waitFor(() => expect(setErrorMessage).toHaveBeenCalledWith(expectedError));

    expect(onInitialEstimationComplete).toHaveBeenCalled();
    expect(GasFeeUtils.estimate).not.toHaveBeenCalled();
  });

  it('prefers the configured default fee level when it satisfies the multiplier', async () => {
    const onSelectFee = jest.fn();
    const lowFee = {
      type: EvmTransactionType.EIP_1559,
      estimatedFeeInEth: new Decimal('0.00042'),
      estimatedFeeUSD: new Decimal(1),
      maxFeeInEth: new Decimal('0.00063'),
      maxFeeUSD: new Decimal(1.5),
      estimatedMaxDuration: new Decimal(30),
      priorityFeeInGwei: new Decimal(1),
      maxFeePerGasInGwei: new Decimal(30),
      gasPriceInGwei: new Decimal(30),
      gasLimit: new Decimal(21000),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    };
    const aggressiveFee = {
      ...lowFee,
      estimatedFeeInEth: new Decimal('0.00084'),
      estimatedFeeUSD: new Decimal(2),
      maxFeeInEth: new Decimal('0.00126'),
      maxFeeUSD: new Decimal(3),
      estimatedMaxDuration: new Decimal(10),
      maxFeePerGasInGwei: new Decimal(45),
      icon: SVGIcons.EVM_GAS_FEE_HIGH,
      name: 'popup_html_evm_custom_gas_fee_aggressive',
    };

    jest.spyOn(GasFeeUtils, 'estimate').mockResolvedValue({
      suggested: lowFee,
      low: lowFee,
      aggressive: aggressiveFee,
      custom: {
        ...lowFee,
        estimatedFeeInEth: new Decimal(0),
        maxFeeInEth: new Decimal(0),
        estimatedMaxDuration: new Decimal(0),
        priorityFeeInGwei: new Decimal(0),
        maxFeePerGasInGwei: new Decimal(0),
        gasPriceInGwei: new Decimal(0),
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
        name: 'popup_html_evm_custom_gas_fee_custom',
      },
    });

    render(
      <GasFeePanel
        chain={
          {
            chainId: '1',
            defaultTransactionType: EvmTransactionType.EIP_1559,
            mainToken: 'ETH',
            name: 'Ethereum',
          } as any
        }
        defaultFeeLevel="aggressive"
        fromAddress="0x00000000000000000000000000000000000000aa"
        multiplier={1.5}
        onSelectFee={onSelectFee}
        prefetchedMainTokenInfo={
          {
            priceUsd: 2400,
            symbol: 'ETH',
            type: 'NATIVE',
          } as any
        }
        selectedFee={lowFee}
        setErrorMessage={jest.fn()}
        transactionData={{
          data: '0x',
          from: '0x00000000000000000000000000000000000000aa',
          to: '0x00000000000000000000000000000000000000bb',
          type: EvmTransactionType.EIP_1559,
          value: '0x0',
        }}
        transactionType={EvmTransactionType.EIP_1559}
      />,
    );

    await waitFor(() => expect(onSelectFee).toHaveBeenCalledWith(aggressiveFee));
  });

  it('uses a custom 50% fee bump when the preferred fee level is below the multiplier', async () => {
    const onSelectFee = jest.fn();
    const currentFee = {
      type: EvmTransactionType.EIP_1559,
      estimatedFeeInEth: new Decimal('0.00042'),
      estimatedFeeUSD: new Decimal(1),
      maxFeeInEth: new Decimal('0.00063'),
      maxFeeUSD: new Decimal(1.5),
      estimatedMaxDuration: new Decimal(30),
      baseFeePerGasInGwei: new Decimal(29),
      priorityFeeInGwei: new Decimal(1),
      maxFeePerGasInGwei: new Decimal(30),
      gasPriceInGwei: new Decimal(30),
      gasLimit: new Decimal(21000),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    };
    const aggressiveFee = {
      ...currentFee,
      maxFeePerGasInGwei: new Decimal(40),
      name: 'popup_html_evm_custom_gas_fee_aggressive',
    };

    jest.spyOn(GasFeeUtils, 'estimate').mockResolvedValue({
      suggested: currentFee,
      low: currentFee,
      aggressive: aggressiveFee,
      custom: {
        ...currentFee,
        estimatedFeeInEth: new Decimal(0),
        maxFeeInEth: new Decimal(0),
        estimatedMaxDuration: new Decimal(0),
        priorityFeeInGwei: new Decimal(0),
        maxFeePerGasInGwei: new Decimal(0),
        gasPriceInGwei: new Decimal(0),
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
        name: 'popup_html_evm_custom_gas_fee_custom',
      },
    });

    render(
      <GasFeePanel
        chain={
          {
            chainId: '1',
            defaultTransactionType: EvmTransactionType.EIP_1559,
            mainToken: 'ETH',
            name: 'Ethereum',
          } as any
        }
        defaultFeeLevel="aggressive"
        fromAddress="0x00000000000000000000000000000000000000aa"
        multiplier={1.5}
        onSelectFee={onSelectFee}
        prefetchedMainTokenInfo={
          {
            priceUsd: 2400,
            symbol: 'ETH',
            type: 'NATIVE',
          } as any
        }
        selectedFee={currentFee}
        setErrorMessage={jest.fn()}
        transactionData={{
          data: '0x',
          from: '0x00000000000000000000000000000000000000aa',
          to: '0x00000000000000000000000000000000000000bb',
          type: EvmTransactionType.EIP_1559,
          value: '0x0',
        }}
        transactionType={EvmTransactionType.EIP_1559}
      />,
    );

    await waitFor(() =>
      expect(onSelectFee).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
          name: 'popup_html_evm_custom_gas_fee_custom',
          maxFeePerGasInGwei: new Decimal(45),
          priorityFeeInGwei: new Decimal(1.5),
        }),
      ),
    );
  });

  it('saves a custom fee even when native token USD price is unavailable', async () => {
    const onSelectFee = jest.fn();
    const selectedFee = {
      type: EvmTransactionType.EIP_1559,
      estimatedFeeInEth: new Decimal('0.00042'),
      estimatedFeeUSD: new Decimal(0),
      maxFeeInEth: new Decimal('0.00063'),
      maxFeeUSD: new Decimal(0),
      estimatedMaxDuration: new Decimal(30),
      priorityFeeInGwei: new Decimal(1),
      maxFeePerGasInGwei: new Decimal(30),
      gasPriceInGwei: new Decimal(30),
      gasLimit: new Decimal(21000),
      icon: SVGIcons.EVM_GAS_FEE_LOW,
      name: 'popup_html_evm_custom_gas_fee_low',
    };

    jest.spyOn(GasFeeUtils, 'estimate').mockResolvedValue({
      suggested: selectedFee,
      low: selectedFee,
      custom: {
        ...selectedFee,
        estimatedFeeInEth: new Decimal(0),
        maxFeeInEth: new Decimal(0),
        estimatedMaxDuration: new Decimal(0),
        priorityFeeInGwei: new Decimal(0),
        maxFeePerGasInGwei: new Decimal(0),
        gasPriceInGwei: new Decimal(0),
        icon: SVGIcons.EVM_GAS_FEE_CUSTOM,
        name: 'popup_html_evm_custom_gas_fee_custom',
      },
      extraInfo: {
        baseFee: {
          estimated: '20',
          baseFeeRange: { min: '10', max: '30' },
        },
        priorityFee: {
          latest: { min: '1', max: '2' },
          history: { min: '1', max: '3' },
        },
        trends: { baseFee: 'up' as any, priorityFee: 'down' as any },
      },
    });

    render(
      <GasFeePanel
        chain={
          {
            chainId: '1',
            defaultTransactionType: EvmTransactionType.EIP_1559,
            isCustom: true,
            mainToken: 'ETH',
            name: 'Ethereum',
          } as any
        }
        fromAddress="0x00000000000000000000000000000000000000aa"
        onSelectFee={onSelectFee}
        prefetchedMainTokenInfo={
          {
            symbol: 'ETH',
            type: 'NATIVE',
          } as any
        }
        selectedFee={selectedFee}
        setErrorMessage={jest.fn()}
        transactionData={{
          data: '0x',
          from: '0x00000000000000000000000000000000000000aa',
          to: '0x00000000000000000000000000000000000000bb',
          type: EvmTransactionType.EIP_1559,
          value: '0x0',
        }}
        transactionType={EvmTransactionType.EIP_1559}
      />,
    );

    await waitFor(() => expect(GasFeeUtils.estimate).toHaveBeenCalled());

    fireEvent.click(screen.getByText('popup_html_evm_gas_fee', { exact: false }));
    fireEvent.click(screen.getByText('popup_html_operation_button_save'));

    expect(onSelectFee).toHaveBeenLastCalledWith(
      expect.objectContaining({
        name: 'popup_html_evm_custom_gas_fee_custom',
        maxFeeUSD: new Decimal(0),
      }),
    );
  });

  it('shows the panel with fallback custom fee when estimate fails', async () => {
    const setErrorMessage = jest.fn();
    const expectedError = {
      message: 'popup_html_evm_service_unavailable',
      params: [],
    };

    jest
      .spyOn(GasFeeUtils, 'estimate')
      .mockRejectedValue(new Error('estimation unavailable'));
    jest.spyOn(EthersUtils, 'getErrorMessage').mockReturnValue(expectedError);
    const transactionData = {
      data: '0x',
      from: '0x00000000000000000000000000000000000000aa',
      to: '0x00000000000000000000000000000000000000bb',
      type: EvmTransactionType.EIP_1559,
      value: '0x0',
    };

    const onSelectFeeSpy = jest.fn();
    const ControlledPanel = () => {
      const [selectedFee, setSelectedFee] = React.useState<any>();
      return (
        <GasFeePanel
          chain={
            {
              chainId: '1',
              defaultTransactionType: EvmTransactionType.EIP_1559,
              mainToken: 'ETH',
              name: 'Ethereum',
            } as any
          }
          fromAddress="0x00000000000000000000000000000000000000aa"
          onSelectFee={(fee) => {
            onSelectFeeSpy(fee);
            setSelectedFee(fee);
          }}
          prefetchedMainTokenInfo={
            {
              priceUsd: 2400,
              symbol: 'ETH',
              type: 'NATIVE',
            } as any
          }
          selectedFee={selectedFee}
          setErrorMessage={setErrorMessage}
          transactionData={transactionData}
          transactionType={EvmTransactionType.EIP_1559}
        />
      );
    };

    render(
      <ControlledPanel />,
    );

    await waitFor(() =>
      expect(onSelectFeeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'popup_html_evm_custom_gas_fee_custom',
          gasLimit: new Decimal(21000),
        }),
      ),
    );
    expect(
      screen.getByText('popup_html_evm_gas_fee', { exact: false }),
    ).toBeTruthy();
    expect(setErrorMessage).toHaveBeenCalledWith(expectedError);
  });
});

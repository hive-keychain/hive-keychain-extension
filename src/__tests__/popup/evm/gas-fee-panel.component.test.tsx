import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { EvmTransactionType } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeePanel } from '@popup/evm/pages/home/gas-fee-panel/gas-fee-panel.component';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { GasFeeUtils } from '@popup/evm/utils/gas-fee.utils';

describe('GasFeePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

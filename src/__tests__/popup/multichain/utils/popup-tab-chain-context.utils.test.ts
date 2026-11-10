import {
  PopupTabChainContextUtils,
} from '@popup/multichain/utils/popup-tab-chain-context.utils';

describe('popup tab chain context utils', () => {
  beforeEach(() => {
    PopupTabChainContextUtils.clearTabInferredChain();
  });

  it('stores and reads a tab-inferred chain id until cleared', () => {
    PopupTabChainContextUtils.setTabInferredChainId('0x2105');

    expect(PopupTabChainContextUtils.getTabInferredChainId()).toBe('0x2105');
    expect(
      PopupTabChainContextUtils.isCurrentChainTabInferred({
        chainId: '0x2105',
        name: 'Base',
        type: 'EVM',
        logo: '',
        rpcs: [],
      }),
    ).toBe(true);

    PopupTabChainContextUtils.clearTabInferredChain();

    expect(PopupTabChainContextUtils.getTabInferredChainId()).toBeNull();
  });
});

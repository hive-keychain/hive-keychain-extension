import { KeychainApi } from '@api/keychain';
import {
  EvmLightNodeUtils,
  evmChainIdToDecimalPathSegment,
} from '@popup/evm/utils/evm-light-node.utils';

describe('evm-light-node.utils tests:\n', () => {
  it('uses decimal chain id in light-node URLs when chainId is hex', async () => {
    const getSpy = jest.spyOn(KeychainApi, 'get').mockResolvedValue({});
    await EvmLightNodeUtils.getGasFee('0x89');
    expect(getSpy).toHaveBeenCalledWith('evm/light-node/gas-fee/137');
  });

  it('evmChainIdToDecimalPathSegment maps hex and decimal strings', () => {
    expect(evmChainIdToDecimalPathSegment('0x1')).toBe('1');
    expect(evmChainIdToDecimalPathSegment('137')).toBe('137');
    expect(evmChainIdToDecimalPathSegment(56)).toBe('56');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('returns the proxy target abi when backend marks the contract as a proxy', async () => {
    const proxyAddress = '0x00000000000000000000000000000000000000aa';
    const targetAddress = '0x00000000000000000000000000000000000000bb';
    const targetAbi = [{ type: 'function', name: 'approve', inputs: [] }];
    const getSpy = jest
      .spyOn(KeychainApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: proxyAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: targetAddress,
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: targetAbi,
        address: targetAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    const abi = await EvmLightNodeUtils.getAbi('1', proxyAddress);

    expect(abi).toEqual(targetAbi);
    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      `evm/light-node/contract/1/${encodeURIComponent(proxyAddress)}`,
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      `evm/light-node/contract/1/${encodeURIComponent(targetAddress)}`,
    );
  });

  it('returns null when the proxy target has no abi', async () => {
    jest
      .spyOn(KeychainApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: '0x00000000000000000000000000000000000000aa',
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: '0x00000000000000000000000000000000000000bb',
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: null,
        address: '0x00000000000000000000000000000000000000bb',
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    await expect(
      EvmLightNodeUtils.getAbi('1', '0x00000000000000000000000000000000000000aa'),
    ).resolves.toBeNull();
  });

  it('normalizes structured proxy target payloads before resolving abi', async () => {
    const proxyAddress = '0x00000000000000000000000000000000000000aa';
    const targetAddress = '0x00000000000000000000000000000000000000bb';
    const targetAbi = [{ type: 'function', name: 'approve', inputs: [] }];
    const getSpy = jest
      .spyOn(KeychainApi, 'get')
      .mockResolvedValueOnce({
        abi: [{ type: 'function', name: 'fallback', inputs: [] }],
        address: proxyAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 1,
        isProxy: true,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: { target: targetAddress },
        verified: true,
      })
      .mockResolvedValueOnce({
        abi: targetAbi,
        address: targetAddress,
        chainId: 1,
        contractType: 'ERC20',
        firstSeenBlock: 1,
        id: 2,
        isProxy: false,
        lastSeenBlock: null,
        metadata: null,
        possibleSpam: false,
        price: null,
        proxyTarget: null,
        verified: true,
      });

    await expect(EvmLightNodeUtils.getAbi('1', proxyAddress)).resolves.toEqual(
      targetAbi,
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      `evm/light-node/contract/1/${encodeURIComponent(targetAddress)}`,
    );
  });

  it('returns the contract abi directly when the contract is not a proxy', async () => {
    const abi = [{ type: 'function', name: 'transfer', inputs: [] }];
    jest.spyOn(KeychainApi, 'get').mockResolvedValue({
      abi,
      address: '0x00000000000000000000000000000000000000cc',
      chainId: 1,
      contractType: 'ERC20',
      firstSeenBlock: 1,
      id: 3,
      isProxy: false,
      lastSeenBlock: null,
      metadata: null,
      possibleSpam: false,
      price: null,
      proxyTarget: null,
      verified: true,
    });

    await expect(
      EvmLightNodeUtils.getAbi('1', '0x00000000000000000000000000000000000000cc'),
    ).resolves.toEqual(abi);
  });
});

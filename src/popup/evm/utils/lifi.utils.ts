import { KeychainApi } from '@api/keychain';
import { OptionItem } from '@common-ui/custom-select/custom-select.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';

const getLiFiSwapOptionLists = async (): Promise<{
  tokens: OptionItem[];
  chains: OptionItem[];
}> => {
  const data = await KeychainApi.get(`evm/lifi/data`);
  const tokensOptions: OptionItem[] = [];
  const chainsOptions: OptionItem[] = [
    {
      label: 'All',
      value: '*',
      img: SVGIcons.HIVE_ENGINE,
      key: 'all-chains',
    },
  ];
  for (const chainId of Object.keys(data.tokens)) {
    const chain = data.chains.find((chain: any) => {
      return chain.id.toString() === chainId.toString();
    });
    if (chain) {
      if (data.tokens[chainId].length > 0) {
        chainsOptions.push({
          label: chain.name,
          value: chain,
          img: chain.logoURI,
          key: `chain-${chainId}`,
        });
        for (const token of data.tokens[chainId]) {
          tokensOptions.push({
            label: token.symbol,
            subLabel: token.name,
            subLabelHover: EvmFormatUtils.formatAddress(token.address),
            value: token,
            img: token.logoURI,
            imgChip: chain.logoURI,
            key: `${chainId}-${token.address}`,
          });
        }
      }
    }
  }
  tokensOptions.sort((a, b) => b.value.fdvUSD - a.value.fdvUSD);
  return { tokens: tokensOptions, chains: chainsOptions };
};

export const LiFiUtils = {
  getLiFiSwapOptionLists,
};

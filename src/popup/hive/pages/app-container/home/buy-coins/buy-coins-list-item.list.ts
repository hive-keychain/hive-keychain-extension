import { Exchange, ExchangesUtils } from 'hive-keychain-commons';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { BuyCoinType } from 'src/popup/hive/pages/app-container/home/buy-coins/buy-coin-type.enum';

interface Platform {
  name: string;
  image: SVGIcons;
  link: string;
  description: string;
}

interface BuyCoinsListItemInterface {
  list: Platform[];
  exchanges: Exchange[];
}

export const BuyCoinsListItem = (
  type: BuyCoinType,
  username: string,
): BuyCoinsListItemInterface => {
  switch (type) {
    case BuyCoinType.BUY_HIVE:
      return {
        list: [
          // {
          //   name: 'Transak',
          //   image: SVGIcons.BUY_TRANSAK,
          //   link: `https://global.transak.com?apiKey=${Config.transak.apiKey}&defaultCryptoCurrency=HIVE&exchangeScreenTitle=Buy%20HIVEs&isFeeCalculationHidden=true&walletAddress=${username}`,
          //   description: 'html_popup_transak_description',
          // },
          // {
          //   name: 'Blocktrades',
          //   image: 'blocktrades.svg',
          //   link: `https://blocktrades.us/en/trade?affiliate_id=dfccdbcb-6093-4e4a-992d-689bf46e2523&input_coin_type=btc&output_coin_type=hive&output_coin_amount=10&receive_address=${username}`,
          //   description: 'html_popup_blocktrades_description',
          // },
        ],
        exchanges: ExchangesUtils.getExchanges().filter((exchange) =>
          exchange.acceptedCoins?.includes('HIVE'),
        ),
      };
    case BuyCoinType.BUY_HDB:
      return {
        list: [
          // {
          //   name: 'Blocktrades',
          //   image: 'blocktrades.svg',
          //   link: `https://blocktrades.us/en/trade?affiliate_id=dfccdbcb-6093-4e4a-992d-689bf46e2523&input_coin_type=btc&output_coin_type=hbd&output_coin_amount=10&receive_address=${username}`,
          //   description: 'html_popup_blocktrades_description',
          // },
        ],
        exchanges: ExchangesUtils.getExchanges().filter((exchange) =>
          exchange.acceptedCoins?.includes('HBD'),
        ),
      };
  }
};

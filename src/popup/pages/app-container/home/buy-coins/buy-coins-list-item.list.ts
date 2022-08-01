import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import Config from 'src/config';

export const BuyCoinsListItem = (type: BuyCoinType, username: string) => {
  switch (type) {
    case BuyCoinType.BUY_HIVE:
      return {
        list: [
          {
            name: 'Transak',
            image: 'transak.svg',
            link: `https://global.transak.com?apiKey=${Config.transak.apiKey}&defaultCryptoCurrency=HIVE&exchangeScreenTitle=Buy%20HIVEs&isFeeCalculationHidden=true&walletAddress=${username}`,
            description: 'html_popup_transak_description',
          },
          {
            name: 'Blocktrades',
            image: 'blocktrades.svg',
            link: `https://blocktrades.us/en/trade?affiliate_id=dfccdbcb-6093-4e4a-992d-689bf46e2523&input_coin_type=btc&output_coin_type=hive&output_coin_amount=10&receive_address=${username}`,
            description: 'html_popup_blocktrades_description',
          },
        ],
        exchanges: [
          // {
          //   image: 'bittrex.png',
          //   link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
          // },
          {
            image: 'binance.svg',
            link: 'https://www.binance.com/en/trade/HIVE_BTC',
          },
          {
            image: 'ionomy.svg',
            link: 'https://exchange.ionomy.com/en/markets/btc-hive',
          },
          {
            image: 'huobi.svg',
            link: 'https://www.huobi.com/en-us/exchange/hive_usdt/',
          },
          {
            image: 'mexc.svg',
            link: 'https://www.mexc.com/exchange/HIVE_USDT',
          },
          {
            image: 'probit.png',
            link: 'https://www.probit.com/app/exchange/HIVE-USDT',
          },
          {
            image: 'cryptex24.svg',
            link: 'https://www.cryptex24.io/trade/HIVE&USDT',
          },
        ],
      };
    case BuyCoinType.BUY_HDB:
      return {
        list: [
          {
            name: 'Blocktrades',
            image: 'blocktrades.svg',
            link: `https://blocktrades.us/en/trade?affiliate_id=dfccdbcb-6093-4e4a-992d-689bf46e2523&input_coin_type=btc&output_coin_type=hbd&output_coin_amount=10&receive_address=${username}`,
            description: 'html_popup_blocktrades_description',
          },
        ],
        exchanges: [
          // {
          //   image: 'bittrex.png',
          //   link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
          // },
          {
            image: 'ionomy.svg',
            link: 'https://exchange.ionomy.com/en/markets/btc-hbd',
          },
          {
            image: 'cryptex24.svg',
            link: 'https://www.cryptex24.io/trade/HBD&USDT',
          },
        ],
      };
  }
};

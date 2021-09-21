import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';

export const BuyCoinsListItem = (type: BuyCoinType) => {
  switch (type) {
    case BuyCoinType.BUY_HIVE:
      return [
        {
          categoryLabel: 'popup_html_buy_moonpay_title',
          items: [
            {
              image: 'moonpay.png',
              link: 'https://buy.moonpay.io/?apiKey=pk_live_aT4LSjpZc2LEPe8dVyBzVQhImGOT3OZ&currencyCode=HIVE',
            },
          ],
        },
        {
          categoryLabel: 'popup_html_buy_swap_title',
          items: [
            {
              image: 'blocktrades.png',
              link: 'https://blocktrades.us/en/trade',
            },
          ],
        },
        {
          categoryLabel: 'popup_html_buy_exchanges_title',
          items: [
            {
              image: 'bittrex.png',
              link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
            },
            {
              image: 'binance.png',
              link: 'https://www.binance.com/en/trade/HIVE_BTC',
            },
            {
              image: 'ionomy.png',
              link: 'https://ionomy.com/en/markets/btc-hive',
            },
            {
              image: 'huobi.png',
              link: 'https://www.huobi.com/en-us/exchange/hive_usdt/',
            },
            { image: 'mxc.png', link: 'https://www.mexc.com/#HIVE_USDT' },
            {
              image: 'probit.png',
              link: 'https://www.probit.com/app/exchange/HIVE-USDT',
            },
            {
              image: 'cryptex24.png',
              link: 'https://www.cryptex24.io/trade/HIVE&USDT',
            },
          ],
        },
      ];
    case BuyCoinType.BUY_HDB:
      return [
        {
          categoryLabel: 'popup_html_buy_swap_title',
          items: [
            {
              image: 'blocktrades.png',
              link: 'https://blocktrades.us/en/trade',
            },
          ],
        },
        {
          categoryLabel: 'popup_html_buy_exchanges_title',
          items: [
            {
              image: 'bittrex.png',
              link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
            },
            {
              image: 'ionomy.png',
              link: 'https://ionomy.com/en/markets/btc-hive',
            },
            {
              image: 'cryptex24.png',
              link: 'https://www.cryptex24.io/trade/HIVE&USDT',
            },
          ],
        },
      ];
  }
};

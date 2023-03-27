import { BuyCoinType } from '@popup/pages/app-container/home/buy-coins/buy-coin-type.enum';
import Config from 'src/config';

interface Exchange {
  name: string;
  image: string;
  link: string;
  username: string;
  acceptedCoins: string[];
}

export const exchanges = [
  {
    name: 'Binance',
    image: 'binance.svg',
    link: 'https://www.binance.com/en/trade/HIVE_BTC',
    username: 'deepcrypto8',
    acceptedCoins: ['HIVE'],
  },
  {
    name: 'Upbit',
    image: 'upbit.svg',
    link: 'https://id.upbit.com/exchange?code=CRIX.UPBIT.BTC-HIVE',
    username: 'user.dunamu',
    acceptedCoins: ['HIVE', 'HBD'],
  },
  {
    name: 'Gateio',
    image: 'gateio.svg',
    link: 'https://www.gate.io/trade/HIVE_USDT',
    username: 'gateiodeposit',
    acceptedCoins: ['HIVE'],
  },
  // { image: 'bkex.png', link: 'https://www.bkex.com/trade/HIVE_USDT' },
  // {
  //   image: 'bithumb.png',
  //   link: 'https://en.bithumb.com/trade/order/HIVE_KRW',
  // },
  {
    name: 'Ionomy',
    image: 'ionomy.svg',
    link: 'https://exchange.ionomy.com/en/markets/btc-hive',
    username: 'ionomy',
    acceptedCoins: ['HIVE', 'HBD'],
  },
  {
    name: 'Huobi',
    image: 'huobi.svg',
    link: 'https://www.huobi.com/en-us/exchange/hive_usdt/',
    username: 'huobi-pro',
    acceptedCoins: ['HIVE'],
  },
  {
    name: 'Mexc',
    image: 'mexc.svg',
    link: 'https://www.mexc.com/exchange/HIVE_USDT',
    username: 'mxchive',
    acceptedCoins: ['HIVE'],
  },
  {
    name: 'Probit',
    image: 'probit.png',
    link: 'https://www.probit.com/app/exchange/HIVE-USDT',
    username: 'probithive',
    acceptedCoins: ['HIVE'],
  },
  // {
  //   image: 'bittrex.png',
  //   link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
  //   username: 'bittrex',
  //   acceptedCoins: ["HIVE", "HBD"]
  // },
];

interface Platform {
  name: string;
  image: string;
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
        exchanges: exchanges.filter((exchange) => {
          exchange.acceptedCoins?.includes('HIVE');
        }),
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
        exchanges: exchanges.filter((exchange) => {
          exchange.acceptedCoins?.includes('HBD');
        }),
      };
  }
};

import { SVGIcons } from 'src/common-ui/icons.enum';

interface Exchange {
  name: string;
  image: SVGIcons;
  link: string;
  username: string;
  acceptedCoins: string[];
}

export const exchanges: Exchange[] = [
  {
    name: 'Binance',
    image: SVGIcons.BUY_BINANCE,
    link: 'https://www.binance.com/en/trade/HIVE_BTC?ref=39968277',
    username: 'bdhivesteem',
    acceptedCoins: ['HIVE'],
  },
  {
    name: 'Upbit',
    image: SVGIcons.BUY_UPBIT,
    link: 'https://id.upbit.com/exchange?code=CRIX.UPBIT.BTC-HIVE&ref=R64298',
    username: 'user.dunamu',
    acceptedCoins: ['HIVE', 'HBD'],
  },
  {
    name: 'Gateio',
    image: SVGIcons.BUY_GATEIO,
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
    image: SVGIcons.BUY_IONOMY,
    link: 'https://exchange.ionomy.com/en/markets/btc-hive',
    username: 'ionomy',
    acceptedCoins: ['HIVE', 'HBD'],
  },
  {
    name: 'Huobi',
    image: SVGIcons.BUY_HUOBI,
    link: 'https://www.huobi.com/en-us/exchange/hive_usdt/',
    username: 'huobi-pro',
    acceptedCoins: ['HIVE'],
  },
  {
    name: 'Mexc',
    image: SVGIcons.BUY_MEXC,
    link: 'https://www.mexc.com/exchange/HIVE_USDT',
    username: 'mxchive',
    acceptedCoins: ['HIVE'],
  },
  // {
  //   name: 'Probit',
  //   image: NewIcons.PROBIT,
  //   link: 'https://www.probit.com/app/exchange/HIVE-USDT',
  //   username: 'probithive',
  //   acceptedCoins: ['HIVE'],
  // },
  // {
  //   image: 'bittrex.png',
  //   link: 'https://global.bittrex.com/Market/Index?MarketName=BTC-HIVE',
  //   username: 'bittrex',
  //   acceptedCoins: ["HIVE", "HBD"]
  // },
];

export const getExchangeListItems = (): Exchange[] => {
  return exchanges.filter((exchange) =>
    exchange.acceptedCoins?.includes('HIVE'),
  );
};

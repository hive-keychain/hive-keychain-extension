import { TokenMarket } from '@interfaces/tokens.interface';

const all = [
  {
    _id: 1,
    symbol: 'BEE',
    volume: '2237.88804278',
    volumeExpiration: 1658411856,
    lastPrice: '0.50284298',
    lowestAsk: '0.50676996',
    highestBid: '0.50687713',
    lastDayPrice: '0.49800001',
    lastDayPriceExpiration: 1658338404,
    priceChangeHive: '0.00484297',
    priceChangePercent: '0.97%',
  },
  {
    _id: 2,
    symbol: 'SWAP.BTC',
    volume: '13712.41865565',
    volumeExpiration: 1658412219,
    lastPrice: '51095.80974378',
    lowestAsk: '51095.80974324',
    highestBid: '48005.54937979',
    lastDayPrice: '49933.95500287',
    lastDayPriceExpiration: 1658368026,
    priceChangeHive: '1161.85474091',
    priceChangePercent: '2.33%',
  },
  {
    _id: 3,
    symbol: 'ORB',
    volume: '510.00000000',
    volumeExpiration: 1656404145,
    lastPrice: '170.00000000',
    lowestAsk: '165.00000000',
    highestBid: '92.01000000',
    lastDayPrice: '170.00000000',
    lastDayPriceExpiration: 1656404145,
    priceChangeHive: '0',
    priceChangePercent: '0%',
  },
] as TokenMarket[];

export default { all };

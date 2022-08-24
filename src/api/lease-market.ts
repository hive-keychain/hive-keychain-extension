import axios from 'axios';

const KeychainLeaseMarketApi = axios.create({
  baseURL:
    process.env.LEASE_MARKET_API_DEV === 'true'
      ? 'http://localhost:3001/'
      : 'https://api.hive-keychain.com/',
});

export default KeychainLeaseMarketApi;

import axios from 'axios';

const KeychainApi = axios.create({
  baseURL:
    process.env.KEYCHAIN_API_DEV === 'true'
      ? 'http://localhost:3000/'
      : 'https://api.hive-keychain.com/',
});

export default KeychainApi;

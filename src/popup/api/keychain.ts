import axios from 'axios';

const KeychainApi = axios.create({
  baseURL: 'https://api.hive-keychain.com/',
});

export default KeychainApi;

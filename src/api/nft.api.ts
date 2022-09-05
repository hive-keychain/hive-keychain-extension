import axios from 'axios';
import Config from 'src/config';

const SplinterlandsApi = axios.create({
  baseURL: Config.nft.splinterlands.baseApi,
});

export const NftApis = {
  SplinterlandsApi,
};

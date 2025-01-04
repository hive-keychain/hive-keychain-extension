import { BaseApi } from 'src/api/base';

const get = async (url: string): Promise<any> => {
  return await BaseApi.get(url);
};

const getURI = async (uri: string) => {
  const res = await get(`https://ipfs.io/ipfs/${uri}`);
  return res;
};

export const IPFSApi = {
  getURI,
};

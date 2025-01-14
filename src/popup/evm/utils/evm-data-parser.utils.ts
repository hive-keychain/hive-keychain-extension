import { BaseApi } from 'src/api/base';

const getMethodFromSignature = async (signature: string) => {
  const fourByteResponse = await BaseApi.get(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}`,
  );
  fourByteResponse.results.sort((a: any, b: any) => {
    return new Date(a.created_at).getTime() < new Date(b.created_at).getTime()
      ? -1
      : 1;
  });

  return fourByteResponse.results[0].text_signature;
};

export const EvmDataParser = {
  getMethodFromSignature,
};

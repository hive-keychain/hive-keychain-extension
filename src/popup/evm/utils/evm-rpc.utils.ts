const call = async (method: string, params: any[], rpcUrl: string) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
  });
  const parsedBody = JSON.parse(body);

  console.log(method, params, body, parsedBody);
  const response = await fetch(rpcUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
    }),
  });
  console.log({ response }, response.body, await response.json());

  return response;
};

export const EvmRpcUtils = {
  call,
};

const call = async (method: string, params: any[], rpcUrl: string) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    method: method,
    params: params,
  });

  return await new Promise((resolve, reject) => {
    try {
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res: any) => {
          return res.json();
        })
        .then((res: any) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const EvmRpcUtils = {
  call,
};

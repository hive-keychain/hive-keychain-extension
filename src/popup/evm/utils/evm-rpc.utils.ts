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
          if (res && res.status === 200) {
            return res.json();
          }
        })
        .then((res: any) => {
          console.log({ res });
          resolve(res);
        })
        .catch((err) => {
          console.log({ err });
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

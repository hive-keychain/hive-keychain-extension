const get = async (url: string): Promise<any> => {
  const baseURL =
    process.env.KEYCHAIN_API_DEV === 'true'
      ? 'http://localhost:5000'
      : 'https://api.hive-keychain.com';
  return await new Promise((resolve, reject) => {
    try {
      fetch(`${baseURL}/${url}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          }
        })
        .then((res) => {
          resolve({ data: res });
        })
        .catch((err) => {
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const KeychainApi = {
  get,
};

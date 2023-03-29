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

const post = async (url: string, body: any): Promise<any> => {
  const baseURL =
    process.env.KEYCHAIN_API_DEV === 'true'
      ? 'http://localhost:5000'
      : 'https://api.hive-keychain.com';
  return await new Promise((resolve, reject) => {
    try {
      fetch(`${baseURL}/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((res) => {
          if (res && res.status === 200) {
            return res.json();
          }
        })
        .then((res) => {
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

export const KeychainApi = {
  get,
  post,
};

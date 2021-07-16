const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader?.result?.toString();
      if (result) {
        resolve(result.split(',')[1]);
      } else reject('Error');
    };
    reader.onerror = (error) => reject(error);
  });

const FileUtils = {
  toBase64,
};

export default FileUtils;

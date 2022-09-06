/* istanbul ignore next */
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
/* istanbul ignore next */
const FileUtils = {
  toBase64,
};
/* istanbul ignore next */
export default FileUtils;
